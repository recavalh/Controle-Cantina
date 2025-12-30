import React, { createContext, useContext, useState, useEffect } from 'react';

const CantinaContext = createContext();

export const useCantina = () => {
    const context = useContext(CantinaContext);
    if (!context) {
        throw new Error('useCantina must be used within a CantinaProvider');
    }
    return context;
};

export const CantinaProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('cantina_current_user');
        return saved ? JSON.parse(saved) : { role: 'admin' }; // 'admin', 'wizard', 'wizkids'
    });

    useEffect(() => {
        localStorage.setItem('cantina_current_user', JSON.stringify(currentUser));
    }, [currentUser]);

    const login = (role) => {
        setCurrentUser({ role });
    };

    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('cantina_students');
        return saved ? JSON.parse(saved) : [];
    });

    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('cantina_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('cantina_products');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cantina_students', JSON.stringify(students));
    }, [students]);

    useEffect(() => {
        localStorage.setItem('cantina_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('cantina_products', JSON.stringify(products));
    }, [products]);

    const addStudent = (name, school = 'Wizard') => {
        const newStudent = {
            id: crypto.randomUUID(),
            name,
            school, // 'Wizard' or 'WizKids'
            balance: 0,
            active: true,
            createdAt: new Date().toISOString()
        };
        setStudents(prev => [...prev, newStudent]);
        return newStudent;
    };

    const toggleStudentStatus = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    };

    const addFunds = (studentId, amount, method = 'DINHEIRO') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;

        const student = students.find(s => s.id === studentId);
        if (!student) return false;

        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, balance: s.balance + numAmount };
            }
            return s;
        }));

        const transaction = {
            id: crypto.randomUUID(),
            studentId,
            studentName: student.name, // Snapshot name
            type: 'DEPOSIT',
            amount: numAmount,
            method, // 'DINHEIRO', 'CARTAO', 'PIX'
            date: new Date().toISOString()
        };
        setTransactions(prev => [transaction, ...prev]);
        return true;
    };

    const addProduct = ({ name, price, costPrice, supplier, category, initialStock = 0, minStock = 5, school = 'Wizard' }) => {
        const newProduct = {
            id: crypto.randomUUID(),
            name,
            price: parseFloat(price),
            costPrice: parseFloat(costPrice) || 0,
            supplier,
            category: category || 'Outros',
            stock: parseInt(initialStock),
            minStock: parseInt(minStock),
            school, // 'Wizard' or 'WizKids'
            createdAt: new Date().toISOString()
        };
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
    };

    const restockProduct = (productId, quantity) => {
        const amount = parseInt(quantity);
        if (isNaN(amount) || amount <= 0) return false;

        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                return { ...p, stock: p.stock + amount };
            }
            return p;
        }));
        return true;
    };

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('cantina_settings');
        return saved ? JSON.parse(saved) : { operationalTaxRate: 15 }; // Default 15%
    });

    useEffect(() => {
        localStorage.setItem('cantina_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('cantina_invoices');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cantina_invoices', JSON.stringify(invoices));
    }, [invoices]);

    const bulkRestockProducts = (items, invoiceData) => {
        // items: [{ id, quantity }]
        // invoiceData: { supplier, invoiceNumber }
        setProducts(prev => prev.map(p => {
            const item = items.find(i => i.id === p.id);
            if (item) {
                const amount = parseInt(item.quantity);
                if (!isNaN(amount) && amount > 0) {
                    return { ...p, stock: p.stock + amount };
                }
            }
            return p;
        }));

        if (invoiceData) {
            const newInvoice = {
                id: crypto.randomUUID(),
                supplier: invoiceData.supplier,
                number: invoiceData.invoiceNumber,
                date: new Date().toISOString(),
                items: items.map(i => {
                    const product = products.find(p => p.id === i.id);
                    return {
                        productId: i.id,
                        quantity: i.quantity,
                        productName: product ? product.name : 'Desconhecido'
                    };
                })
            };
            setInvoices(prev => [newInvoice, ...prev]);
        }
    };

    const registerPurchase = (studentId, amount, description = 'Purchase', items = [], paymentMethod = 'CREDITO') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: 'Valor inválido' };

        // Check if all items are in stock if items are provided
        if (items.length > 0) {
            const hasStock = items.every(item => {
                const product = products.find(p => p.id === item.productId);
                return product && product.stock >= item.quantity;
            });
            if (!hasStock) return { success: false, error: 'Estoque insuficiente para um ou mais itens' };
        }

        let success = false;

        if (paymentMethod === 'CREDITO') {
            setStudents(prev => prev.map(s => {
                if (s.id === studentId) {
                    if (s.balance < numAmount) return s;
                    success = true;
                    return { ...s, balance: s.balance - numAmount };
                }
                return s;
            }));
        } else {
            // For other methods, we assume immediate payment, so no balance deduction, but we track it.
            success = true;
        }

        if (success) {
            // Deduct stock
            if (items.length > 0) {
                setProducts(prev => prev.map(p => {
                    const item = items.find(i => i.productId === p.id);
                    if (item) {
                        return { ...p, stock: p.stock - item.quantity };
                    }
                    return p;
                }));
            }

            const student = students.find(s => s.id === studentId); // Get student for name snapshot

            const transaction = {
                id: crypto.randomUUID(),
                studentId,
                studentName: student ? student.name : 'Desconhecido', // Snapshot name
                type: 'PURCHASE',
                amount: numAmount,
                description,
                items, // Save items in transaction
                method: paymentMethod, // Save method
                date: new Date().toISOString()
            };
            setTransactions(prev => [transaction, ...prev]);
            return { success: true };
        }

        return { success: false, error: 'Saldo insuficiente' };
    };

    const updateStudent = (id, data) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    };

    const deleteStudent = (id) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        // You might want to keep transactions or delete them. For now, we keep them.
    };

    const updateProduct = (id, data) => {
        setProducts(prev => prev.map(p => p.id === id ? {
            ...p,
            ...data,
            price: parseFloat(data.price),
            costPrice: parseFloat(data.costPrice) || p.costPrice || 0,
            stock: parseInt(data.stock),
            minStock: parseInt(data.minStock !== undefined ? data.minStock : (p.minStock || 5)),
            school: data.school || p.school || 'Wizard'
        } : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const deleteTransaction = (transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return false;

        // Revert Balance - ONLY if it was a DEPOSIT or a PURCHASE via CREDIT
        if (transaction.type === 'DEPOSIT' || (transaction.type === 'PURCHASE' && transaction.method === 'CREDITO')) {
            setStudents(prev => prev.map(s => {
                if (s.id === transaction.studentId) {
                    // If DEPOSIT, we remove the amount (balance - amount)
                    // If PURCHASE (CREDIT), we refund the amount (balance + amount)
                    const revertAmount = transaction.type === 'DEPOSIT' ? -transaction.amount : transaction.amount;
                    return { ...s, balance: s.balance + revertAmount };
                }
                return s;
            }));
        }
        // NOTE: If PURCHASE via MONEY/PIX/CARD, we do NOT touch the student balance, as it wasn't deducted.

        // Revert Stock if Purchase has items (Always revert stock regardless of payment method)
        if (transaction.type === 'PURCHASE' && transaction.items && transaction.items.length > 0) {
            setProducts(prev => prev.map(p => {
                const item = transaction.items.find(i => i.productId === p.id);
                if (item) {
                    return { ...p, stock: p.stock + item.quantity };
                }
                return p;
            }));
        }

        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        return true;
    };

    const updateTransaction = (id, newDescription) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, description: newDescription } : t));
    };

    return (
        <CantinaContext.Provider value={{
            students,
            transactions,
            products,
            invoices,
            settings,
            currentUser,
            login,
            addStudent,
            toggleStudentStatus,
            addFunds,
            registerPurchase,
            deleteTransaction,
            updateTransaction,
            addProduct,
            restockProduct,
            bulkRestockProducts,
            updateStudent,
            deleteStudent,
            updateProduct,
            deleteProduct,
            updateSettings,
        }}>
            {children}
        </CantinaContext.Provider>
    );
};
