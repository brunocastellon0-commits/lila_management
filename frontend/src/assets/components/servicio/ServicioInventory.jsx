import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, TrendingDown, X, ChevronUp, ChevronDown } from 'lucide-react';
import servicioApi from '../../../services/servicioApi';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';



// Los datos serán cargados dinámicamente desde la API

const CATEGORIES = [
    { key: 'todos', label: 'Todos', color: '#8B8B99' },
    { key: 'carnes', label: 'Carnes & Proteínas', color: '#F97316' },
    { key: 'vegetales', label: 'Vegetales', color: '#4ADE80' },
    { key: 'lacteos', label: 'Lácteos', color: '#38BDF8' },
    { key: 'bebidas', label: 'Bebidas', color: '#A78BFA' },
    { key: 'especias', label: 'Especias & Oils', color: '#D4AF37' },
];

function getStockLevel(item) {
    const ratio = item.stock / item.maxStock;
    if (item.stock < item.minStock) return 'critical';
    if (ratio < 0.3) return 'low';
    if (ratio > 0.75) return 'high';
    return 'ok';
}

function getStockBarColor(level) {
    switch (level) {
        case 'critical': return '#EF4444';
        case 'low': return '#D4AF37';
        case 'ok': return '#2DD4BF';
        case 'high': return '#2DD4BF';
    }
}

