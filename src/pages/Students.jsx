import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { Plus, User, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Students = () => {
    const { students, addStudent } = useCantina();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const navigate = useNavigate();

    const handleAddStudent = (e) => {
        e.preventDefault();
        if (newStudentName.trim()) {
            addStudent(newStudentName);
            setNewStudentName('');
            setIsModalOpen(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ fontSize: '2rem' }}>Alunos</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Novo Aluno
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {students.map(student => (
                    <Card key={student.id} className="student-card" onClick={() => navigate(`/students/${student.id}`)} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                <User size={24} className="text-gradient-primary" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{student.name}</h3>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {student.id.slice(0, 8)}</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Saldo atual</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: student.balance < 0 ? '#ef4444' : '#10b981' }}>
                                R$ {student.balance.toFixed(2)}
                            </span>
                        </div>
                    </Card>
                ))}

                {students.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>Nenhum aluno cadastrado.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Aluno">
                <form onSubmit={handleAddStudent}>
                    <Input
                        label="Nome do Aluno"
                        placeholder="Ex: João Silva"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
