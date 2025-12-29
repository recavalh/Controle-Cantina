import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { ArrowLeft, Wallet, ShoppingCart, History, TrendingUp, TrendingDown, Plus, Minus, X } from 'lucide-react';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { students, transactions, products, addFunds, registerPurchase } = useCantina();

    const student = students.find(s => s.id === id);
    const studentTransactions = transactions.filter(t => t.studentId === id);

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    // Deposit State
    const [amount, setAmount] = useState('');

    // Purchase State
    const [purchaseMode, setPurchaseMode] = useState('products'); // 'products' or 'manual'
    const [manualDesc, setManualDesc] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [cart, setCart] = useState([]); // [{ productId, quantity, name, price }]

    if (!student) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Aluno não encontrado</div>;
    }

    const handleDeposit = (e) => {
        e.preventDefault();
        if (addFunds(id, amount)) {
            setAmount('');
            setIsDepositModalOpen(false);
        }
    };

    // Cart Functions
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev; // Stock limit
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.reduce((acc, item) => {
            if (item.productId === productId) {
                if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }];
                return acc;
            }
            return [...acc, item];
        }, []));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handlePurchase = (e) => {
        e.preventDefault();

        let finalAmount = 0;
        let description = '';
        let items = [];

        if (purchaseMode === 'manual') {
            finalAmount = manualAmount;
            description = manualDesc || 'Lanche';
        } else {
            if (cart.length === 0) return;
            finalAmount = cartTotal;
            description = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
            items = cart;
        }

        const result = registerPurchase(id, finalAmount, description, items);
        if (result.success) {
            setManualAmount('');
            setManualDesc('');
            setCart([]);
            setIsPurchaseModalOpen(false);
        } else {
            alert(result.error);
        }
    };

    return (
        <div>
            <Button variant="ghost" onClick={() => navigate('/students')} style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Voltar
            </Button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Profile & Balance Card */}
                <Card>
                    <h2 className="text-gradient-primary" style={{ marginTop: 0 }}>{student.name}</h2>
                    <div style={{ margin: '1.5rem 0' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Saldo Atual</span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>R$ {student.balance.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button variant="secondary" onClick={() => setIsPurchaseModalOpen(true)} style={{ flex: 1 }}>
                            <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
                            Cobrar
                        </Button>
                        <Button variant="primary" onClick={() => setIsDepositModalOpen(true)} style={{ flex: 1 }}>
                            <Wallet size={18} style={{ marginRight: '0.5rem' }} />
                            Recarregar
                        </Button>
                    </div>
                </Card>

                {/* Stats Placeholder */}
                <Card style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.2rem', marginBottom: '1rem' }}>Resumo</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Gasto</span>
                            <span>R$ {studentTransactions.filter(t => t.type === 'PURCHASE').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Depositado</span>
                            <span>R$ {studentTransactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} /> Histórico de Transações
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentTransactions.length > 0 ? studentTransactions.map(t => (
                    <Card key={t.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                padding: '8px',
                                borderRadius: '50%',
                                background: t.type === 'DEPOSIT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: t.type === 'DEPOSIT' ? '#10b981' : '#ef4444'
                            }}>
                                {t.type === 'DEPOSIT' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>{t.type === 'DEPOSIT' ? 'Depósito' : t.description}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}</div>
                            </div>
                        </div>
                        <span style={{ fontWeight: 'bold', color: t.type === 'DEPOSIT' ? '#10b981' : '#ef4444' }}>
                            {t.type === 'DEPOSIT' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </span>
                    </Card>
                )) : <p style={{ color: 'var(--text-muted)' }}>Nenhuma transação encontrada.</p>}
            </div>

            {/* Deposit Modal */}
            <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title="Adicionar Saldo">
                <form onSubmit={handleDeposit}>
                    <Input
                        label="Valor (R$)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsDepositModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Confirmar</Button>
                    </div>
                </form>
            </Modal>

            {/* Purchase Modal with Product Selection */}
            <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Registrar Compra">
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <Button
                        variant={purchaseMode === 'products' ? 'primary' : 'ghost'}
                        onClick={() => setPurchaseMode('products')}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        Produtos
                    </Button>
                    <Button
                        variant={purchaseMode === 'manual' ? 'primary' : 'ghost'}
                        onClick={() => setPurchaseMode('manual')}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        Manual
                    </Button>
                </div>

                <form onSubmit={handlePurchase}>
                    {purchaseMode === 'manual' ? (
                        <>
                            <Input
                                label="Descrição do Item"
                                placeholder="Ex: Salgado + Refri"
                                value={manualDesc}
                                onChange={(e) => setManualDesc(e.target.value)}
                                autoFocus
                            />
                            <Input
                                label="Valor TOTAL (R$)"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={manualAmount}
                                onChange={(e) => setManualAmount(e.target.value)}
                            />
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Cart Summary */}
                            {cart.length > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        <span>Total a cobrar</span>
                                        <span className="text-gradient-primary">R$ {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                        {cart.map(item => (
                                            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                                <span>{item.quantity}x {item.name}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                    <button type="button" onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                                                        <Minus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product List */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {products.map(p => (
                                    <div key={p.id}
                                        onClick={() => p.stock > 0 && addToCart(p)}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                                            opacity: p.stock > 0 ? 1 : 0.5,
                                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem'
                                        }}>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estoque: {p.stock}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>R$ {p.price.toFixed(2)}</span>
                                            <Plus size={16} className="text-gradient-secondary" />
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>Sem produtos cadastrados.</p>}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsPurchaseModalOpen(false)}>Cancelar</Button>
                        <Button variant="secondary" type="submit">
                            Cobrar {purchaseMode === 'products' && cartTotal > 0 && `R$ ${cartTotal.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDetails;
