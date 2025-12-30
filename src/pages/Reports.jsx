import React from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

const Reports = () => {
    const { products, transactions } = useCantina();

    // Stock Metrics
    const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
    const totalStockCost = products.reduce((acc, p) => acc + (p.stock * (p.costPrice || 0)), 0);
    const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const potentialProfit = totalStockValue - totalStockCost;

    // Sales Metrics (Total Historical)
    const totalSales = transactions
        .filter(t => t.type === 'PURCHASE')
        .reduce((acc, t) => acc + t.amount, 0);

    const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
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
                <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{value}</h3>
                {subtitle && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
            </div>
        </Card>
    );

    return (
        <div>
            <h2 className="text-gradient-primary" style={{ marginBottom: '2rem' }}>Relatórios Financeiros</h2>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Estoque Atual
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Custo do Estoque"
                    value={`R$ ${totalStockCost.toFixed(2)}`}
                    subtitle={`${totalStockItems} itens em estoque`}
                    icon={Package}
                    color="245, 158, 11" // Amber
                />
                <StatCard
                    title="Valor de Venda (Potencial)"
                    value={`R$ ${totalStockValue.toFixed(2)}`}
                    subtitle="Se vender tudo hoje"
                    icon={DollarSign}
                    color="99, 102, 241" // Primary
                />
                <StatCard
                    title="Lucro Potencial"
                    value={`R$ ${potentialProfit.toFixed(2)}`}
                    subtitle={`Margem: ${totalStockCost > 0 ? ((potentialProfit / totalStockCost) * 100).toFixed(1) : 0}%`}
                    icon={TrendingUp}
                    color="16, 185, 129" // Emerald
                />
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Histórico de Vendas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    title="Vendas Totais Realizadas"
                    value={`R$ ${totalSales.toFixed(2)}`}
                    icon={BarChart3}
                    color="236, 72, 153" // Pink
                />
                {/* Further expansion: Daily/Monthly breakdown could go here */}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Card>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                        Mais relatórios e gráficos detalhados podem ser adicionados aqui futuramente.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
