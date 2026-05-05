import { useState, useMemo, useEffect } from 'react';
import {
    Search, Calendar, X, ChevronDown, CreditCard,
    Banknote, QrCode, CheckCircle2, XCircle, Clock, ChevronRight,
    User, Hash, Receipt, Percent, Minus
} from 'lucide-react';
import servicioApi from '../../../services/servicioApi';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';


// Los datos se cargarán por API


const payIcons = {
    qr: QrCode,
    efectivo: Banknote,
    tarjeta: CreditCard,
};
const payLabel = {
    qr: 'QR', efectivo: 'Efectivo', tarjeta: 'Tarjeta',
};
const payColor = {
    qr: '#A78BFA', efectivo: '#4ADE80', tarjeta: '#38BDF8',
};
const statusConfig = {
    pagado: { color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.25)', label: 'Pagado', Icon: CheckCircle2 },
    anulado: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Anulado', Icon: XCircle },
    en_proceso: { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.25)', label: 'En Proceso', Icon: Clock },
};

const CARD = {
    backgroundColor: '#1C1C21',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    boxShadow: '0 0 0 1px rgba(212,175,55,0.03), 0 8px 28px rgba(0,0,0,0.4)',
};

export function OrdersHistory() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [payFilter, setPayFilter] = useState('todos');
    const [dateFilter, setDateFilter] = useState('hoy');
    const [waiterFilter, setWaiterFilter] = useState('Todos');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [waiterDropOpen, setWaiterDropOpen] = useState(false);
    
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await servicioApi.getHistorialPedidos();
                const mapped = data.map(pedido => {
                    const dt = new Date(pedido.fecha_creacion);
                    const pm = pedido.metodo_pago ? pedido.metodo_pago.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'efectivo';
                    return {
                        id: `#${String(pedido.id).padStart(4, '0')}`,
                        tableNumber: pedido.id_mesa || 'Llevar',
                        date: dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        time: dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        waiter: pedido.nombre_mesero || 'Sin asignar',
                        paymentMethod: pm === 'tarjeta de credito' ? 'tarjeta' : (pm.includes('qr') ? 'qr' : (pm === 'tarjeta' ? 'tarjeta' : 'efectivo')),
                        status: ['Completado', 'Pagado'].includes(pedido.estado_pedido) ? 'pagado' : 'en_proceso',
                        covers: pedido.cubiertos || 0,
                        items: (pedido.detalles || []).map(d => ({
                            name: d.nombre_producto,
                            qty: d.cantidad,
                            price: parseFloat(d.precio_unitario)
                        })),
                        subtotal: parseFloat(pedido.subtotal || 0),
                        tax: parseFloat(pedido.impuestos || 0),
                        discount: 0,
                        total: parseFloat(pedido.total || 0)
                    };
                });
                setOrders(mapped);
            } catch (err) {
                console.error("Error fetching order history:", err);
            }
        };
        fetchHistory();
    }, []);

    const dynamicWaiters = useMemo(() => {
        const set = new Set(orders.map(o => o.waiter));
        return ['Todos', ...Array.from(set)];
    }, [orders]);

    const filtered = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        
        return orders.filter((o) => {
            if (statusFilter !== 'todos' && o.status !== statusFilter) return false;
            if (payFilter !== 'todos' && o.paymentMethod !== payFilter) return false;
            if (waiterFilter !== 'Todos' && o.waiter !== waiterFilter) return false;
            if (dateFilter === 'hoy' && !o.date.startsWith(todayStr)) return false;
            if (search && !o.id.toLowerCase().includes(search.toLowerCase()) &&
                !o.waiter.toLowerCase().includes(search.toLowerCase()) &&
                !`mesa ${o.tableNumber}`.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [orders, statusFilter, payFilter, waiterFilter, dateFilter, search]);

    const totalRevenue = filtered.filter(o => o.status === 'pagado').reduce((s, o) => s + o.total, 0);

    return (
        <div className="flex" style={{ fontFamily: SANS, alignItems: 'flex-start' }}>
            {/* Main content */}
            <div
                className="flex-1 min-w-0 p-6 space-y-5"
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.7rem', fontWeight: 600, lineHeight: 1.2 }}>
                            Historial de Pedidos
                        </h1>
                        <p style={{ color: '#5A5A6A', fontSize: '0.82rem', marginTop: '4px' }}>
                            {filtered.length} pedidos · Recaudado: <span style={{ color: '#D4AF37', fontWeight: 600 }}>${totalRevenue.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Filters card */}
                <div className="p-4" style={CARD}>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#4A4A5A' }} />
                            <input
                                type="text"
                                placeholder="Buscar pedido, mesa, mesero..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-xl outline-none"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    color: '#E8E0D0',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>

                        {/* Date filter */}
                        <div className="flex items-center gap-1 p-0.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {(['hoy', 'semana', 'mes']).map((d) => (
                                <button key={d} onClick={() => setDateFilter(d)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 capitalize"
                                    style={{
                                        backgroundColor: dateFilter === d ? 'rgba(212,175,55,0.12)' : 'transparent',
                                        color: dateFilter === d ? '#D4AF37' : '#5A5A6A',
                                        border: dateFilter === d ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
                                        fontSize: '0.78rem',
                                        fontWeight: dateFilter === d ? 600 : 400,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Calendar className="w-3 h-3" />
                                    {d === 'hoy' ? 'Hoy' : d === 'semana' ? 'Semana' : 'Mes'}
                                </button>
                            ))}
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1.5">
                            {(['todos', 'pagado', 'en_proceso', 'anulado']).map((s) => {
                                const cfg = s !== 'todos' ? statusConfig[s] : null;
                                const isActive = statusFilter === s;
                                return (
                                    <button key={s} onClick={() => setStatusFilter(s)}
                                        className="px-3 py-1.5 rounded-lg transition-all duration-200"
                                        style={{
                                            backgroundColor: isActive ? (cfg ? cfg.bg : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.03)',
                                            border: isActive ? `1px solid ${cfg ? cfg.border : 'rgba(255,255,255,0.15)'}` : '1px solid rgba(255,255,255,0.06)',
                                            color: isActive ? (cfg ? cfg.color : '#F0EAD6') : '#5A5A6A',
                                            fontSize: '0.75rem',
                                            fontWeight: isActive ? 600 : 400,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {s === 'todos' ? 'Todos' : statusConfig[s].label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Payment method filter */}
                        <div className="flex items-center gap-1.5">
                            {(['todos', 'qr', 'efectivo', 'tarjeta']).map((pm) => {
                                const isActive = payFilter === pm;
                                const PMIcon = pm !== 'todos' ? payIcons[pm] : null;
                                const pmColor = pm !== 'todos' ? payColor[pm] : '#8B8B99';
                                return (
                                    <button key={pm} onClick={() => setPayFilter(pm)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
                                        style={{
                                            backgroundColor: isActive ? `${pmColor}15` : 'rgba(255,255,255,0.03)',
                                            border: isActive ? `1px solid ${pmColor}30` : '1px solid rgba(255,255,255,0.06)',
                                            color: isActive ? pmColor : '#5A5A6A',
                                            fontSize: '0.75rem',
                                            fontWeight: isActive ? 600 : 400,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {PMIcon && <PMIcon className="w-3 h-3" />}
                                        {pm === 'todos' ? 'Todo método' : payLabel[pm]}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Waiter filter */}
                        <div className="relative">
                            <button
                                onClick={() => setWaiterDropOpen(!waiterDropOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                                style={{
                                    backgroundColor: waiterFilter !== 'Todos' ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: waiterFilter !== 'Todos' ? '1px solid rgba(45,212,191,0.25)' : '1px solid rgba(255,255,255,0.06)',
                                    color: waiterFilter !== 'Todos' ? '#2DD4BF' : '#5A5A6A',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <User className="w-3 h-3" />
                                {waiterFilter !== 'Todos' ? waiterFilter : 'Mesero'}
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {waiterDropOpen && (
                                <div
                                    className="absolute left-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-50"
                                    style={{ backgroundColor: '#1E1E24', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}
                                >
                                    {dynamicWaiters.map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => { setWaiterFilter(w); setWaiterDropOpen(false); }}
                                            className="w-full text-left px-3 py-2 transition-all duration-150 hover:bg-white/5"
                                            style={{
                                                color: waiterFilter === w ? '#2DD4BF' : '#8B8B99',
                                                fontSize: '0.8rem',
                                                fontWeight: waiterFilter === w ? 500 : 400,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear filters */}
                        {(statusFilter !== 'todos' || payFilter !== 'todos' || waiterFilter !== 'Todos' || search) && (
                            <button
                                onClick={() => { setStatusFilter('todos'); setPayFilter('todos'); setWaiterFilter('Todos'); setSearch(''); }}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                style={{ color: '#5A5A6A', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                <X className="w-3 h-3" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Orders list */}
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <Receipt className="w-6 h-6" style={{ color: '#3A3A4A' }} />
                            </div>
                            <p style={{ color: '#5A5A6A', fontSize: '0.88rem' }}>No se encontraron pedidos</p>
                        </div>
                    ) : (
                        filtered.map((order) => {
                            const sc = statusConfig[order.status];
                            const StatusIcon = sc.Icon;
                            const PayIcon = payIcons[order.paymentMethod];
                            const pColor = payColor[order.paymentMethod];
                            const isSelected = selectedOrder?.id === order.id;

                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                                    className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
                                    style={{
                                        backgroundColor: isSelected ? '#222228' : '#1C1C21',
                                        border: isSelected ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: isSelected ? '0 0 0 1px rgba(212,175,55,0.06), 0 4px 20px rgba(0,0,0,0.4)' : 'none',
                                    }}
                                >
                                    {/* ID */}
                                    <div style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 700, width: '60px', flexShrink: 0 }}>
                                        {order.id}
                                    </div>

                                    {/* Table */}
                                    <div style={{ color: '#E8E0D0', fontSize: '0.85rem', width: '66px', flexShrink: 0 }}>
                                        Mesa {order.tableNumber}
                                    </div>

                                    {/* Date & Time */}
                                    <div style={{ width: '110px', flexShrink: 0 }}>
                                        <div style={{ color: '#E8E0D0', fontSize: '0.8rem' }}>{order.date}</div>
                                        <div style={{ color: '#4A4A5A', fontSize: '0.72rem' }}>{order.time}</div>
                                    </div>

                                    {/* Waiter */}
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                                            style={{ background: 'linear-gradient(135deg, #2DD4BF40, #0F766E40)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)', fontSize: '0.55rem' }}
                                        >
                                            {order.waiter.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ color: '#8B8B99', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.waiter}
                                        </span>
                                    </div>

                                    {/* Payment method */}
                                    <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
                                        style={{ backgroundColor: `${pColor}12`, border: `1px solid ${pColor}25` }}
                                    >
                                        <PayIcon className="w-3 h-3" style={{ color: pColor }} />
                                        <span style={{ color: pColor, fontSize: '0.72rem', fontWeight: 500 }}>
                                            {payLabel[order.paymentMethod]}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
                                        style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}
                                    >
                                        <StatusIcon className="w-3 h-3" style={{ color: sc.color }} />
                                        <span style={{ color: sc.color, fontSize: '0.72rem', fontWeight: 600 }}>
                                            {sc.label}
                                        </span>
                                    </div>

                                    {/* Items count */}
                                    <div style={{ color: '#5A5A6A', fontSize: '0.78rem', width: '52px', textAlign: 'right', flexShrink: 0 }}>
                                        {order.items.length} ítems
                                    </div>

                                    {/* Total */}
                                    <div style={{ color: '#F0EAD6', fontSize: '0.92rem', fontWeight: 700, width: '72px', textAlign: 'right', flexShrink: 0 }}>
                                        ${order.total.toLocaleString()}
                                    </div>

                                    {/* Chevron */}
                                    <ChevronRight
                                        className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                                        style={{ color: isSelected ? '#D4AF37' : '#3A3A4A', transform: isSelected ? 'rotate(90deg)' : 'none' }}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            {selectedOrder && (
                <div
                    className="flex-shrink-0 overflow-y-auto"
                    style={{
                        width: '380px',
                        position: 'sticky',
                        top: 0,
                        maxHeight: 'calc(100vh - 57px)',
                        backgroundColor: '#1A1A1F',
                        borderLeft: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Panel header */}
                    <div
                        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
                        style={{
                            backgroundColor: '#1A1A1F',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <div>
                            <div style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.05rem', fontWeight: 600 }}>
                                Detalle del Pedido
                            </div>
                            <div style={{ color: '#5A5A6A', fontSize: '0.75rem', marginTop: '1px' }}>
                                {selectedOrder.id} · Mesa {selectedOrder.tableNumber}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                            style={{ color: '#5A5A6A', cursor: 'pointer' }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Order meta */}
                        <div
                            className="grid grid-cols-2 gap-3"
                        >
                            {[
                                { label: 'Fecha', value: `${selectedOrder.date} ${selectedOrder.time}`, icon: Calendar },
                                { label: 'Mesero', value: selectedOrder.waiter, icon: User },
                                { label: 'Cubiertos', value: `${selectedOrder.covers} personas`, icon: Hash },
                                { label: 'Método de Pago', value: payLabel[selectedOrder.paymentMethod], icon: payIcons[selectedOrder.paymentMethod] },
                            ].map(({ label, value, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className="w-3 h-3" style={{ color: '#4A4A5A' }} />
                                        <span style={{ color: '#4A4A5A', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                                            {label}
                                        </span>
                                    </div>
                                    <div style={{ color: '#E8E0D0', fontSize: '0.82rem', fontWeight: 500 }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Status badge */}
                        {(() => {
                            const sc = statusConfig[selectedOrder.status];
                            const SI = sc.Icon;
                            return (
                                <div
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl"
                                    style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}
                                >
                                    <SI className="w-4 h-4" style={{ color: sc.color }} />
                                    <span style={{ color: sc.color, fontSize: '0.85rem', fontWeight: 600 }}>
                                        Estado: {sc.label}
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Items list */}
                        <div>
                            <div style={{ color: '#5A5A6A', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                                Ítems del Pedido
                            </div>
                            <div className="space-y-1.5">
                                {selectedOrder.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between px-3 py-2 rounded-xl"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                                    >
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <span
                                                className="px-1.5 py-0.5 rounded-md flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', fontSize: '0.65rem', fontWeight: 700 }}
                                            >
                                                ×{item.qty}
                                            </span>
                                            <span style={{ color: '#E8E0D0', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span style={{ color: '#8B8B99', fontSize: '0.82rem', flexShrink: 0, marginLeft: '8px' }}>
                                            ${(item.price * item.qty).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals breakdown */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0' }}>
                                {[
                                    { label: 'Subtotal', value: selectedOrder.subtotal, icon: Receipt, muted: false },
                                    { label: 'IVA (10.5%)', value: selectedOrder.tax, icon: Percent, muted: true },
                                    ...(selectedOrder.discount > 0
                                        ? [{ label: 'Descuento aplicado', value: -selectedOrder.discount, icon: Minus, muted: true }]
                                        : []),
                                ].map(({ label, value, icon: Icon, muted }, idx, arr) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between px-4 py-2.5"
                                        style={{
                                            borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-3.5 h-3.5" style={{ color: '#3A3A4A' }} />
                                            <span style={{ color: muted ? '#5A5A6A' : '#8B8B99', fontSize: '0.8rem' }}>{label}</span>
                                        </div>
                                        <span style={{ color: value < 0 ? '#2DD4BF' : (muted ? '#6B6B7B' : '#C0B8A8'), fontSize: '0.85rem' }}>
                                            {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {/* Total */}
                            <div
                                className="flex items-center justify-between px-4 py-3.5"
                                style={{ backgroundColor: 'rgba(212,175,55,0.05)', borderTop: '1px solid rgba(212,175,55,0.12)' }}
                            >
                                <span style={{ color: '#F0EAD6', fontSize: '0.88rem', fontWeight: 600 }}>Total Final</span>
                                <span style={{ fontFamily: SERIF, color: '#D4AF37', fontSize: '1.3rem', fontWeight: 700 }}>
                                    ${selectedOrder.total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        {selectedOrder.status !== 'anulado' && (
                            <div className="flex gap-2 pb-2">
                                <button
                                    className="flex-1 py-2.5 rounded-xl transition-all duration-200 hover:opacity-85"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#8B8B99',
                                        fontSize: '0.78rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Reimprimir Ticket
                                </button>
                                {selectedOrder.status === 'en_proceso' && (
                                    <button
                                        className="flex-1 py-2.5 rounded-xl transition-all duration-200 hover:opacity-85"
                                        style={{
                                            background: 'linear-gradient(135deg, #2DD4BF 0%, #0F766E 100%)',
                                            color: '#0F1A19',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(45,212,191,0.25)',
                                        }}
                                    >
                                        Registrar Pago
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}