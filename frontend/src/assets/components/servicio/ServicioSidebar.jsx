import { LayoutDashboard, UtensilsCrossed, ChefHat, Package, TrendingUp, BarChart2, Settings, LogOut, Wifi } from 'lucide-react';
import { C } from './tokens';


const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: UtensilsCrossed, label: 'Servicio', id: 'servicio' },
    { icon: ChefHat, label: 'Cocina', id: 'cocina' },
    { icon: Package, label: 'Inventario', id: 'inventario' },
    { icon: TrendingUp, label: 'Finanzas', id: 'finanzas' },
    { icon: BarChart2, label: 'Reportes', id: 'reportes' },
];

export function ERPSidebar({ activeModule, onModuleChange }) {
    return (
        <div style={{
            width: 76,
            minWidth: 76,
            background: C.bgCard,
            borderRight: `1px solid ${C.br}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '18px 0 14px',
            gap: 0,
            zIndex: 10,
        }}>
            {/* Logo Mark */}
            <div style={{ marginBottom: 28, padding: '0 14px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    width: 42, height: 42,
                    background: `linear-gradient(145deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${C.goldGlow}, 0 4px 12px rgba(0,0,0,0.4)`,
                    cursor: 'pointer',
                }}>
                    <span style={{ color: '#0E0E1A', fontFamily: C.serif, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>B</span>
                </div>
            </div>

            {/* Nav Items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', padding: '0 8px' }}>
                {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
                    const isActive = activeModule === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onModuleChange(id)}
                            title={label}
                            style={{
                                width: '100%',
                                padding: '10px 0 8px',
                                borderRadius: 12,
                                background: isActive ? C.goldDim : 'transparent',
                                border: isActive ? `1px solid ${C.goldBorder}` : '1px solid transparent',
                                color: isActive ? C.goldLight : C.t3,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                                outline: 'none',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget).style.color = C.t2;
                                    (e.currentTarget).style.background = 'rgba(255,255,255,0.03)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget).style.color = C.t3;
                                    (e.currentTarget).style.background = 'transparent';
                                }
                            }}
                        >
                            {isActive && (
                                <div style={{
                                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: 3, height: 24, background: C.gold,
                                    borderRadius: '0 3px 3px 0',
                                    boxShadow: `2px 0 8px ${C.goldGlow}`,
                                }} />
                            )}
                            <Icon size={18} strokeWidth={isActive ? 2 : 1.8} />
                            <span style={{
                                fontSize: 9,
                                letterSpacing: 0.5,
                                fontFamily: C.sans,
                                fontWeight: isActive ? 600 : 400,
                                textTransform: 'uppercase',
                            }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Controls */}
            <div style={{ padding: '0 8px', width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <button
                    title="Configuración"
                    style={{
                        width: '100%', padding: '10px 0 8px', borderRadius: 12,
                        background: 'transparent', border: '1px solid transparent',
                        color: C.t3, display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 5, cursor: 'pointer', outline: 'none',
                    }}
                >
                    <Settings size={17} strokeWidth={1.7} />
                    <span style={{ fontSize: 9, letterSpacing: 0.5, fontFamily: C.sans, textTransform: 'uppercase' }}>Config</span>
                </button>

                {/* Status dot */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', gap: 4, alignItems: 'center' }}>
                    <Wifi size={11} color={C.teal} strokeWidth={2} />
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal, boxShadow: `0 0 6px ${C.tealGlow}` }} />
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: C.br, margin: '4px 4px' }} />

                {/* Profile Card */}
                <div style={{
                    padding: '10px 6px',
                    borderRadius: 12,
                    background: C.bgCard2,
                    border: `1px solid ${C.br}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `linear-gradient(145deg, #3A2818 0%, #5A3E28 100%)`,
                        border: `2px solid ${C.goldBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 12px ${C.goldDim}`,
                    }}>
                        <span style={{ color: C.goldLight, fontSize: 12, fontWeight: 600, fontFamily: C.sans }}>JR</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: C.t2, fontSize: 9, fontFamily: C.sans, fontWeight: 500 }}>Juan R.</div>
                        <div style={{ color: C.t3, fontSize: 8, fontFamily: C.sans }}>Gerente</div>
                    </div>
                    <button
                        title="Cerrar sesión"
                        style={{
                            color: C.t3, cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${C.br}`, borderRadius: 6, padding: '4px 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}
                    >
                        <LogOut size={11} />
                    </button>
                </div>
            </div>
        </div>
    );
}
