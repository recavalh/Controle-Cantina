import React from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
    const { students, transactions } = useCantina();

    const totalBalance = students.reduce((acc, s) => acc + s.balance, 0);
    const totalStudents = students.length;
    const recentTransactions = transactions.slice(0, 5);
    const totalSales = transactions.filter(t => t.type === 'PURCHASE').reduce((acc, t) => acc + t.amount, 0);

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
            <h2 className="text-gradient-primary" style={{ marginBottom: '2rem' }}>Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total em Caixa (Saldos)"
                    value={`R$ ${totalBalance.toFixed(2)}`}
                    icon={DollarSign}
                    color="99, 102, 241" /* Indigo */
                />
                <StatCard
                    title="Total Vendas"
                    value={`R$ ${totalSales.toFixed(2)}`}
                    icon={TrendingUp}
                    color="236, 72, 153" /* Pink */
                />
                <StatCard
                    title="Alunos Ativos"
                    value={totalStudents}
                    icon={Users}
                    color="16, 185, 129" /* Emerald */
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} className="text-gradient-secondary" /> Atividade Recente
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentTransactions.map(t => {
                            const student = students.find(s => s.id === t.studentId);
                            return (
                                <div key={t.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: '0.75rem',
                                    borderBottom: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 500, display: 'block' }}>
                                            {t.type === 'PURCHASE' ? 'Venda' : 'Depósito'} - {student?.name || 'Desconhecido'}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(t.date).toLocaleTimeString()} - {t.description || 'Saldo adicionado'}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: t.type === 'DEPOSIT' ? '#10b981' : '#ef4444'
                                    }}>
                                        {t.type === 'DEPOSIT' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                        {recentTransactions.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma atividade recente.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
