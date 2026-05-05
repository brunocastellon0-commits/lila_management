import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
    LayoutDashboard, ChefHat, Package, ClipboardList,
    BarChart3, Settings, Utensils, Bell, Zap, ChevronRight,
    Star, LogOut, Wifi
} from 'lucide-react';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Inter", system-ui, sans-serif';

const NAV_ITEMS = [
    { path: '/servicio', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/servicio/salon', label: 'Salón & Mesas', icon: Utensils },
    { path: '/servicio/cocina', label: 'Cocina KDS', icon: ChefHat },
    { path: '/servicio/inventario', label: 'Inventario', icon: Package },
    { path: '/servicio/pedidos', label: 'Pedidos', icon: ClipboardList },
    { path: '/servicio/reportes', label: 'Reportes', icon: BarChart3, disabled: true },
    { path: '/servicio/configuracion', label: 'Configuración', icon: Settings, disabled: true },
];

const BREADCRUMBS = {
    '/servicio': ['Inicio', 'Visión General'],
    '/servicio/salon': ['Inicio', 'Salón', 'Gestión de Mesas'],
    '/servicio/cocina': ['Inicio', 'Cocina', 'Monitor KDS'],
    '/servicio/inventario': ['Inicio', 'Inventario', 'Gestión de Insumos'],
    '/servicio/pedidos': ['Inicio', 'Pedidos', 'Historial & Filtros'],
};

export function Layout() {
    const location = useLocation();
    const crumbs = BREADCRUMBS[location.pathname] || ['Inicio'];
    const [quickActionOpen, setQuickActionOpen] = useState(false);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ backgroundColor: '#0F0F12', fontFamily: SANS }}
        >
            {/* ─── Sidebar ─── */}
            <aside
                className="w-[230px] flex-shrink-0 flex flex-col"
                style={{
                    backgroundColor: '#101014',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                {/* Logo */}
                <div
                    className="px-5 py-5 flex-shrink-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #9A7D28 100%)',
                                boxShadow: '0 0 16px rgba(212,175,55,0.35)',
                            }}
                        >
                            <Star className="w-4 h-4" style={{ color: '#0F0F12' }} fill="currentColor" />
                        </div>
                        <div>
                            <div style={{ fontFamily: SERIF, color: '#F0EAD6', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.1 }}>
                                Lila
                            </div>
                            <div style={{ color: '#4A4A5A', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}>
                                Management
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service status pill */}
                <div className="px-4 pt-4 pb-2">
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.12)' }}
                    >
                        <div className="relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2DD4BF' }} />
                            <div
                                className="absolute w-2 h-2 rounded-full animate-ping"
                                style={{ backgroundColor: '#2DD4BF', opacity: 0.4 }}
                            />
                        </div>
                        <span style={{ color: '#2DD4BF', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                            Servicio Activo
                        </span>
                        <span style={{ color: '#4A4A5A', fontSize: '0.65rem', marginLeft: 'auto' }}>20:41</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                    <div style={{ color: '#3A3A4A', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
                        Principal
                    </div>
                    {NAV_ITEMS.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                        if (item.disabled) {
                            return (
                                <div
                                    key={item.path}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-40"
                                    style={{ color: '#8B8B99' }}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                                    <span
                                        className="ml-auto px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: 'rgba(139,139,153,0.1)', color: '#6B6B7B', fontSize: '0.55rem', letterSpacing: '0.1em' }}
                                    >
                                        PRONTO
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                style={{
                                    backgroundColor: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                                    color: isActive ? '#D4AF37' : '#8B8B99',
                                    border: isActive ? '1px solid rgba(212,175,55,0.15)' : '1px solid transparent',
                                }}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
                                {isActive && (
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}

                    <div style={{ color: '#3A3A4A', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 8px 4px' }}>
                        Sistema
                    </div>
                    {NAV_ITEMS.slice(5).map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.path}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-35"
                                style={{ color: '#8B8B99' }}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                            </div>
                        );
                    })}
                </nav>

                {/* User profile */}
                <div
                    className="px-3 py-3 flex-shrink-0"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group"
                        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #2DD4BF, #0F766E)',
                                color: '#0F1A19',
                            }}
                        >
                            JM
                        </div>
                        <div className="flex-1 min-w-0">
                            <div style={{ color: '#E8E0D0', fontSize: '0.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Juan Méndez
                            </div>
                            <div style={{ color: '#4A4A5A', fontSize: '0.65rem' }}>Administrador</div>
                        </div>
                        <LogOut className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: '#8B8B99' }} />
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header
                    className="flex-shrink-0 flex items-center justify-between px-6 py-3.5"
                    style={{
                        backgroundColor: '#0F0F12',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5">
                        {crumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-1.5">
                                {index > 0 && (
                                    <ChevronRight className="w-3.5 h-3.5" style={{ color: '#2E2E3A' }} />
                                )}
                                <span
                                    style={{
                                        color: index === crumbs.length - 1 ? '#F0EAD6' : '#5A5A6A',
                                        fontSize: index === crumbs.length - 1 ? '0.92rem' : '0.82rem',
                                        fontFamily: index === crumbs.length - 1 ? SERIF : SANS,
                                        fontWeight: index === crumbs.length - 1 ? 500 : 400,
                                    }}
                                >
                                    {crumb}
                                </span>
                            </span>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <Wifi className="w-3 h-3" style={{ color: '#2DD4BF' }} />
                            <span style={{ color: '#5A5A6A', fontSize: '0.7rem' }}>En línea</span>
                        </div>

                        {/* Notifications */}
                        <button
                            className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/5"
                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <Bell className="w-4 h-4" style={{ color: '#6B6B7B' }} />
                            <span
                                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: '#D4AF37', boxShadow: '0 0 4px rgba(212,175,55,0.8)' }}
                            />
                        </button>

                        {/* Quick Action */}
                        <div className="relative">
                            <button
                                onClick={() => setQuickActionOpen(!quickActionOpen)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #9A7D28 100%)',
                                    color: '#0F0F12',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    boxShadow: '0 0 20px rgba(212,175,55,0.25)',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Acción Rápida
                            </button>
                            {quickActionOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                                    style={{
                                        backgroundColor: '#1C1C21',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {[
                                        { label: 'Nueva Mesa', icon: Utensils },
                                        { label: 'Pedido Manual', icon: ClipboardList },
                                        { label: 'Ajuste de Stock', icon: Package },
                                    ].map(({ label, icon: Icon }) => (
                                        <button
                                            key={label}
                                            onClick={() => setQuickActionOpen(false)}
                                            className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 hover:bg-white/5 text-left"
                                        >
                                            <Icon className="w-4 h-4" style={{ color: '#D4AF37' }} />
                                            <span style={{ color: '#E8E0D0', fontSize: '0.85rem' }}>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto" style={{ backgroundColor: '#0F0F12' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
