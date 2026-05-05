import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import servicioApi from '../../../services/servicioApi';
import {
    TrendingUp, DollarSign, ShoppingBag, Users, Clock,
    ChefHat, Package, ClipboardList, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';

const CARD = {
    backgroundColor: '#1C1C21',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    boxShadow: '0 0 0 1px rgba(212,175,55,0.04), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
};

// Los datos iniciales vacíos se llenarán por la API

const tableColor = {
    libre: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.06)', text: '#4A4A5A' },
    ocupado: { bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.2)', text: '#D4AF37' },
    reservado: { bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.18)', text: '#2DD4BF' },
};

const statusStyle = {
    Pendiente: { backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' },
    'En Preparacion': { backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' },
    Servido: { backgroundColor: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' },
    Pagado: { backgroundColor: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' },
    Anulado: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' },
};
const statusLabel = { 
    Pendiente: 'Pendiente', 
    'En Preparacion': 'En Preparación', 
    Servido: 'Servido', 
    Pagado: 'Pagado', 
    Anulado: 'Anulado' 
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#1C1C21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
                <div style={{ color: '#8B8B99', fontSize: '0.72rem', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: '#D4AF37', fontSize: '0.9rem', fontWeight: 600 }}>${payload[0].value.toLocaleString()}</div>
            </div>
        );
    }
    return null;
};

export function Dashboard() {
    const navigate = useNavigate();
    
    // Estados para la API
    const [resumen, setResumen] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resResumen, resHoy, resSemana, resMesas, resPedidos] = await Promise.all([
                    servicioApi.getDashboardResumen(),
                    servicioApi.getIngresosHoy(),
                    servicioApi.getIngresosSemana(),
                    servicioApi.getMesas(),
                    servicioApi.getHistorialPedidos({ limit: 6 })
                ]);

                setResumen(resResumen);
                
                // Transformar ingresos hoy
                setRevenueData(resHoy.map(item => ({
                    time: `${item.hora}h`,
                    v: parseFloat(item.total)
                })));

                // Transformar ingresos semana
                const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                setWeekData(resSemana.map(item => {
                    const date = new Date(item.dia + 'T12:00:00'); // Evitar timezone issues
                    return {
                        day: diasSemana[date.getDay()],
                        v: parseFloat(item.total)
                    };
                }));

                // Transformar mesas
                setTables(resMesas.map(m => ({
                    n: m.numero,
                    status: m.estado_actual.toLowerCase()
                })));

                // Transformar pedidos
                setRecentOrders(resPedidos.map(p => {
                    const diffMin = Math.round((new Date() - new Date(p.fecha_creacion)) / 60000);
                    return {
                        id: `#${p.id.toString().padStart(4, '0')}`,
                        table: p.id_mesa ? `Mesa ${p.id_mesa}` : 'Llevar',
                        items: p.detalles.length,
                        total: `$${parseFloat(p.total).toLocaleString()}`,
                        status: p.estado_pedido,
                        waiter: p.nombre_mesero || 'Sin asignar',
                        time: `hace ${diffMin} min`
                    };
                }));

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling cada 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-6 text-white">Cargando dashboard...</div>;

    return (
        <div className="p-6 space-y-5" style={{ fontFamily: SANS }}>
            {/* Page title */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.7rem', fontWeight: 600, lineHeight: 1.2 }}>
                        Visión General
                    </h1>
                    <p style={{ color: '#5A5A6A', fontSize: '0.82rem', marginTop: '4px' }}>
                        Martes, 6 de Mayo de 2025 · Turno Noche en curso
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2DD4BF', boxShadow: '0 0 6px rgba(45,212,191,0.8)' }} />
                    <span style={{ color: '#2DD4BF', fontSize: '0.78rem', fontWeight: 500 }}>14 mesas activas · 8 pedidos en cocina</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Ingresos del Día', value: `$${parseFloat(resumen?.ingresos_dia || 0).toLocaleString()}`, sub: '+18.2% vs ayer', icon: DollarSign, color: '#D4AF37', positive: true },
                    { label: 'Pedidos Totales', value: resumen?.pedidos_total || 0, sub: `${resumen?.pedidos_activos || 0} activos ahora`, icon: ShoppingBag, color: '#2DD4BF', positive: true },
                    { label: 'Mesas Ocupadas', value: `${resumen?.mesas_ocupadas || 0} / ${resumen?.mesas_total || 0}`, sub: `${Math.round(((resumen?.mesas_ocupadas || 0)/(resumen?.mesas_total || 1))*100)}% de ocupación`, icon: Users, color: '#A78BFA', positive: true },
                    { label: 'Tiempo Promedio', value: `${resumen?.tiempo_promedio_min || 0} min`, sub: 'Activos actuales', icon: Clock, color: '#F97316', positive: true },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="p-5" style={CARD}>
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${s.color}18` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                                <div
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.12)' }}
                                >
                                    <TrendingUp className="w-2.5 h-2.5" style={{ color: '#2DD4BF' }} />
                                    <span style={{ color: '#2DD4BF', fontSize: '0.65rem', fontWeight: 500 }}>{s.sub}</span>
                                </div>
                            </div>
                            <div style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.1 }}>
                                {s.value}
                            </div>
                            <div style={{ color: '#5A5A6A', fontSize: '0.75rem', marginTop: '4px' }}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Second row: Revenue chart + Table map */}
            <div className="grid grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="col-span-2 p-5" style={CARD}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1rem', fontWeight: 500 }}>
                            Ingresos en Tiempo Real — Hoy
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" style={{ color: '#2DD4BF' }} />
                            <span style={{ color: '#2DD4BF', fontSize: '0.78rem', fontWeight: 500 }}>+18.2% vs ayer</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="time" stroke="transparent" tick={{ fontSize: 11, fill: '#4A4A5A', fontFamily: SANS }} />
                            <YAxis stroke="transparent" tick={{ fontSize: 11, fill: '#4A4A5A', fontFamily: SANS }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="v" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Table Map */}
                <div className="p-5" style={CARD}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1rem', fontWeight: 500 }}>
                            Mapa de Mesas
                        </h2>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                        {tables.map((t) => {
                            const col = tableColor[t.status];
                            return (
                                <div
                                    key={t.n}
                                    className="rounded-lg flex items-center justify-center py-2 cursor-pointer transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: col.bg, border: `1px solid ${col.border}` }}
                                >
                                    <span style={{ color: col.text, fontSize: '0.72rem', fontWeight: 600 }}>{t.n}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { label: 'Libre', color: '#4A4A5A', count: tables.filter(t=>t.status==='libre').length },
                            { label: 'Ocupado', color: '#D4AF37', count: tables.filter(t=>t.status==='ocupado').length },
                            { label: 'Reservado', color: '#2DD4BF', count: tables.filter(t=>t.status==='reservado').length },
                        ].map((l) => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                                <span style={{ color: '#5A5A6A', fontSize: '0.68rem' }}>{l.label} ({l.count})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Third row: Recent orders + Weekly chart */}
            <div className="grid grid-cols-3 gap-4">
                {/* Recent orders */}
                <div className="col-span-2 p-5" style={CARD}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1rem', fontWeight: 500 }}>
                            Pedidos Recientes
                        </h2>
                        <button
                            onClick={() => navigate('/pedidos')}
                            className="flex items-center gap-1 transition-all duration-200 hover:opacity-80"
                            style={{ color: '#D4AF37', fontSize: '0.78rem', fontWeight: 500 }}
                        >
                            Ver todos
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {recentOrders.map((o) => (
                            <div
                                key={o.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/3"
                                style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                            >
                                <div style={{ color: '#D4AF37', fontSize: '0.82rem', fontWeight: 600, width: '54px', flexShrink: 0 }}>
                                    {o.id}
                                </div>
                                <div style={{ color: '#F0EAD6', fontSize: '0.82rem', width: '64px', flexShrink: 0 }}>
                                    {o.table}
                                </div>
                                <div style={{ color: '#5A5A6A', fontSize: '0.75rem', flex: 1 }}>
                                    {o.items} ítems · {o.waiter}
                                </div>
                                <div style={{ color: '#8B8B99', fontSize: '0.72rem', flexShrink: 0 }}>
                                    {o.time}
                                </div>
                                <div
                                    className="px-2.5 py-1 rounded-full text-center"
                                    style={{ ...statusStyle[o.status], fontSize: '0.65rem', fontWeight: 600, flexShrink: 0, letterSpacing: '0.04em' }}
                                >
                                    {statusLabel[o.status]}
                                </div>
                                <div style={{ color: '#F0EAD6', fontSize: '0.85rem', fontWeight: 600, width: '58px', textAlign: 'right', flexShrink: 0 }}>
                                    {o.total}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Revenue */}
                <div className="p-5" style={CARD}>
                    <h2 style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1rem', fontWeight: 500, marginBottom: '16px' }}>
                        Ingresos Semanales
                    </h2>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="day" stroke="transparent" tick={{ fontSize: 10, fill: '#4A4A5A', fontFamily: SANS }} />
                            <YAxis stroke="transparent" tick={{ fontSize: 10, fill: '#4A4A5A', fontFamily: SANS }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="v" fill="#D4AF37" radius={[4, 4, 0, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#5A5A6A', fontSize: '0.72rem' }}>Total semana</span>
                        <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600 }}>
                            ${weekData.reduce((acc, curr) => acc + curr.v, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick access modules */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        icon: ChefHat, color: '#F97316', label: 'Monitor de Cocina',
                        sub: '8 pedidos activos · 1 urgente', path: '/cocina',
                        alert: true, alertMsg: 'Mesa 9 lleva 22+ min',
                    },
                    {
                        icon: Package, color: '#A78BFA', label: 'Inventario',
                        sub: '4 insumos en nivel crítico', path: '/inventario',
                        alert: true, alertMsg: '4 críticos',
                    },
                    {
                        icon: ClipboardList, color: '#2DD4BF', label: 'Historial de Pedidos',
                        sub: '87 pedidos hoy · $24,580 total', path: '/pedidos',
                        alert: false, alertMsg: '',
                    },
                ].map((m) => {
                    const Icon = m.icon;
                    return (
                        <button
                            key={m.label}
                            onClick={() => navigate(m.path)}
                            className="p-4 flex items-center gap-4 transition-all duration-200 hover:opacity-80 text-left"
                            style={{ ...CARD, cursor: 'pointer' }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${m.color}18` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: m.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div style={{ color: '#E8E0D0', fontSize: '0.88rem', fontWeight: 500 }}>{m.label}</div>
                                <div style={{ color: '#5A5A6A', fontSize: '0.72rem', marginTop: '2px' }}>{m.sub}</div>
                            </div>
                            {m.alert && (
                                <div
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
                                >
                                    <AlertTriangle className="w-3 h-3" style={{ color: '#D4AF37' }} />
                                    <span style={{ color: '#D4AF37', fontSize: '0.65rem', fontWeight: 500 }}>{m.alertMsg}</span>
                                </div>
                            )}
                            <ArrowUpRight className="w-4 h-4 flex-shrink-0" style={{ color: '#3A3A4A' }} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
