import React, { useState } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { Plus, Package, Truck, AlertTriangle } from 'lucide-react';

const Products = () => {
    const { products, addProduct, restockProduct } = useCantina();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [stock, setStock] = useState('');
    const [restockAmount, setRestockAmount] = useState('');

    const handleAddProduct = (e) => {
        e.preventDefault();
        if (name && price) {
            addProduct({ name, price, supplier, initialStock: stock || 0 });
            setName('');
            setPrice('');
            setSupplier('');
            setStock('');
            setIsAddModalOpen(false);
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="text-gradient-primary" style={{ fontSize: '2rem' }}>Produtos & Estoque</h2>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Novo Produto
                </Button>
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

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {product.supplier || 'Fornecedor não inf.'}
                                    </p>
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
                            label="Estoque Inicial"
                            type="number" step="1" min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
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
        </div>
    );
};

export default Products;
