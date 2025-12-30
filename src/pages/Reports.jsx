import React, { useMemo } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import { BarChart3, TrendingUp, DollarSign, Package, AlertTriangle, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Reports = () => {
    const { products, transactions, settings, students, currentUser } = useCantina();
    const taxRate = settings.operationalTaxRate || 0;

    // Filter accessible products
    const accessibleProducts = useMemo(() => {
        if (currentUser?.role === 'admin') return products;
        const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
        return products.filter(p => (p.school || 'Wizard') === userSchool);
    }, [products, currentUser]);

    // Filter accessible transactions
    const accessibleTransactions = useMemo(() => {
        if (currentUser?.role === 'admin') return transactions;
        const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
        return transactions.filter(t => {
            const student = students.find(s => s.id === t.studentId);
            if (student) {
                return (student.school || 'Wizard') === userSchool;
            }
            return false; // Safely hide unknown/deleted student transactions for non-admins
        });
    }, [transactions, students, currentUser]);

    // 1. Financial Realism Calculation
    const financialStats = useMemo(() => {
        // Filter only Purchase transactions
        const salesTransactions = accessibleTransactions.filter(t => t.type === 'PURCHASE');

        const grossRevenue = salesTransactions.reduce((acc, t) => acc + t.amount, 0);

        // Calculate CMV (Cost of Goods Sold) based on items in transactions
        let cmvTotal = 0;
        salesTransactions.forEach(t => {
            if (t.items && t.items.length > 0) {
                t.items.forEach(item => {
                    const product = accessibleProducts.find(p => p.id === item.productId);
                    if (product) {
                        cmvTotal += (product.costPrice || 0) * item.quantity;
                    }
                });
            }
        });

        const operationalCostTotal = grossRevenue * (taxRate / 100);
        const totalCosts = cmvTotal + operationalCostTotal;
        const realNetProfit = grossRevenue - totalCosts;

        // Average Ticket (Items)
        const totalItemsSold = salesTransactions.reduce((acc, t) => {
            if (t.items && t.items.length > 0) {
                return acc + t.items.reduce((sum, i) => sum + i.quantity, 0);
            }
            return acc + 1; // Count manual sale as 1 "item" unit
        }, 0);
        const avgItemsPerOrder = salesTransactions.length > 0 ? totalItemsSold / salesTransactions.length : 0;

        return {
            grossRevenue,
            cmvTotal,
            operationalCostTotal,
            totalCosts,
            realNetProfit,
            avgItemsPerOrder,
            salesCount: salesTransactions.length
        };
    }, [accessibleTransactions, accessibleProducts, taxRate]);

    // 2. Top Products by Profit (Contribution Margin)
    const topProfitableProducts = useMemo(() => {
        return accessibleProducts
            .map(p => {
                const unitTax = p.price * (taxRate / 100);
                const unitNetProfit = p.price - (p.costPrice || 0) - unitTax;
                return {
                    ...p,
                    unitNetProfit,
                    marginPercent: p.price > 0 ? (unitNetProfit / p.price) * 100 : 0
                };
            })
            .sort((a, b) => b.unitNetProfit - a.unitNetProfit)
            .slice(0, 5);
    }, [accessibleProducts, taxRate]);

    // 3. Dead Money (Stock Critical) analysis
    const deadMoneyProducts = useMemo(() => {
        const productSalesCount = {};
        accessibleTransactions
            .filter(t => t.type === 'PURCHASE')
            .forEach(t => {
                if (t.items) {
                    t.items.forEach(i => {
                        productSalesCount[i.productId] = (productSalesCount[i.productId] || 0) + i.quantity;
                    });
                }
            });

        return accessibleProducts
            .map(p => {
                const sales = productSalesCount[p.id] || 0;
                const stockValue = p.stock * (p.costPrice || 0);
                return { ...p, sales, stockValue };
            })
            .filter(p => p.stock > 0 && p.stockValue > 0)
            .sort((a, b) => {
                if (a.sales === b.sales) return b.stockValue - a.stockValue;
                return a.sales - b.sales;
            })
            .slice(0, 5);
    }, [accessibleProducts, accessibleTransactions]);

    const deadMoneyTotal = deadMoneyProducts.reduce((acc, p) => acc + p.stockValue, 0);

    const StatCard = ({ title, value, subtitle, icon: Icon, color, isNegative }) => (
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: isNegative ? '1px solid #ef4444' : 'none' }}>
            <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: isNegative ? 'rgba(239, 68, 68, 0.1)' : `rgba(${color}, 0.1)`,
                color: isNegative ? '#ef4444' : `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{title}</span>
                <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', color: isNegative ? '#ef4444' : 'inherit' }}>{value}</h3>
                {subtitle && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
            </div>
        </Card>
    );

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ margin: 0 }}>
                    Relatórios Financeiros {currentUser?.role !== 'admin' && `(${currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard'})`}
                </h2>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    Taxa Operacional: <strong>{taxRate}%</strong>
                </div>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Performance Real (Líquida)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Faturamento Bruto"
                    value={`R$ ${financialStats.grossRevenue.toFixed(2)}`}
                    subtitle={`${financialStats.salesCount} vendas realizadas`}
                    icon={DollarSign}
                    color="99, 102, 241"
                />
                <StatCard
                    title="Custos Totais"
                    value={`R$ ${financialStats.totalCosts.toFixed(2)}`}
                    subtitle={`CMV: R$ ${financialStats.cmvTotal.toFixed(2)} + Ops: R$ ${financialStats.operationalCostTotal.toFixed(2)}`}
                    icon={ArrowDownRight}
                    color="245, 158, 11"
                />
                <StatCard
                    title="Lucro Líquido Real"
                    value={`R$ ${financialStats.realNetProfit.toFixed(2)}`}
                    subtitle={`Margem Real: ${financialStats.grossRevenue > 0 ? ((financialStats.realNetProfit / financialStats.grossRevenue) * 100).toFixed(1) : 0}%`}
                    icon={financialStats.realNetProfit >= 0 ? TrendingUp : AlertTriangle}
                    color={financialStats.realNetProfit >= 0 ? "16, 185, 129" : "239, 68, 68"}
                    isNegative={financialStats.realNetProfit < 0}
                />
                <StatCard
                    title="Ticket Médio (Itens)"
                    value={financialStats.avgItemsPerOrder.toFixed(1)}
                    subtitle="Itens por pedido"
                    icon={Receipt}
                    color="236, 72, 153"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Top Products Card */}
                <Card>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowUpRight size={20} className="text-gradient-secondary" /> Top 5 Produtos (Lucro Unitário)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {topProfitableProducts.map((p, idx) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{idx + 1}</span>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Venda: R$ {p.price.toFixed(2)} | Custo: R$ {p.costPrice?.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: p.unitNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                                        R$ {p.unitNetProfit.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Lucro/un
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Dead Money Card */}
                <Card>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} style={{ color: '#f59e0b' }} /> Dinheiro Parado (Baixa Rotatividade)
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Itens com estoque de alto valor mas com poucas vendas.
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>Total Parado: R$ {deadMoneyTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {deadMoneyProducts.map((p) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estoque: {p.stock} un</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                        R$ {p.stockValue.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {p.sales} vendas
                                    </div>
                                </div>
                            </div>
                        ))}
                        {deadMoneyProducts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Tudo fluindo bem! Nenhum item crítico.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
