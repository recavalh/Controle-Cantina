import React from 'react';
import { useCantina } from '../context/CantinaContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Shield, BookOpen, Baby, LogIn } from 'lucide-react';

const Login = () => {
    const { login, currentUser } = useCantina();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = React.useState(null);
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const CREDENTIALS = {
        admin: { password: '2012', email: 'renato.cavalheiro@wizardone.com.br', label: 'Administrador' },
        wizard: { password: '1205', email: 'patrocinio@wizard.com.br', label: 'Wizard' },
        wizkids: { password: '2016', email: 'patrociniokids@wizard.com.br', label: 'WizKids' }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setPassword('');
        setError('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const creds = CREDENTIALS[selectedRole];
        if (password === creds.password) {
            login(selectedRole);
            navigate('/');
        } else {
            setError('Senha incorreta');
        }
    };

    const handleForgotPassword = () => {
        const email = CREDENTIALS[selectedRole].email;
        alert(`Para redefinir sua senha, entre em contato com: ${email}`);
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

                    {!selectedRole ? (
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Selecione seu perfil de acesso</p>
                    ) : (
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Digite a senha para <strong>{CREDENTIALS[selectedRole].label}</strong>
                        </p>
                    )}
                </div>

                {!selectedRole ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button
                            onClick={() => handleRoleSelect('admin')}
                            style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            <Shield size={20} style={{ marginRight: '0.75rem' }} />
                            Administrador
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => handleRoleSelect('wizard')}
                            style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.3)' }}
                        >
                            <BookOpen size={20} style={{ marginRight: '0.75rem' }} />
                            Wizard
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => handleRoleSelect('wizkids')}
                            style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                        >
                            <Baby size={20} style={{ marginRight: '0.75rem' }} />
                            WizKids
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="password"
                            placeholder="Senha de acesso"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                textAlign: 'center'
                            }}
                        />

                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

                        <Button type="submit" style={{ justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                            Entrar
                        </Button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setSelectedRole(null)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                            >
                                ← Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer' }}
                            >
                                Esqueci a senha
                            </button>
                        </div>
                    </form>
                )}

                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Acesso atual: <strong>{currentUser?.role?.toUpperCase()}</strong>
                </div>
            </Card>
        </div>
    );
};

export default Login;
