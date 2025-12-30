import React from 'react';
import { useCantina } from '../context/CantinaContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Shield, BookOpen, Baby, LogIn } from 'lucide-react';

const Login = () => {
    const { login, currentUser } = useCantina();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role);
        navigate('/'); // Redirect to Dashboard
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: 'white'
        }}>
            <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <LogIn size={32} color="#818cf8" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Cantina Escolar</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Selecione seu perfil de acesso</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button
                        onClick={() => handleLogin('admin')}
                        style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
                    >
                        <Shield size={20} style={{ marginRight: '0.75rem' }} />
                        Administrador
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => handleLogin('wizard')}
                        style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.3)' }}
                    >
                        <BookOpen size={20} style={{ marginRight: '0.75rem' }} />
                        Wizard
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => handleLogin('wizkids')}
                        style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                    >
                        <Baby size={20} style={{ marginRight: '0.75rem' }} />
                        WizKids
                    </Button>
                </div>

                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Acesso atual: <strong>{currentUser?.role?.toUpperCase()}</strong>
                </div>
            </Card>
        </div>
    );
};

export default Login;
