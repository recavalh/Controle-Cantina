import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCantina } from '../context/CantinaContext';
import { LayoutDashboard, Users, Coffee, Package, BarChart3, Settings as SettingsIcon, LogIn } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const { currentUser } = useCantina();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    return (
        <div className="layout">
            <header className="glass-panel header">
                <div className="logo">
                    <Coffee className="text-gradient-secondary" size={28} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1 }}>Cantina</h1>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Acesso: <strong style={{ color: currentUser?.role === 'admin' ? '#cbd5e1' : (currentUser?.role === 'wizard' ? '#fca5a5' : '#93c5fd') }}>{currentUser?.role?.toUpperCase() || 'ADMIN'}</strong>
                        </span>
                    </div>
                </div>
                <nav>
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/students" className={`nav-link ${isActive('/students')}`}>
                        <Users size={20} />
                        <span>Alunos</span>
                    </Link>
                    <Link to="/products" className={`nav-link ${isActive('/products')}`}>
                        <Package size={20} />
                        <span>Produtos</span>
                    </Link>
                    <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
                        <BarChart3 size={20} />
                        <span>Relatórios</span>
                    </Link>
                    <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
                        <SettingsIcon size={20} />
                        <span>Ajustes</span>
                    </Link>
                    <Link to="/login" className="nav-link" style={{ color: '#ef4444', marginLeft: '1rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                        <LogIn size={20} />
                        <span>Sair</span>
                    </Link>
                </nav>
            </header>
            <main className="content">
                <div className="glow" style={{ top: '10%', left: '20%' }} />
                <div className="glow" style={{ bottom: '20%', right: '10%', background: 'var(--secondary-gradient)' }} />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
