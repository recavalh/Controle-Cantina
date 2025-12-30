import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { Plus, Package, Truck, Edit, Trash2, ShoppingBag, FileText, Search, AlertTriangle } from 'lucide-react';

const Products = () => {
    const { products, invoices, addProduct, restockProduct, updateProduct, deleteProduct, bulkRestockProducts, currentUser } = useCantina();

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkRestockModalOpen, setIsBulkRestockModalOpen] = useState(false);
    const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);

    // Selection State
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [stock, setStock] = useState('');
    const [minStock, setMinStock] = useState('5'); // Default min stock
    const [category, setCategory] = useState('Outros');
    const [school, setSchool] = useState('Wizard');

    // Restock State
    const [restockAmount, setRestockAmount] = useState('');

    // Bulk Restock State
    const [bulkCategory, setBulkCategory] = useState(''); // 'Comidas' or 'Bebidas'
    const [bulkItems, setBulkItems] = useState({}); // { productId: quantity }
    const [bulkSupplier, setBulkSupplier] = useState('');
    const [bulkInvoiceNumber, setBulkInvoiceNumber] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    const CATEGORIES = ['Comidas', 'Bebidas', 'Doces', 'Outros'];
    const SUPPLIERS = [...new Set(products.map(p => p.supplier).filter(Boolean))]; // Unique suppliers

    // Init School based on Role
    React.useEffect(() => {
        if (currentUser?.role === 'wizard') {
            setSchool('Wizard');
        } else if (currentUser?.role === 'wizkids') {
            setSchool('WizKids');
        }
    }, [currentUser]);

    const resetForm = () => {
        setName('');
        setPrice('');
        setCostPrice('');
        setSupplier('');
        setStock('');
        setMinStock('5');
        setCategory('Outros');
        if (currentUser?.role === 'admin') setSchool('Wizard');
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        if (name && price) {
            addProduct({
                name,
                price,
                costPrice,
                supplier,
                category,
                initialStock: stock || 0,
                minStock: minStock || 5,
                school
            });
            resetForm();
            setIsAddModalOpen(false);
        }
    };

    const openEdit = (product) => {
        setSelectedProduct(product);
        setName(product.name);
        setPrice(product.price);
        setCostPrice(product.costPrice || '');
        setSupplier(product.supplier || '');
        setStock(product.stock);
        setMinStock(product.minStock || 5);
        setCategory(product.category || 'Outros');
        setSchool(product.school || 'Wizard');
        setIsEditModalOpen(true);
    };

    const handleEditProduct = (e) => {
        e.preventDefault();
        if (selectedProduct && name && price) {
            updateProduct(selectedProduct.id, {
                name,
                price,
                costPrice,
                supplier,
                stock,
                minStock,
                category,
                school
            });
            resetForm();
            setIsEditModalOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleDeleteProduct = () => {
        if (selectedProduct && window.confirm(`Tem certeza que deseja excluir ${selectedProduct.name}?`)) {
            deleteProduct(selectedProduct.id);
            setIsEditModalOpen(false);
            setSelectedProduct(null);
        }
    };

    const openRestock = (product) => {
        setSelectedProduct(product);
        setIsRestockModalOpen(true);
    };

    const handleRestock = (e) => {
        e.preventDefault();
        if (selectedProduct && restockAmount) {
            restockProduct(selectedProduct.id, restockAmount);
            setRestockAmount('');
            setIsRestockModalOpen(false);
            setSelectedProduct(null);
        }
    };

    // Bulk Restock Logic
    const handleBulkCategorySelect = (cat) => {
        setBulkCategory(cat);
        setBulkItems({});
    };

    const handleBulkQuantityChange = (productId, qty) => {
        setBulkItems(prev => ({
            ...prev,
            [productId]: qty
        }));
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        const itemsToUpdate = Object.entries(bulkItems)
            .filter(([_, qty]) => qty && parseInt(qty) > 0)
            .map(([id, qty]) => ({ id, quantity: parseInt(qty) }));

        if (itemsToUpdate.length > 0) {
            bulkRestockProducts(itemsToUpdate, {
                supplier: bulkSupplier || 'Não informado',
                invoiceNumber: bulkInvoiceNumber || 'S/N'
            });
            setIsBulkRestockModalOpen(false);
            setBulkCategory('');
            setBulkItems({});
            setBulkSupplier('');
            setBulkInvoiceNumber('');
        }
    };

    // Group Products Logic
    const filteredProducts = products
        .filter(p => {
            // Role Filter
            if (currentUser?.role !== 'admin') {
                const userSchool = currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard';
                if ((p.school || 'Wizard') !== userSchool) return false;
            }
            return p.name.toLowerCase().includes(searchTerm.toLowerCase());
        });

    const productsByCategory = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = filteredProducts.filter(p => {
            const prodCat = p.category || 'Outros';
            return prodCat === cat || (cat === 'Outros' && !CATEGORIES.includes(prodCat));
        });
        return acc;
    }, {});


    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <datalist id="suppliers">
                {SUPPLIERS.map(s => <option key={s} value={s} />)}
            </datalist>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                <h2 className="text-gradient-primary" style={{ fontSize: '2rem', margin: 0 }}>
                    Produtos {currentUser?.role !== 'admin' && `(${currentUser?.role === 'wizkids' ? 'WizKids' : 'Wizard'})`}
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="ghost" onClick={() => setIsInvoicesModalOpen(true)}>
                        <FileText size={18} style={{ marginRight: '0.5rem' }} />
                        Notas
                    </Button>
                    <Button variant="secondary" onClick={() => { setBulkCategory(''); setBulkItems({}); setIsBulkRestockModalOpen(true); }}>
                        <ShoppingBag size={18} style={{ marginRight: '0.5rem' }} />
                        Compra Fornecedor
                    </Button>
                    <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Novo Produto
                    </Button>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                <Input
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                    style={{ marginBottom: 0 }}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {CATEGORIES.map(category => {
                    const catProducts = productsByCategory[category];
                    if (catProducts.length === 0) return null;

                    return (
                        <div key={category}>
                            <h3 style={{
                                borderBottom: '1px solid var(--glass-border)',
                                paddingBottom: '0.5rem',
                                marginBottom: '1rem',
                                color: 'var(--text-muted)',
                                fontSize: '1.2rem',
                                fontWeight: 500
                            }}>
                                {category}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {catProducts.map(product => {
                                    const threshold = product.minStock || 5;
                                    const isLowStock = product.stock <= threshold;
                                    const isOutOfStock = product.stock === 0;

                                    return (
                                        <Card key={product.id} style={{ position: 'relative', overflow: 'hidden' }}>
                                            {isLowStock && (
                                                <div style={{
                                                    position: 'absolute', top: 0, right: 0,
                                                    background: isOutOfStock ? '#ef4444' : '#f59e0b',
                                                    padding: '4px 12px',
                                                    borderBottomLeftRadius: '12px',
                                                    fontSize: '0.75rem', fontWeight: 'bold',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {isOutOfStock ? (
                                                        <>SEM ESTOQUE</>
                                                    ) : (
                                                        <><AlertTriangle size={12} /> BAIXO: {product.stock}/{threshold}</>
                                                    )}
                                                </div>
                                            )}

                                            {/* Edit Button overlay */}
                                            <button
                                                onClick={() => openEdit(product)}
                                                style={{
                                                    position: 'absolute', top: '10px', left: '10px',
                                                    background: 'rgba(255, 255, 255, 0.1)', border: 'none',
                                                    borderRadius: '50%', width: '30px', height: '30px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', color: 'var(--text-main)'
                                                }}
                                            >
                                                <Edit size={14} />
                                            </button>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', marginTop: '1rem' }}>
                                                <div>
                                                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                            {product.category || 'Outros'} • {product.supplier || 'Fornecedor n/a'}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            width: 'fit-content',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: (product.school || 'Wizard') === 'Wizard' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                            color: (product.school || 'Wizard') === 'Wizard' ? '#fca5a5' : '#93c5fd',
                                                            border: `1px solid ${(product.school || 'Wizard') === 'Wizard' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                                        }}>
                                                            {product.school || 'Wizard'}
                                                        </span>
                                                    </div>
                                                    {product.costPrice > 0 && (
                                                        <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                            Custo: R$ {product.costPrice.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    padding: '8px', borderRadius: '8px',
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                    <Package size={20} className="text-gradient-secondary" />
                                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{product.stock}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                                                    R$ {product.price.toFixed(2)}
                                                </span>
                                                <Button variant="ghost" onClick={() => openRestock(product)} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                                    <Truck size={16} style={{ marginRight: '0.5rem' }} /> Repor
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {filteredProducts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>Nenhum produto cadastrado ou encontrado para esta escola.</p>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Novo Produto">
                <form onSubmit={handleAddProduct}>
                    <Input
                        label="Nome do Produto"
                        placeholder="Ex: Refrigerante Lata"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Preço de Venda (R$)"
                            type="number" step="0.01" min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <Input
                            label="Preço de Custo (R$)"
                            type="number" step="0.01" min="0"
                            value={costPrice}
                            onChange={(e) => setCostPrice(e.target.value)}
                        />
                    </div>

                    {currentUser?.role === 'admin' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Escola</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                    type="button"
                                    variant={school === 'Wizard' ? 'secondary' : 'outline'}
                                    onClick={() => setSchool('Wizard')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: school === 'Wizard' ? '#ef4444' : undefined, color: school === 'Wizard' ? '#fca5a5' : undefined }}
                                >
                                    Wizard
                                </Button>
                                <Button
                                    type="button"
                                    variant={school === 'WizKids' ? 'secondary' : 'outline'}
                                    onClick={() => setSchool('WizKids')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: school === 'WizKids' ? '#3b82f6' : undefined, color: school === 'WizKids' ? '#93c5fd' : undefined }}
                                >
                                    WizKids
                                </Button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Estoque Inicial"
                            type="number" step="1" min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                        <Input
                            label="Alerta de Estoque Mínimo"
                            type="number" step="1" min="0"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#333' }}>{cat}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Fornecedor</label>
                        <input
                            list="suppliers"
                            className="glass-input"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            placeholder="Ex: Coca-Cola Dist."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Produto">
                <form onSubmit={handleEditProduct}>
                    <Input
                        label="Nome do Produto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Preço de Venda (R$)"
                            type="number" step="0.01" min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <Input
                            label="Preço de Custo (R$)"
                            type="number" step="0.01" min="0"
                            value={costPrice}
                            onChange={(e) => setCostPrice(e.target.value)}
                        />
                    </div>

                    {currentUser?.role === 'admin' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Escola</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                    type="button"
                                    variant={school === 'Wizard' ? 'secondary' : 'outline'}
                                    onClick={() => setSchool('Wizard')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: school === 'Wizard' ? '#ef4444' : undefined, color: school === 'Wizard' ? '#fca5a5' : undefined }}
                                >
                                    Wizard
                                </Button>
                                <Button
                                    type="button"
                                    variant={school === 'WizKids' ? 'secondary' : 'outline'}
                                    onClick={() => setSchool('WizKids')}
                                    style={{ flex: 1, justifyContent: 'center', borderColor: school === 'WizKids' ? '#3b82f6' : undefined, color: school === 'WizKids' ? '#93c5fd' : undefined }}
                                >
                                    WizKids
                                </Button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Estoque"
                            type="number" step="1" min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                        <Input
                            label="Alerta de Estoque Mínimo"
                            type="number" step="1" min="0"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#333' }}>{cat}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Fornecedor</label>
                        <input
                            list="suppliers"
                            className="glass-input"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                        <Button type="button" variant="ghost" style={{ color: '#ef4444' }} onClick={handleDeleteProduct}>
                            <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                            Excluir
                        </Button>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Restock Modal */}
            <Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title={`Repor Estoque: ${selectedProduct?.name}`}>
                <form onSubmit={handleRestock}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Estoque atual: <strong>{selectedProduct?.stock}</strong>
                    </p>
                    <Input
                        label="Quantidade a Adicionar"
                        type="number"
                        step="1"
                        min="1"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(e.target.value)}
                        autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button variant="ghost" type="button" onClick={() => setIsRestockModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Confirmar Entrada</Button>
                    </div>
                </form>
            </Modal>

            {/* Bulk Restock Modal */}
            <Modal isOpen={isBulkRestockModalOpen} onClose={() => setIsBulkRestockModalOpen(false)} title="Compra Fornecedor (Entrada em Massa)">
                {!bulkCategory ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '2rem 0' }}>
                        <Button onClick={() => handleBulkCategorySelect('Comidas')} style={{ height: '80px', fontSize: '1.2rem' }}>
                            🍔 Comidas
                        </Button>
                        <Button onClick={() => handleBulkCategorySelect('Bebidas')} style={{ height: '80px', fontSize: '1.2rem' }}>
                            🥤 Bebidas
                        </Button>
                        <Button onClick={() => handleBulkCategorySelect('Doces')} style={{ height: '80px', fontSize: '1.2rem' }}>
                            🍬 Doces
                        </Button>
                        <Button variant="outline" onClick={() => handleBulkCategorySelect('Outros')} style={{ height: '80px', fontSize: '1.2rem' }}>
                            📦 Outros
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleBulkSubmit}>
                        {/* Invoice Metadata Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ marginBottom: 0 }}>
                                <label className="input-label">Fornecedor</label>
                                <input
                                    list="suppliers"
                                    className="glass-input"
                                    value={bulkSupplier}
                                    onChange={(e) => setBulkSupplier(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Input
                                label="Nº da Nota Fiscal"
                                placeholder="12345"
                                value={bulkInvoiceNumber}
                                onChange={(e) => setBulkInvoiceNumber(e.target.value)}
                                style={{ marginBottom: 0 }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <Button variant="ghost" size="sm" onClick={() => setBulkCategory('')} style={{ paddingLeft: 0 }}>
                                ← Voltar para categorias
                            </Button>
                            <h3 className="text-gradient-primary" style={{ marginTop: '0.5rem' }}>Entrada: {bulkCategory}</h3>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {products.filter(p => (p.category || 'Outros') === bulkCategory).map(product => (
                                <div key={product.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem', marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Atual: {product.stock}</div>
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <Input
                                            placeholder="+ Qtd"
                                            type="number"
                                            min="0"
                                            value={bulkItems[product.id] || ''}
                                            onChange={(e) => handleBulkQuantityChange(product.id, e.target.value)}
                                            style={{ margin: 0, padding: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {products.filter(p => (p.category || 'Outros') === bulkCategory).length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum produto nesta categoria.</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button variant="ghost" type="button" onClick={() => setIsBulkRestockModalOpen(false)}>Cancelar</Button>
                            <Button type="submit">Confirmar Entrada</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Invoices List Modal */}
            <Modal isOpen={isInvoicesModalOpen} onClose={() => setIsInvoicesModalOpen(false)} title="Notas de Entrada Importadas">
                <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {invoices.length > 0 ? invoices.map(inv => (
                        <Card key={inv.id} style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Nota #{inv.number}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{new Date(inv.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Fornecedor: <strong style={{ color: 'white' }}>{inv.supplier}</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.5rem' }}>
                                {inv.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        <span>{item.productName}</span>
                                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>+{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Nenhuma nota lançada.
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button onClick={() => setIsInvoicesModalOpen(false)}>Fechar</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
