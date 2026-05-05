import { Search, Bell, Zap, ChevronRight, CalendarDays } from 'lucide-react';
import { C } from './tokens';

export function ERPHeader() {
    return (
        <div style={{
            height: 62,
            background: C.bgCard,
            borderBottom: `1px solid ${C.br}`,
            display: 'flex', alignItems: 'center',
            padding: '0 24px',
            gap: 14,
            flexShrink: 0,
        }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                <span style={{ color: C.t3, fontSize: 12, fontFamily: C.sans }}>Sistema ERP</span>
                <ChevronRight size={11} color={C.t3} />
                <span style={{ color: C.t2, fontSize: 12, fontFamily: C.sans }}>Módulos</span>
                <ChevronRight size={11} color={C.t3} />
                <span style={{ color: C.goldLight, fontSize: 12, fontFamily: C.sans, fontWeight: 500 }}>Servicio</span>
                <div style={{
                    marginLeft: 6, padding: '2px 10px', borderRadius: 20,
                    background: C.goldDim, border: `1px solid ${C.goldBorder}`,
                    color: C.gold, fontSize: 10, fontFamily: C.sans, fontWeight: 600,
                    letterSpacing: 0.6,
                }}>
                    ACTIVO
                </div>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.t3, fontSize: 11, fontFamily: C.sans }}>
                <CalendarDays size={13} />
                <span>Martes, 5 Mayo 2026</span>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: 300, display: 'flex', alignItems: 'center' }}>
                <Search size={13} color={C.t3} style={{ position: 'absolute', left: 12, pointerEvents: 'none', zIndex: 1 }} />
                <input
                    placeholder="Buscar mesa, comanda, producto…"
                    style={{
                        width: '100%', height: 38,
                        background: C.bgCard2,
                        border: `1px solid ${C.br2}`,
                        borderRadius: 11,
                        color: C.t1,
                        paddingLeft: 36, paddingRight: 14,
                        fontSize: 12,
                        fontFamily: C.sans,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = C.goldBorder)}
                    onBlur={e => (e.target.style.borderColor = C.br2)}
                />
            </div>

            {/* Notification Bell */}
            <button style={{
                width: 38, height: 38, borderRadius: 11,
                background: C.bgCard2,
                border: `1px solid ${C.br2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', color: C.t2,
                outline: 'none',
                transition: 'all 0.15s',
            }}>
                <Bell size={15} />
                <span style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 7, height: 7, borderRadius: '50%',
                    background: C.gold,
                    border: `1.5px solid ${C.bgCard}`,
                    boxShadow: `0 0 6px ${C.goldGlow}`,
                }} />
            </button>

            {/* Primary Action Button */}
            <button style={{
                height: 38, padding: '0 18px', borderRadius: 11,
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                border: 'none',
                color: '#0E0E18',
                fontFamily: C.sans,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: `0 4px 18px ${C.goldGlow}, 0 1px 3px rgba(0,0,0,0.3)`,
                transition: 'all 0.18s ease',
                letterSpacing: 0.3,
                outline: 'none',
            }}
                onMouseEnter={e => {
                    (e.currentTarget).style.transform = 'translateY(-1px)';
                    (e.currentTarget).style.boxShadow = `0 6px 24px ${C.goldGlowStrong}, 0 2px 6px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={e => {
                    (e.currentTarget).style.transform = 'translateY(0)';
                    (e.currentTarget).style.boxShadow = `0 4px 18px ${C.goldGlow}, 0 1px 3px rgba(0,0,0,0.3)`;
                }}
            >
                <Zap size={13} strokeWidth={2.5} />
                Acción Rápida
            </button>
        </div>
    );
}
