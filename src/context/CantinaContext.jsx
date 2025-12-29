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

    const addStudent = (name) => {
        const newStudent = {
            id: crypto.randomUUID(),
            name,
            balance: 0,
            createdAt: new Date().toISOString()
        };
        setStudents(prev => [...prev, newStudent]);
        return newStudent;
    };

    const addFunds = (studentId, amount) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;

        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, balance: s.balance + numAmount };
            }
            return s;
        }));

        const transaction = {
            id: crypto.randomUUID(),
            studentId,
            type: 'DEPOSIT',
            amount: numAmount,
            date: new Date().toISOString()
        };
        setTransactions(prev => [transaction, ...prev]);
        return true;
    };

    const addProduct = ({ name, price, supplier, initialStock = 0 }) => {
        const newProduct = {
            id: crypto.randomUUID(),
            name,
            price: parseFloat(price),
            supplier,
            stock: parseInt(initialStock),
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

    const registerPurchase = (studentId, amount, description = 'Compra', items = []) => {
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
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                if (s.balance < numAmount) return s;
                success = true;
                return { ...s, balance: s.balance - numAmount };
            }
            return s;
        }));

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

            const transaction = {
                id: crypto.randomUUID(),
                studentId,
                type: 'PURCHASE',
                amount: numAmount,
                description,
                items, // Save items in transaction
                date: new Date().toISOString()
            };
            setTransactions(prev => [transaction, ...prev]);
            return { success: true };
        }

        return { success: false, error: 'Saldo insuficiente' };
    };

    return (
        <CantinaContext.Provider value={{
            students,
            transactions,
            products,
            addStudent,
            addFunds,
            registerPurchase,
            addProduct,
            restockProduct
        }}>
            {children}
        </CantinaContext.Provider>
    );
};
