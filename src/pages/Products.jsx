import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { Plus, Package, Truck, Edit, Trash2, ShoppingBag } from 'lucide-react';

const Products = () => {
    const { products, addProduct, restockProduct, updateProduct, deleteProduct, bulkRestockProducts } = useCantina();

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkRestockModalOpen, setIsBulkRestockModalOpen] = useState(false);

    // Selection State
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('Outros');

    // Restock State
    const [restockAmount, setRestockAmount] = useState('');

    // Bulk Restock State
    const [bulkCategory, setBulkCategory] = useState(''); // 'Comidas' or 'Bebidas'
    const [bulkItems, setBulkItems] = useState({}); // { productId: quantity }

    const CATEGORIES = ['Comidas', 'Bebidas', 'Doces', 'Outros'];

    const resetForm = () => {
        setName('');
        setPrice('');
        setCostPrice('');
        setSupplier('');
        setStock('');
        setCategory('Outros');
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        if (name && price) {
            addProduct({ name, price, costPrice, supplier, category, initialStock: stock || 0 });
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
        setCategory(product.category || 'Outros');
        setIsEditModalOpen(true);
    };

    const handleEditProduct = (e) => {
        e.preventDefault();
        if (selectedProduct && name && price) {
            updateProduct(selectedProduct.id, { name, price, costPrice, supplier, stock, category });
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
            bulkRestockProducts(itemsToUpdate);
            setIsBulkRestockModalOpen(false);
            setBulkCategory('');
            setBulkItems({});
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ fontSize: '2rem' }}>Produtos & Estoque</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => {
                    const isLowStock = product.stock < 5;
                    const isOutOfStock = product.stock === 0;
                    return (
                        <Card key={product.id} style={{ position: 'relative', overflow: 'hidden' }}>
                            {isLowStock && (
                                <div style={{
                                    position: 'absolute', top: 0, right: 0,
                                    background: isOutOfStock ? '#ef4444' : '#f59e0b',
                                    padding: '4px 12px',
                                    borderBottomLeftRadius: '12px',
                                    fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {isOutOfStock ? 'SEM ESTOQUE' : 'BAIXO ESTOQUE'}
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
                                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {product.category || 'Outros'} • {product.supplier || 'Fornecedor n/a'}
                                    </p>
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

                {products.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>Nenhum produto cadastrado.</p>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Estoque Inicial"
                            type="number" step="1" min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
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
                    </div>

                    <Input
                        label="Fornecedor"
                        placeholder="Ex: Coca-Cola Dist."
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                    />
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Estoque"
                            type="number" step="1" min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
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
                    </div>
                    <Input
                        label="Fornecedor"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                    />
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
                        <div style={{ marginBottom: '1rem' }}>
                            <Button variant="ghost" size="sm" onClick={() => setBulkCategory('')} style={{ paddingLeft: 0 }}>
                                ← Voltar para categorias
                            </Button>
                            <h3 className="text-gradient-primary" style={{ marginTop: '0.5rem' }}>Entrada: {bulkCategory}</h3>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
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
        </div>
    );
};

export default Products;
