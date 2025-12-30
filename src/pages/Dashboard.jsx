import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { TrendingUp, Users, DollarSign, Activity, ShoppingCart, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { students, transactions, addStudent } = useCantina();
    const navigate = useNavigate();

    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewStudentForm, setShowNewStudentForm] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');

    const totalBalance = students.reduce((acc, s) => acc + s.balance, 0);
    // Count only active students for the main stat, or all? User just says "Alunos Ativos".
    // Usually "Alunos Ativos" literally means active: true.
    const activeStudentsCount = students.filter(s => s.active !== false).length;

    const recentTransactions = transactions.slice(0, 5);
    const totalSales = transactions.filter(t => t.type === 'PURCHASE').reduce((acc, t) => acc + t.amount, 0);

    // Filter students for sale: Only show active ones
    const filteredStudents = students
        .filter(s => s.active !== false)
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelectStudent = (id) => {
        setIsSaleModalOpen(false);
        navigate(`/students/${id}`);
    };

    const handleQuickAddStudent = (e) => {
        e.preventDefault();
        if (newStudentName.trim()) {
            const newStudent = addStudent(newStudentName);
            setNewStudentName('');
            setShowNewStudentForm(false);
            // Navigate directly to the new student's page
            handleSelectStudent(newStudent.id);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: `rgba(${color}, 0.1)`,
                color: `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{title}</span>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{value}</h3>
            </div>
        </Card>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ margin: 0 }}>Dashboard</h2>
                <Button onClick={() => { setIsSaleModalOpen(true); setSearchTerm(''); setShowNewStudentForm(false); }}>
                    <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
                    Nova Venda
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total em Caixa (Saldos)" value={`R$ ${totalBalance.toFixed(2)}`} icon={DollarSign} color="99, 102, 241" />
                <StatCard title="Total Vendas" value={`R$ ${totalSales.toFixed(2)}`} icon={TrendingUp} color="236, 72, 153" />
                <StatCard title="Alunos Ativos" value={activeStudentsCount} icon={Users} color="16, 185, 129" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} className="text-gradient-secondary" /> Atividade Recente
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {recentTransactions.map(t => {
                            // Try to find current student, fallback to snapshot name
                            const student = students.find(s => s.id === t.studentId);
                            const displayName = student ? student.name : (t.studentName || 'Aluno Excluído');

                            return (
                                <div key={t.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 500, display: 'block' }}>
                                            {t.type === 'PURCHASE' ? 'Venda' : 'Depósito'} - {displayName}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(t.date).toLocaleTimeString()} - {t.description || 'Saldo adicionado'}
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: t.type === 'DEPOSIT' ? '#10b981' : '#ef4444' }}>
                                        {t.type === 'DEPOSIT' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                        {recentTransactions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma atividade recente.</p>}
                    </div>
                </Card>
            </div>

            {/* New Sale Selection Modal */}
            <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title="Nova Venda: Selecionar Aluno">
                {!showNewStudentForm ? (
                    <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Input
                                placeholder="Buscar aluno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                style={{ margin: 0 }}
                            />
                            <Button variant="secondary" onClick={() => setShowNewStudentForm(true)} style={{ whiteSpace: 'nowrap' }}>
                                <UserPlus size={18} />
                            </Button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => handleSelectStudent(student.id)}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'background 0.2s'
                                    }}
                                    className="hover-bg"
                                >
                                    <span style={{ fontWeight: 500 }}>{student.name}</span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: student.balance < 0 ? '#ef4444' : '#10b981',
                                        fontWeight: 'bold'
                                    }}>
                                        R$ {student.balance.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Nenhum aluno ativo encontrado.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleQuickAddStudent}>
                        <div style={{ marginBottom: '1rem' }}>
                            <Button variant="ghost" size="sm" onClick={() => setShowNewStudentForm(false)} style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
                                ← Voltar para busca
                            </Button>
                        </div>
                        <Input
                            label="Nome do Novo Aluno"
                            placeholder="Ex: Maria Oliveira"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button variant="ghost" type="button" onClick={() => setShowNewStudentForm(false)}>Cancelar</Button>
                            <Button type="submit">Cadastrar e Ir para Venda</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Dashboard;
