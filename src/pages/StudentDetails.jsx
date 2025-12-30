import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { ArrowLeft, Wallet, ShoppingCart, History, TrendingUp, TrendingDown, Plus, Minus, CreditCard, Banknote, QrCode, Trash2, Edit } from 'lucide-react';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { students, transactions, products, addFunds, registerPurchase, deleteTransaction, updateTransaction, currentUser } = useCantina();

    const student = students.find(s => s.id === id);
    const studentTransactions = transactions.filter(t => t.studentId === id).sort((a, b) => new Date(b.date) - new Date(a.date));

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    // Deposit State
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('DINHEIRO'); // 'DINHEIRO', 'CARTAO', 'PIX' (For Deposits)
    const [purchasePaymentMethod, setPurchasePaymentMethod] = useState('CREDITO'); // For Purchases

    // Purchase State
    const [purchaseMode, setPurchaseMode] = useState('products'); // 'products' or 'manual'
    const [selectedCategory, setSelectedCategory] = useState(null); // New state for category selection step
    const [manualDesc, setManualDesc] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [cart, setCart] = useState([]); // [{ productId, quantity, name, price }]
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Transaction State
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editDesc, setEditDesc] = useState('');

    if (!student) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Aluno não encontrado</div>;
    }

    // Access Control Check
    if (currentUser?.role !== 'admin') {
        const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
        if ((student.school || 'Wizard') !== userSchool) {
            return (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
                    <p>Este aluno pertence à escola {student.school || 'Wizard'}.</p>
                    <Button onClick={() => navigate('/')}>Voltar ao Painel</Button>
                </div>
            );
        }
    }

    const handleDeposit = (e) => {
        e.preventDefault();
        if (addFunds(id, amount, paymentMethod)) {
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

    // Filter Products by Category AND School
    const filteredProducts = products
        .filter(p => !selectedCategory || (p.category || 'Outros') === selectedCategory) // Filter by category
        .filter(p => {
            // Role Filter
            if (currentUser?.role !== 'admin') {
                const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
                if ((p.school || 'Wizard') !== userSchool) return false;
            }
            return true;
        })
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

        const result = registerPurchase(id, finalAmount, description, items, purchasePaymentMethod);
        if (result.success) {
            setManualAmount('');
            setManualDesc('');
            setCart([]);
            setIsPurchaseModalOpen(false);
            setSelectedCategory(null); // Reset category on successful purchase
            setPurchasePaymentMethod('CREDITO');
        } else {
            alert(result.error);
        }
    };

    const getPaymentIcon = (method) => {
        switch (method) {
            case 'CARTAO': return <CreditCard size={14} />;
            case 'PIX': return <QrCode size={14} />;
            default: return <Banknote size={14} />;
        }
    };

    const handleDeleteTransaction = (t) => {
        const msg = t.type === 'PURCHASE' && t.items && t.items.length > 0
            ? "Ao excluir esta venda, o saldo será devolvido ao aluno e os itens retornarão ao estoque. Confirmar?"
            : "Ao excluir este lançamento, o impacto no saldo do aluno será revertido. Confirmar?";

        if (window.confirm(msg)) {
            deleteTransaction(t.id);
        }
    };

    const openEditTransaction = (t) => {
        setEditingTransaction(t);
        setEditDesc(t.description || '');
    };

    const handleSaveTransaction = (e) => {
        e.preventDefault();
        if (editingTransaction && editDesc) {
            updateTransaction(editingTransaction.id, editDesc);
            setEditingTransaction(null);
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
                    {student.active !== false ? (
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
                    ) : (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', textAlign: 'center' }}>
                            Aluno Inativo. Reative para realizar operações.
                        </div>
                    )}

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
                                <div style={{ fontWeight: 500 }}>
                                    {t.type === 'DEPOSIT' ? 'Depósito' : t.description}
                                    {t.type === 'DEPOSIT' && t.method && (
                                        <span style={{
                                            marginLeft: '0.5rem',
                                            fontSize: '0.7rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            verticalAlign: 'middle'
                                        }}>
                                            {t.method}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: t.type === 'DEPOSIT' ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                                {t.type === 'DEPOSIT' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => openEditTransaction(t)}
                                    style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', padding: '4px'
                                    }}
                                    title="Editar descrição"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTransaction(t)}
                                    style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        color: '#ef4444', padding: '4px'
                                    }}
                                    title="Excluir lançamento"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
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

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Forma de Pagamento</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <div
                                onClick={() => setPaymentMethod('DINHEIRO')}
                                style={{
                                    padding: '0.75rem',
                                    border: `1px solid ${paymentMethod === 'DINHEIRO' ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'DINHEIRO' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem'
                                }}
                            >
                                <Banknote size={20} />
                                <span style={{ fontSize: '0.8rem' }}>Dinheiro</span>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('CARTAO')}
                                style={{
                                    padding: '0.75rem',
                                    border: `1px solid ${paymentMethod === 'CARTAO' ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'CARTAO' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem'
                                }}
                            >
                                <CreditCard size={20} />
                                <span style={{ fontSize: '0.8rem' }}>Cartão</span>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('PIX')}
                                style={{
                                    padding: '0.75rem',
                                    border: `1px solid ${paymentMethod === 'PIX' ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'PIX' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    borderRadius: '8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem'
                                }}
                            >
                                <QrCode size={20} />
                                <span style={{ fontSize: '0.8rem' }}>Pix</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsDepositModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Confirmar</Button>
                    </div>
                </form>
            </Modal>

            {/* Purchase Modal with Product Selection */}
            <Modal isOpen={isPurchaseModalOpen} onClose={() => { setIsPurchaseModalOpen(false); setSelectedCategory(null); setPurchasePaymentMethod('CREDITO'); }} title="Registrar Compra">
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
                    {/* Payment Method Selection */}
                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Forma de Pagamento</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Button
                                type="button"
                                size="sm"
                                variant={purchasePaymentMethod === 'CREDITO' ? 'primary' : 'outline'}
                                onClick={() => setPurchasePaymentMethod('CREDITO')}
                            >
                                <Wallet size={16} style={{ marginRight: '0.5rem' }} /> Saldo/Crédito
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={purchasePaymentMethod === 'DINHEIRO' ? 'secondary' : 'outline'}
                                onClick={() => setPurchasePaymentMethod('DINHEIRO')}
                            >
                                <Banknote size={16} style={{ marginRight: '0.5rem' }} /> Dinheiro
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={purchasePaymentMethod === 'PIX' ? 'secondary' : 'outline'}
                                onClick={() => setPurchasePaymentMethod('PIX')}
                            >
                                <QrCode size={16} style={{ marginRight: '0.5rem' }} /> Pix
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={purchasePaymentMethod === 'CARTAO' ? 'secondary' : 'outline'}
                                onClick={() => setPurchasePaymentMethod('CARTAO')}
                            >
                                <CreditCard size={16} style={{ marginRight: '0.5rem' }} /> Cartão
                            </Button>
                        </div>
                    </div>

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
                            {/* Category Selection Step */}
                            {!selectedCategory ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' }}>
                                    {['Comidas', 'Bebidas', 'Doces', 'Outros'].map(cat => (
                                        <Button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            style={{ height: '80px', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                                        >
                                            {cat === 'Comidas' && '🍔'}
                                            {cat === 'Bebidas' && '🥤'}
                                            {cat === 'Doces' && '🍬'}
                                            {cat === 'Outros' && '📦'}
                                            {cat}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} style={{ paddingLeft: 0 }}>
                                            ← Voltar
                                        </Button>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedCategory}</span>
                                    </div>

                                    <Input
                                        placeholder={`Buscar em ${selectedCategory}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ marginBottom: '0.5rem' }}
                                        autoFocus
                                    />

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                        {filteredProducts.map(p => (
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
                                        {filteredProducts.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum produto encontrado nesta categoria.</p>}
                                    </div>
                                </>
                            )}

                            {/* Cart Summary (Always visible if items) */}
                            {cart.length > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
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
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => { setIsPurchaseModalOpen(false); setSelectedCategory(null); }}>Cancelar</Button>
                        <Button variant="secondary" type="submit" disabled={purchaseMode === 'products' && cart.length === 0}>
                            Cobrar {purchaseMode === 'products' && cartTotal > 0 && `R$ ${cartTotal.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Editar Lançamento">
                <form onSubmit={handleSaveTransaction}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Só é permitido editar a descrição. Para corrigir valores, exclua o lançamento e faça novamente.
                    </p>
                    <Input
                        label="Descrição"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setEditingTransaction(null)}>Cancelar</Button>
                        <Button type="submit">Salvar Edição</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDetails;
