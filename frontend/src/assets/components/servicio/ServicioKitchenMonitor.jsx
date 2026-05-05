import { useState, useEffect } from 'react';
import { Flame, Snowflake, IceCream, LayoutGrid, Clock, User, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import servicioApi from '../../../services/servicioApi';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';


// Los datos iniciales se cargarán desde la API


const STATION_TABS = [
    { key: 'todos', label: 'Todos', Icon: LayoutGrid },
    { key: 'fuegos', label: 'Fuegos', Icon: Flame },
    { key: 'frios', label: 'Fríos', Icon: Snowflake },
    { key: 'postres', label: 'Postres', Icon: IceCream },
];

const stationColor = {
    fuegos: '#F97316',
    frios: '#38BDF8',
    postres: '#E879F9',
};
const stationBg = {
    fuegos: 'rgba(249,115,22,0.1)',
    frios: 'rgba(56,189,248,0.1)',
    postres: 'rgba(232,121,249,0.1)',
};
const stationLabel = {
    fuegos: 'Fuegos',
    frios: 'Fríos',
    postres: 'Postres',
};

function formatElapsed(startTime) {
    const secs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getTimerColor(startTime) {
    const mins = (Date.now() - startTime) / 60000;
    if (mins < 8) return '#2DD4BF';
    if (mins < 15) return '#D4AF37';
    return '#EF4444';
}

function isUrgent(startTime) {
    return (Date.now() - startTime) / 60000 >= 15;
}

export function KitchenMonitor() {
    const [activeStation, setActiveStation] = useState('todos');
    const [orders, setOrders] = useState([]);
    const [, setTick] = useState(0);

    const fetchKds = async () => {
        try {
            const data = await servicioApi.getPedidosKds();
            const mappedOrders = [];
            
            data.forEach(pedido => {
                const itemsByStation = {};
                pedido.detalles.forEach(d => {
                    const st = (d.estacion_cocina || 'fuegos').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (!itemsByStation[st]) itemsByStation[st] = [];
                    itemsByStation[st].push({
                        id: d.id,
                        name: d.nombre_producto,
                        qty: parseFloat(d.cantidad),
                        notes: d.notas ? [d.notas] : [],
                        done: d.estado_preparacion === 'Listo' || d.estado_preparacion === 'Servido'
                    });
                });

                Object.entries(itemsByStation).forEach(([station, items]) => {
                    mappedOrders.push({
                        id: `K-${pedido.id}-${station}`,
                        dbOrderId: pedido.id,
                        tableNumber: pedido.id_mesa || 'Llevar',
                        station: station,
                        startTime: new Date(pedido.fecha_creacion).getTime(),
                        waiter: pedido.nombre_mesero || 'Sin asignar',
                        cover: pedido.cubiertos || 0,
                        items: items,
                        status: items.every(i => i.done) ? 'ready' : 'cooking'
                    });
                });
            });
            setOrders(mappedOrders);
        } catch (error) {
            console.error("Error fetching KDS:", error);
        }
    };

    useEffect(() => {
        fetchKds();
        const intervalApi = setInterval(fetchKds, 15000); // Polling cada 15s
        const tickInterval = setInterval(() => setTick((t) => t + 1), 1000);
        return () => {
            clearInterval(intervalApi);
            clearInterval(tickInterval);
        };
    }, []);

    const filtered = activeStation === 'todos'
        ? orders
        : orders.filter((o) => o.station === activeStation);

    const activeCount = orders.filter((o) => o.status === 'cooking').length;
    const urgentCount = orders.filter((o) => o.status === 'cooking' && isUrgent(o.startTime)).length;

    async function markReady(id) {
        // Optimistic update
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: 'ready' } : o))
        );
        // Find the dbOrderId to update backend
        const order = orders.find(o => o.id === id);
        if (order) {
            try {
                await servicioApi.actualizarPedido(order.dbOrderId, { estado_pedido: 'Servido' });
            } catch (error) {
                console.error('Error marcando pedido como listo:', error);
                fetchKds(); // revert
            }
        }
    }

    async function dismissOrder(id) {
        const order = orders.find(o => o.id === id);
        // Optimistic remove
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (order) {
            try {
                await servicioApi.actualizarPedido(order.dbOrderId, { estado_pedido: 'Servido' });
            } catch (error) {
                console.error('Error descartando pedido:', error);
                fetchKds();
            }
        }
    }

    async function toggleItem(orderId, itemId) {
        // Encontrar el item actual
        let currentItem = null;
        orders.forEach(o => {
            if (o.id === orderId) {
                const it = o.items.find(i => i.id === itemId);
                if (it) currentItem = it;
            }
        });

        if (!currentItem) return;

        const nuevoEstado = currentItem.done ? 'Pendiente' : 'Listo';

        // Optimistic update
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId
                    ? { ...o, items: o.items.map((it) => it.id === itemId ? { ...it, done: !it.done } : it) }
                    : o
            )
        );

        try {
            await servicioApi.actualizarEstadoDetalle(itemId, nuevoEstado);
        } catch (error) {
            console.error("Error actualizando detalle:", error);
            // Revert on error
            fetchKds();
        }
    }

    return (
        <div className="flex flex-col" style={{ fontFamily: SANS, minHeight: '100%' }}>
            {/* Top bar */}
            <div
                className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div className="flex items-center gap-6">
                    <div>
                        <h1 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.45rem', fontWeight: 600, lineHeight: 1.2 }}>
                            Monitor de Cocina
                        </h1>
                        <p style={{ color: '#5A5A6A', fontSize: '0.78rem', marginTop: '2px' }}>
                            {activeCount} pedidos activos · Actualización en tiempo real
                        </p>
                    </div>
                    {urgentCount > 0 && (
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                            style={{
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                boxShadow: '0 0 16px rgba(239,68,68,0.12)',
                            }}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                            <span style={{ color: '#EF4444', fontSize: '0.78rem', fontWeight: 600 }}>
                                {urgentCount} pedido{urgentCount > 1 ? 's' : ''} URGENTE{urgentCount > 1 ? 'S' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Station filter tabs */}
                <div
                    className="flex items-center gap-1 p-1 rounded-xl"
                    style={{ backgroundColor: '#1C1C21', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {STATION_TABS.map(({ key, label, Icon }) => {
                        const isActive = activeStation === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveStation(key)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                                style={{
                                    backgroundColor: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
                                    color: isActive ? '#D4AF37' : '#5A5A6A',
                                    border: isActive ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
                                    fontSize: '0.82rem',
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                                {key !== 'todos' && (
                                    <span
                                        className="px-1.5 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: isActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: isActive ? '#D4AF37' : '#4A4A5A',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {orders.filter((o) => o.station === key).length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders Grid */}
            <div className="p-6">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <CheckCircle2 className="w-7 h-7" style={{ color: '#2DD4BF' }} />
                        </div>
                        <p style={{ color: '#5A5A6A', fontSize: '0.9rem' }}>No hay pedidos en esta estación</p>
                    </div>
                ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {filtered.map((order) => {
                            const timerColor = getTimerColor(order.startTime);
                            const urgent = isUrgent(order.startTime);
                            const sColor = stationColor[order.station];
                            const sBg = stationBg[order.station];
                            const isReady = order.status === 'ready';

                            return (
                                <div
                                    key={order.id}
                                    className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: '#1C1C21',
                                        border: isReady
                                            ? '1px solid rgba(45,212,191,0.3)'
                                            : urgent
                                                ? '1px solid rgba(239,68,68,0.3)'
                                                : '1px solid rgba(255,255,255,0.06)',
                                        boxShadow: isReady
                                            ? '0 0 24px rgba(45,212,191,0.15), 0 8px 32px rgba(0,0,0,0.4)'
                                            : urgent
                                                ? '0 0 24px rgba(239,68,68,0.15), 0 8px 32px rgba(0,0,0,0.4)'
                                                : '0 0 0 1px rgba(212,175,55,0.03), 0 8px 32px rgba(0,0,0,0.4)',
                                    }}
                                >
                                    {/* Card Header */}
                                    <div
                                        className="px-4 pt-4 pb-3"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            {/* Table number */}
                                            <div>
                                                <div style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>
                                                    {order.tableNumber}
                                                </div>
                                                <div style={{ color: '#5A5A6A', fontSize: '0.68rem', marginTop: '2px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                    Mesa · {order.cover} cubiertos
                                                </div>
                                            </div>
                                            {/* Timer + dismiss */}
                                            <div className="flex flex-col items-end gap-1.5">
                                                <button
                                                    onClick={() => dismissOrder(order.id)}
                                                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                                                    style={{ color: '#3A3A4A' }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                                                    style={{
                                                        backgroundColor: `${timerColor}12`,
                                                        border: `1px solid ${timerColor}30`,
                                                    }}
                                                >
                                                    <Clock className="w-3 h-3" style={{ color: timerColor }} />
                                                    <span style={{ color: timerColor, fontSize: '0.88rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                                        {formatElapsed(order.startTime)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Station badge + waiter */}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: sBg, border: `1px solid ${sColor}30` }}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sColor }} />
                                                <span style={{ color: sColor, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                                                    {stationLabel[order.station].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" style={{ color: '#4A4A5A' }} />
                                                <span style={{ color: '#5A5A6A', fontSize: '0.72rem' }}>{order.waiter}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items list */}
                                    <div className="flex-1 px-4 py-3 space-y-2.5">
                                        {order.items.map((item) => (
                                            <div key={item.id}>
                                                <div
                                                    className="flex items-start gap-2 cursor-pointer group"
                                                    onClick={() => !isReady && toggleItem(order.id, item.id)}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                                                        style={{
                                                            backgroundColor: item.done ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.05)',
                                                            border: item.done ? '1px solid rgba(45,212,191,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                                        }}
                                                    >
                                                        {item.done && <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#2DD4BF' }} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-sm font-medium"
                                                                style={{
                                                                    color: item.done ? '#3A3A4A' : '#E8E0D0',
                                                                    textDecoration: item.done ? 'line-through' : 'none',
                                                                    fontSize: '0.83rem',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {item.qty > 1 && (
                                                                <span
                                                                    className="px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                                                                    style={{
                                                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                                                        color: '#D4AF37',
                                                                        fontSize: '0.65rem',
                                                                    }}
                                                                >
                                                                    ×{item.qty}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Notes */}
                                                {item.notes.length > 0 && !item.done && (
                                                    <div className="ml-6 mt-1 space-y-0.5">
                                                        {item.notes.map((note, ni) => (
                                                            <div
                                                                key={ni}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <span style={{ color: '#8B8B99', fontSize: '0.55rem' }}>▸</span>
                                                                <span
                                                                    className="px-1.5 py-0.5 rounded"
                                                                    style={{
                                                                        backgroundColor: 'rgba(212,175,55,0.06)',
                                                                        color: '#A88B2A',
                                                                        fontSize: '0.7rem',
                                                                        fontStyle: 'italic',
                                                                    }}
                                                                >
                                                                    {note}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Card Footer — Mark as Ready button */}
                                    <div className="px-3 pb-3">
                                        {isReady ? (
                                            <div
                                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                                                style={{
                                                    backgroundColor: 'rgba(45,212,191,0.1)',
                                                    border: '1px solid rgba(45,212,191,0.3)',
                                                }}
                                            >
                                                <CheckCircle2 className="w-4 h-4" style={{ color: '#2DD4BF' }} />
                                                <span style={{ color: '#2DD4BF', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                    ENVIADO A SALA
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => markReady(order.id)}
                                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-85 active:scale-95"
                                                style={{
                                                    background: 'linear-gradient(135deg, #2DD4BF 0%, #0F766E 100%)',
                                                    color: '#0F1A19',
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.12em',
                                                    boxShadow: '0 4px 16px rgba(45,212,191,0.25)',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                MARCAR COMO LISTO
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}