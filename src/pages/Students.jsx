import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { Plus, User, Edit, Trash2, Power, EyeOff, Archive, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Students = () => {
    const { students, addStudent, updateStudent, deleteStudent, toggleStudentStatus, currentUser } = useCantina();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentSchool, setNewStudentSchool] = useState('Wizard');
    const [searchTerm, setSearchTerm] = useState('');

    // View State
    const [showInactive, setShowInactive] = useState(false);

    // Edit State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editStudentName, setEditStudentName] = useState('');
    const [editStudentSchool, setEditStudentSchool] = useState('Wizard');

    const navigate = useNavigate();

    // Init School based on Role
    React.useEffect(() => {
        if (currentUser?.role === 'wizard') {
            setNewStudentSchool('Wizard');
        } else if (currentUser?.role === 'wizkids') {
            setNewStudentSchool('WizKids');
        }
    }, [currentUser]);


    // Filter Logic
    const filteredStudents = students
        .filter(student => {
            // Role Filter
            if (currentUser?.role !== 'admin') {
                const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
                if ((student.school || 'Wizard') !== userSchool) return false;
            }
            // Filter by Active/Inactive status
            const isActive = student.active !== false; // Default to true if undefined
            if (showInactive) return !isActive;
            return isActive;
        })
        .filter(student =>
            // Filter by Search Term
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Sort Alphabetically
    const sortedStudents = [...filteredStudents].sort((a, b) => a.name.localeCompare(b.name));

    const handleAddStudent = (e) => {
        e.preventDefault();
        if (newStudentName.trim()) {
            addStudent(newStudentName, newStudentSchool);
            setNewStudentName('');
            // Reset school to default only if admin, else keep user's school
            if (currentUser?.role === 'admin') setNewStudentSchool('Wizard');
            setIsModalOpen(false);
        }
    };

    const handleStudentClick = (id) => {
        navigate(`/students/${id}`);
    };

    const openEdit = (e, student) => {
        e.stopPropagation(); // Prevent navigating to details
        setSelectedStudent(student);
        setEditStudentName(student.name);
        setEditStudentSchool(student.school || 'Wizard');
        setIsEditModalOpen(true);
    };

    const handleEditStudent = (e) => {
        e.preventDefault();
        if (selectedStudent && editStudentName.trim()) {
            updateStudent(selectedStudent.id, { name: editStudentName, school: editStudentSchool });
            setIsEditModalOpen(false);
            setSelectedStudent(null);
        }
    };

    const handleDeleteStudent = () => {
        if (selectedStudent) {
            if (window.confirm(`Tem certeza que deseja excluir ${selectedStudent.name}? Os dados financeiros serão mantidos, mas o acesso ao histórico individual será removido.`)) {
                deleteStudent(selectedStudent.id);
                setIsEditModalOpen(false);
                setSelectedStudent(null);
            }
        }
    };

    const handleToggleStatus = () => {
        if (selectedStudent) {
            toggleStudentStatus(selectedStudent.id);
            // Close modal to refresh view context naturally, as the student will disappear from current list
            setIsEditModalOpen(false);
            setSelectedStudent(null);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ margin: 0 }}>
                    {showInactive ? 'Alunos Inativos' : 'Alunos'} {currentUser?.role !== 'admin' && `(${currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard'})`}
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant={showInactive ? 'primary' : 'secondary'} onClick={() => setShowInactive(!showInactive)}>
                        {showInactive ? (
                            <>
                                <User size={18} style={{ marginRight: '0.5rem' }} />
                                Ver Ativos
                            </>
                        ) : (
                            <>
                                <Archive size={18} style={{ marginRight: '0.5rem' }} />
                                Ver Inativos
                            </>
                        )}
                    </Button>
                    {!showInactive && (
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            Novo Aluno
                        </Button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <Input
                    placeholder={showInactive ? "Buscar aluno inativo..." : "Buscar aluno..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {sortedStudents.map(student => (
                    <Card key={student.id}
                        onClick={() => handleStudentClick(student.id)}
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            opacity: student.active === false ? 0.7 : 1,
                            position: 'relative',
                            borderColor: student.active === false ? 'var(--glass-border)' : undefined,
                            background: student.active === false ? 'rgba(0,0,0,0.2)' : undefined
                        }}
                        className="hover-scale"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: '50%',
                                background: student.active === false ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.1)',
                                color: student.active === false ? 'var(--text-muted)' : '#6366f1'
                            }}>
                                <User size={24} />
                            </div>
                            <span style={{
                                fontWeight: 'bold',
                                color: student.balance < 0 ? '#ef4444' : (student.active === false ? 'var(--text-muted)' : '#10b981'),
                                fontSize: '1.1rem'
                            }}>
                                R$ {student.balance.toFixed(2)}
                            </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem', color: student.active === false ? 'var(--text-muted)' : 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                            {student.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: (student.school || 'Wizard') === 'Wizard' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: (student.school || 'Wizard') === 'Wizard' ? '#fca5a5' : '#93c5fd',
                                border: `1px solid ${(student.school || 'Wizard') === 'Wizard' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                            }}>
                                {student.school || 'Wizard'}
                            </span>
                            {student.active === false && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', padding: '2px 6px', borderRadius: '4px' }}>
                                    INATIVO
                                </span>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => openEdit(e, student)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '4px',
                                color: 'var(--text-muted)'
                            }}
                        >
                            <Edit size={16} />
                        </Button>
                    </Card>
                ))}

                {sortedStudents.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>
                        {showInactive ? 'Nenhum aluno inativo encontrado.' : 'Nenhum aluno cadastrado para esta escola.'}
                    </p>
                )}
            </div>

            {/* Add Student Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Aluno">
                <form onSubmit={handleAddStudent}>
                    <Input
                        label="Nome do Aluno"
                        placeholder="Ex: João Silva"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        autoFocus
                    />

                    {currentUser?.role === 'admin' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Escola</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                    type="button"
                                    variant={newStudentSchool === 'Wizard' ? 'secondary' : 'outline'}
                                    onClick={() => setNewStudentSchool('Wizard')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: newStudentSchool === 'Wizard' ? '#ef4444' : undefined, color: newStudentSchool === 'Wizard' ? '#fca5a5' : undefined }}
                                >
                                    Wizard
                                </Button>
                                <Button
                                    type="button"
                                    variant={newStudentSchool === 'WizKids' ? 'secondary' : 'outline'}
                                    onClick={() => setNewStudentSchool('WizKids')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: newStudentSchool === 'WizKids' ? '#3b82f6' : undefined, color: newStudentSchool === 'WizKids' ? '#93c5fd' : undefined }}
                                >
                                    WizKids
                                </Button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit/Manage Student Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={showInactive ? "Gerenciar Aluno Inativo" : "Editar Aluno"}>
                <form onSubmit={handleEditStudent}>
                    <Input
                        label="Nome do Aluno"
                        value={editStudentName}
                        onChange={(e) => setEditStudentName(e.target.value)}
                        autoFocus
                    />

                    {currentUser?.role === 'admin' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Escola</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                    type="button"
                                    variant={editStudentSchool === 'Wizard' ? 'secondary' : 'outline'}
                                    onClick={() => setEditStudentSchool('Wizard')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: editStudentSchool === 'Wizard' ? '#ef4444' : undefined, color: editStudentSchool === 'Wizard' ? '#fca5a5' : undefined }}
                                >
                                    Wizard
                                </Button>
                                <Button
                                    type="button"
                                    variant={editStudentSchool === 'WizKids' ? 'secondary' : 'outline'}
                                    onClick={() => setEditStudentSchool('WizKids')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: editStudentSchool === 'WizKids' ? '#3b82f6' : undefined, color: editStudentSchool === 'WizKids' ? '#93c5fd' : undefined }}
                                >
                                    WizKids
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status Toggle Button */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Button
                            type="button"
                            variant={selectedStudent?.active === false ? "primary" : "secondary"}
                            onClick={handleToggleStatus}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {selectedStudent?.active !== false ? (
                                <>
                                    <EyeOff size={18} style={{ marginRight: '0.5rem' }} />
                                    Inativar Aluno
                                </>
                            ) : (
                                <>
                                    <Undo2 size={18} style={{ marginRight: '0.5rem' }} />
                                    Reativar Aluno
                                </>
                            )}
                        </Button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                            {selectedStudent?.active !== false
                                ? "O aluno será movido para a lista de Inativos."
                                : "O aluno voltará a aparecer na lista principal e nas vendas."}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                        <Button type="button" variant="ghost" style={{ color: '#ef4444' }} onClick={handleDeleteStudent}>
                            <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                            Excluir Definitivamente
                        </Button>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
