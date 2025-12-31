import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const CantinaContext = createContext();

export const useCantina = () => {
    const context = useContext(CantinaContext);
    if (!context) {
        throw new Error('useCantina must be used within a CantinaProvider');
    }
    return context;
};

export const CantinaProvider = ({ children }) => {
    // Auth State (Local Session)
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('cantina_current_user');
        if (!saved || saved === 'null' || saved === 'undefined') return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('cantina_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('cantina_current_user');
        }
    }, [currentUser]);

    const login = (role) => {
        setCurrentUser({ role });
    };

    const logout = () => {
        setCurrentUser(null);
    };

    // Data State (Firestore)
    const [students, setStudents] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [settings, setSettings] = useState({ operationalTaxRate: 15 });

    // Firestore Collections References
    const studentsRef = collection(db, 'students');
    const transactionsRef = collection(db, 'transactions');
    const productsRef = collection(db, 'products');
    const invoicesRef = collection(db, 'invoices');
    const settingsRef = collection(db, 'settings');

    // Subscribe to Data
    useEffect(() => {
        const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });

        // Order transactions by date desc
        const qTransactions = query(transactionsRef, orderBy('date', 'desc'));
        const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });

        const unsubProducts = onSnapshot(productsRef, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });

        const unsubInvoices = onSnapshot(invoicesRef, (snapshot) => {
            setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });

        // Settings - typically a single doc, we treat 'first' as the one
        const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
            if (!snapshot.empty) {
                setSettings({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
            } else {
                // Initialize default settings if none exist
                addDoc(settingsRef, { operationalTaxRate: 15 });
            }
        });

        return () => {
            unsubStudents();
            unsubTransactions();
            unsubProducts();
            unsubInvoices();
            unsubSettings();
        };
    }, []);

    // --- Actions ---

    const addStudent = async (name, school = 'Wizard') => {
        const newStudent = {
            name,
            school,
            balance: 0,
            active: true,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(studentsRef, newStudent);
        return { ...newStudent, id: docRef.id };
    };

    const toggleStudentStatus = async (id) => {
        const student = students.find(s => s.id === id);
        if (student) {
            await updateDoc(doc(studentsRef, id), { active: !student.active });
        }
    };

    const addFunds = async (studentId, amount, method = 'DINHEIRO') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;

        const student = students.find(s => s.id === studentId);
        if (!student) return false;

        // Update Student Balance
        await updateDoc(doc(studentsRef, studentId), {
            balance: student.balance + numAmount
        });

        // Add Transaction
        await addDoc(transactionsRef, {
            studentId,
            studentName: student.name,
            type: 'DEPOSIT',
            amount: numAmount,
            method,
            date: new Date().toISOString()
        });

        return true;
    };

    const addProduct = async ({ name, price, costPrice, supplier, category, initialStock = 0, minStock = 5, school = 'Wizard' }) => {
        const newProduct = {
            name,
            price: parseFloat(price),
            costPrice: parseFloat(costPrice) || 0,
            supplier,
            category: category || 'Outros',
            stock: parseInt(initialStock),
            minStock: parseInt(minStock),
            school,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(productsRef, newProduct);
        return { ...newProduct, id: docRef.id };
    };

    const restockProduct = async (productId, quantity) => {
        const amount = parseInt(quantity);
        if (isNaN(amount) || amount <= 0) return false;

        const product = products.find(p => p.id === productId);
        if (product) {
            await updateDoc(doc(productsRef, productId), {
                stock: product.stock + amount
            });
        }
        return true;
    };

    const bulkRestockProducts = async (items, invoiceData) => {
        // items: [{ id, quantity }]
        items.forEach(async (item) => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const amount = parseInt(item.quantity);
                if (!isNaN(amount) && amount > 0) {
                    await updateDoc(doc(productsRef, item.id), {
                        stock: product.stock + amount
                    });
                }
            }
        });

        if (invoiceData) {
            await addDoc(invoicesRef, {
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
            });
        }
    };

    const registerPurchase = async (studentId, amount, description = 'Purchase', items = [], paymentMethod = 'CREDITO') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: 'Valor inválido' };

        // Check stock locally first (since we have synced state)
        if (items.length > 0) {
            const hasStock = items.every(item => {
                const product = products.find(p => p.id === item.productId);
                return product && product.stock >= item.quantity;
            });
            if (!hasStock) return { success: false, error: 'Estoque insuficiente para um ou mais itens' };
        }

        let success = false;
        const student = students.find(s => s.id === studentId);

        if (paymentMethod === 'CREDITO') {
            if (student && student.balance >= numAmount) {
                await updateDoc(doc(studentsRef, studentId), {
                    balance: student.balance - numAmount
                });
                success = true;
            }
        } else {
            // Money/Pix/Card -> Success immediately, no balance change
            success = true;
        }

        if (success) {
            // Deduct Stock
            if (items.length > 0) {
                items.forEach(async (item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        await updateDoc(doc(productsRef, item.productId), {
                            stock: product.stock - item.quantity
                        });
                    }
                });
            }

            // Add Transaction
            await addDoc(transactionsRef, {
                studentId,
                studentName: student ? student.name : 'Desconhecido',
                type: 'PURCHASE',
                amount: numAmount,
                description,
                items,
                method: paymentMethod,
                date: new Date().toISOString()
            });

            return { success: true };
        }

        return { success: false, error: 'Saldo insuficiente' };
    };

    const updateStudent = async (id, data) => {
        await updateDoc(doc(studentsRef, id), data);
    };

    const deleteStudent = async (id) => {
        await deleteDoc(doc(studentsRef, id));
    };

    const updateProduct = async (id, data) => {
        const product = products.find(p => p.id === id);
        if (product) {
            await updateDoc(doc(productsRef, id), {
                ...data,
                price: parseFloat(data.price),
                costPrice: parseFloat(data.costPrice) || product.costPrice || 0,
                stock: parseInt(data.stock),
                minStock: parseInt(data.minStock !== undefined ? data.minStock : (product.minStock || 5)),
                school: data.school || product.school || 'Wizard'
            });
        }
    };

    const deleteProduct = async (id) => {
        await deleteDoc(doc(productsRef, id));
    };

    const deleteTransaction = async (transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return false;

        // Revert Balance
        if (transaction.type === 'DEPOSIT' || (transaction.type === 'PURCHASE' && transaction.method === 'CREDITO')) {
            const student = students.find(s => s.id === transaction.studentId);
            if (student) {
                const revertAmount = transaction.type === 'DEPOSIT' ? -transaction.amount : transaction.amount;
                await updateDoc(doc(studentsRef, student.id), {
                    balance: student.balance + revertAmount
                });
            }
        }

        // Revert Stock
        if (transaction.type === 'PURCHASE' && transaction.items && transaction.items.length > 0) {
            transaction.items.forEach(async (item) => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    await updateDoc(doc(productsRef, item.productId), {
                        stock: product.stock + item.quantity
                    });
                }
            });
        }

        await deleteDoc(doc(transactionsRef, transactionId));
        return true;
    };

    const updateTransaction = async (id, newDescription) => {
        await updateDoc(doc(transactionsRef, id), { description: newDescription });
    };

    const updateSettings = async (newSettings) => {
        if (settings.id) {
            await updateDoc(doc(settingsRef, settings.id), newSettings);
        } else {
            await addDoc(settingsRef, newSettings);
        }
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
            logout,
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
