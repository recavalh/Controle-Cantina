import React, { useState, useEffect } from 'react';
import { useCantina } from '../context/CantinaContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
    const { settings, updateSettings } = useCantina();
    const [taxRate, setTaxRate] = useState(settings.operationalTaxRate || 15);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setTaxRate(settings.operationalTaxRate);
    }, [settings]);

    const handleSave = (e) => {
        e.preventDefault();
        updateSettings({ operationalTaxRate: parseFloat(taxRate) });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-gradient-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <SettingsIcon size={28} /> Configurações
            </h2>

            <Card>
                <form onSubmit={handleSave}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        Financeiro & Custos
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Defina uma taxa operacional padrão para cobrir custos indiretos (impostos, taxas de cartão, etc.) de forma genérica.
                            Essa taxa será subtraída do valor de venda para calcular o <strong>Lucro Líquido Real</strong>.
                        </p>
                        <Input
                            label="Taxa Operacional Padrão (%)"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                        {saved && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Configurações salvas!</span>}
                        <Button type="submit">
                            <Save size={18} style={{ marginRight: '0.5rem' }} />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
