import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Coffee, Package, BarChart3 } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="layout">
            <header className="glass-panel header">
                <div className="logo">
                    <Coffee className="text-gradient-secondary" size={28} />
                    <h1 className="text-gradient-primary">Cantina</h1>
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
                        <Package size={20} /> {/* Assuming Package is imported from lucide-react */}
                        <span>Produtos</span>
                    </Link>
                    <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
                        <BarChart3 size={20} />
                        <span>Relatórios</span>
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
