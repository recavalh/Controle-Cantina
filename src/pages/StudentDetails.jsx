import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { ArrowLeft, Wallet, ShoppingCart, History, TrendingUp, TrendingDown } from 'lucide-react';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { students, transactions, addFunds, registerPurchase } = useCantina();

    const student = students.find(s => s.id === id);
    const studentTransactions = transactions.filter(t => t.studentId === id);

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

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

    const handlePurchase = (e) => {
        e.preventDefault();
        if (registerPurchase(id, amount, description || 'Lanche')) {
            setAmount('');
            setDescription('');
            setIsPurchaseModalOpen(false);
        } else {
            alert('Saldo insuficiente!');
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

                {/* Stats Placeholder or Quick Actions */}
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

            {/* Purchase Modal */}
            <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Registrar Compra">
                <form onSubmit={handlePurchase}>
                    <Input
                        label="Descrição do Item"
                        placeholder="Ex: Salgado + Refri"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoFocus
                    />
                    <Input
                        label="Valor TOTAL (R$)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsPurchaseModalOpen(false)}>Cancelar</Button>
                        <Button variant="secondary" type="submit">Cobrar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDetails;
