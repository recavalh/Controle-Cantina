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
        // Global transaction log (redundant maybe if inside students, but good for dashboard)
        const saved = localStorage.getItem('cantina_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cantina_students', JSON.stringify(students));
    }, [students]);

    useEffect(() => {
        localStorage.setItem('cantina_transactions', JSON.stringify(transactions));
    }, [transactions]);

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

    const registerPurchase = (studentId, amount, description = 'Compra') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;

        let success = false;
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                if (s.balance < numAmount) return s; // Check balance? Or allow negative? strictly check for now.
                success = true;
                return { ...s, balance: s.balance - numAmount };
            }
            return s;
        }));

        if (success) {
            const transaction = {
                id: crypto.randomUUID(),
                studentId,
                type: 'PURCHASE',
                amount: numAmount,
                description,
                date: new Date().toISOString()
            };
            setTransactions(prev => [transaction, ...prev]);
        }

        return success;
    };

    return (
        <CantinaContext.Provider value={{
            students,
            transactions,
            addStudent,
            addFunds,
            registerPurchase
        }}>
            {children}
        </CantinaContext.Provider>
    );
};