export function Inventory() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [adjustDelta, setAdjustDelta] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        try {
            const data = await servicioApi.getInventario();
            setItems(data.map(item => ({
                id: item.id,
                name: item.nombre_producto,
                category: item.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                stock: parseFloat(item.cantidad_actual),
                unit: item.unidad,
                minStock: parseFloat(item.min_stock),
                maxStock: parseFloat(item.max_stock),
                costPerUnit: parseFloat(item.costo_unitario)
            })));
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filtered = items.filter((item) => {
        const matchCat = activeCategory === 'todos' || item.category === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const criticalCount = items.filter((i) => getStockLevel(i) === 'critical').length;

    async function applyAdjustment() {
        if (!adjustingItem || adjustDelta === 0) return;
        
        try {
            await servicioApi.registrarRecepcion({
                id_inventario_local: adjustingItem.id,
                cantidad_recibida: adjustDelta,
                recibido_por: 1 // Default usuario admin
            });
            await fetchInventory(); // Refrescar stock
        } catch (error) {
            console.error("Error al ajustar stock:", error);
            alert("No se pudo registrar el ajuste de stock.");
        }
        
        setAdjustingItem(null);
        setAdjustDelta(0);
    }

    const catColor = CATEGORIES.find((c) => c.key === activeCategory)?.color || '#8B8B99';

    return (
        <div className="p-6 space-y-5" style={{ fontFamily: SANS }}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.7rem', fontWeight: 600, lineHeight: 1.2 }}>
                        Gestión de Insumos
                    </h1>
                    <p style={{ color: '#5A5A6A', fontSize: '0.82rem', marginTop: '4px' }}>
                        {items.length} insumos registrados · {criticalCount} en nivel crítico
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-85"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #9A7D28 100%)',
                        color: '#0F0F12',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        boxShadow: '0 0 20px rgba(212,175,55,0.25)',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Ajuste de Stock
                </button>
            </div>

            {/* Critical banner */}
            {criticalCount > 0 && (
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                        backgroundColor: 'rgba(212,175,55,0.06)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        boxShadow: '0 0 20px rgba(212,175,55,0.06)',
                    }}
                >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
                    <span style={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: 500 }}>
                        {criticalCount} insumo{criticalCount > 1 ? 's' : ''} por debajo del stock mínimo.
                    </span>
                </div>
            )}

            {/* Search + Category filters */}
            <div className="flex items-center gap-3">
                <div
                    className="relative flex-1 max-w-sm"
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4A4A5A' }} />
                    <input
                        type="text"
                        placeholder="Buscar insumos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all duration-200"
                        style={{
                            backgroundColor: '#1C1C21',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#F0EAD6',
                            fontSize: '0.85rem',
                        }}
                    />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {CATEGORIES.map(({ key, label, color }) => {
                        const isActive = activeCategory === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className="px-3 py-2 rounded-xl transition-all duration-200"
                                style={{
                                    backgroundColor: isActive ? `${color}15` : 'rgba(255,255,255,0.03)',
                                    border: isActive ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)',
                                    color: isActive ? color : '#5A5A6A',
                                    fontSize: '0.78rem',
                                    fontWeight: isActive ? 600 : 400,
                                    cursor: 'pointer',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {filtered.map((item) => {
                    const level = getStockLevel(item);
                    const barColor = getStockBarColor(level);
                    const barWidth = Math.min(100, (item.stock / item.maxStock) * 100);
                    const isCritical = level === 'critical';
                    const catInfo = CATEGORIES.find((c) => c.key === item.category);

                    return (
                        <div
                            key={item.id}
                            className="p-4 rounded-2xl transition-all duration-300"
                            style={{
                                backgroundColor: '#1C1C21',
                                border: isCritical ? '1px solid rgba(212,175,55,0.22)' : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: isCritical
                                    ? '0 0 24px rgba(212,175,55,0.1), 0 0 0 1px rgba(212,175,55,0.08), 0 8px 24px rgba(0,0,0,0.4)'
                                    : '0 0 0 1px rgba(212,175,55,0.03), 0 6px 24px rgba(0,0,0,0.35)',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div style={{ color: '#E8E0D0', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.3 }}>
                                        {item.name}
                                    </div>
                                    <div
                                        className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${catInfo?.color}12`,
                                            border: `1px solid ${catInfo?.color}25`,
                                        }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catInfo?.color }} />
                                        <span style={{ color: catInfo?.color, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                            {catInfo?.label}
                                        </span>
                                    </div>
                                </div>
                                {isCritical && (
                                    <div
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
                                        style={{
                                            backgroundColor: 'rgba(212,175,55,0.1)',
                                            border: '1px solid rgba(212,175,55,0.25)',
                                        }}
                                    >
                                        <AlertTriangle className="w-3 h-3" style={{ color: '#D4AF37' }} />
                                        <span style={{ color: '#D4AF37', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                                            CRÍTICO
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Stock amount */}
                            <div className="flex items-end gap-1.5 mb-3">
                                <span style={{ fontFamily: SERIF, color: isCritical ? '#D4AF37' : '#F0EAD6', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1 }}>
                                    {item.stock}
                                </span>
                                <span style={{ color: '#5A5A6A', fontSize: '0.75rem', marginBottom: '2px' }}>{item.unit}</span>
                                <span style={{ color: '#3A3A4A', fontSize: '0.72rem', marginBottom: '2px', marginLeft: '4px' }}>
                                    / {item.maxStock} {item.unit} máx
                                </span>
                            </div>

                            {/* Stock bar */}
                            <div className="mb-3">
                                <div
                                    className="w-full h-1.5 rounded-full overflow-hidden"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${barWidth}%`,
                                            backgroundColor: barColor,
                                            boxShadow: isCritical ? `0 0 8px ${barColor}60` : 'none',
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span style={{ color: '#3A3A4A', fontSize: '0.62rem' }}>
                                        Mín: {item.minStock} {item.unit}
                                    </span>
                                    <span style={{ color: barColor, fontSize: '0.65rem', fontWeight: 500 }}>
                                        {Math.round(barWidth)}%
                                    </span>
                                </div>
                            </div>

                            {/* Adjust button */}
                            <button
                                onClick={() => { setAdjustingItem(item); setAdjustDelta(0); }}
                                className="w-full py-2 rounded-xl text-center transition-all duration-200 hover:opacity-85"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    color: '#6B6B7B',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Ajustar stock
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Adjust Stock Modal */}
            {adjustingItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) { setAdjustingItem(null); setAdjustDelta(0); } }}
                >
                    <div
                        className="w-80 rounded-2xl overflow-hidden"
                        style={{
                            backgroundColor: '#1C1C21',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.08)',
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <h3 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1rem', fontWeight: 600 }}>
                                Ajuste de Stock
                            </h3>
                            <button
                                onClick={() => { setAdjustingItem(null); setAdjustDelta(0); }}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                style={{ color: '#5A5A6A' }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <div style={{ color: '#E8E0D0', fontSize: '0.9rem', fontWeight: 500 }}>{adjustingItem.name}</div>
                                <div style={{ color: '#5A5A6A', fontSize: '0.78rem', marginTop: '2px' }}>
                                    Stock actual: <span style={{ color: '#D4AF37' }}>{adjustingItem.stock} {adjustingItem.unit}</span>
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#8B8B99', fontSize: '0.78rem', marginBottom: '8px' }}>Cantidad a ajustar</div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setAdjustDelta((d) => parseFloat((d - 0.5).toFixed(1)))}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B8B99', cursor: 'pointer' }}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <div
                                        className="flex-1 text-center py-2 rounded-xl"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: adjustDelta >= 0 ? '#2DD4BF' : '#EF4444',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {adjustDelta >= 0 ? '+' : ''}{adjustDelta} {adjustingItem.unit}
                                    </div>
                                    <button
                                        onClick={() => setAdjustDelta((d) => parseFloat((d + 0.5).toFixed(1)))}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B8B99', cursor: 'pointer' }}
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="flex items-center justify-between px-3 py-2 rounded-xl"
                                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <span style={{ color: '#5A5A6A', fontSize: '0.78rem' }}>Resultado</span>
                                <span style={{ color: '#F0EAD6', fontSize: '0.9rem', fontWeight: 600 }}>
                                    {Math.max(0, parseFloat((adjustingItem.stock + adjustDelta).toFixed(2)))} {adjustingItem.unit}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => { setAdjustingItem(null); setAdjustDelta(0); }}
                                    className="flex-1 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#8B8B99',
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={applyAdjustment}
                                    className="flex-1 py-2.5 rounded-xl transition-all duration-200 hover:opacity-85"
                                    style={{
                                        background: 'linear-gradient(135deg, #D4AF37 0%, #9A7D28 100%)',
                                        color: '#0F0F12',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
                                    }}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
