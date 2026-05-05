import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, Plus, UserCircle2, MapPin } from 'lucide-react';
import { C } from './tokens';

const ZONES = ['Todos', 'Interior', 'Terraza', 'VIP', 'Barra'];

function getElapsed(startTs) {
    const elapsed = Math.floor((Date.now() - startTs) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TableSVG({
    shape, chairs, state,
}) {
    const isAvailable = state === 'available';
    const isReady = state === 'ready';

    const chairFill = isAvailable
        ? 'rgba(80,80,100,0.35)'
        : isReady
            ? 'rgba(40,105,92,0.55)'
            : 'rgba(130,95,40,0.50)';

    const tableFill = isAvailable
        ? 'rgba(65,65,90,0.18)'
        : isReady
            ? 'rgba(18,58,52,0.65)'
            : 'rgba(60,38,10,0.68)';

    const tableStroke = isAvailable
        ? 'rgba(255,255,255,0.07)'
        : isReady
            ? C.teal
            : C.gold;

    const tableStrokeW = isAvailable ? '1' : '1.5';

    const chairAngles = {
        2: [0, 180],
        4: [0, 90, 180, 270],
        6: [0, 60, 120, 180, 240, 300],
    };

    if (shape === 'circle') {
        return (
            <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
                {/* Glow filter for non-available */}
                {!isAvailable && (
                    <defs>
                        <filter id={`glow-${state}`} x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="0" result="offsetblur" />
                            <feFlood floodColor={isReady ? C.teal : C.gold} floodOpacity="0.4" result="color" />
                            <feComposite in="color" in2="offsetblur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                )}

                {/* Chairs */}
                {chairAngles[chairs].map((angle) => (
                    <rect
                        key={angle}
                        x="43" y="3"
                        width="14" height="11"
                        rx="5.5"
                        fill={chairFill}
                        transform={`rotate(${angle} 50 50)`}
                    />
                ))}

                {/* Table circle */}
                <circle
                    cx="50" cy="50" r="27"
                    fill={tableFill}
                    stroke={tableStroke}
                    strokeWidth={tableStrokeW}
                    filter={!isAvailable ? `url(#glow-${state})` : undefined}
                />

                {/* Inner ring detail */}
                {!isAvailable && (
                    <circle cx="50" cy="50" r="20" fill="none" stroke={tableStroke} strokeWidth="0.5" strokeOpacity="0.3" />
                )}
            </svg>
        );
    }

    // Square table
    const chairMap = {
        2: [
            <rect key="t" x="33" y="5" width="34" height="14" rx="5" fill={chairFill} />,
            <rect key="b" x="33" y="81" width="34" height="14" rx="5" fill={chairFill} />,
        ],
        4: [
            <rect key="t" x="33" y="5" width="34" height="14" rx="5" fill={chairFill} />,
            <rect key="b" x="33" y="81" width="34" height="14" rx="5" fill={chairFill} />,
            <rect key="l" x="5" y="36" width="14" height="28" rx="5" fill={chairFill} />,
            <rect key="r" x="81" y="36" width="14" height="28" rx="5" fill={chairFill} />,
        ],
        6: [
            <rect key="tl" x="20" y="5" width="27" height="14" rx="5" fill={chairFill} />,
            <rect key="tr" x="53" y="5" width="27" height="14" rx="5" fill={chairFill} />,
            <rect key="bl" x="20" y="81" width="27" height="14" rx="5" fill={chairFill} />,
            <rect key="br" x="53" y="81" width="27" height="14" rx="5" fill={chairFill} />,
            <rect key="l" x="5" y="37" width="14" height="26" rx="5" fill={chairFill} />,
            <rect key="r" x="81" y="37" width="14" height="26" rx="5" fill={chairFill} />,
        ],
    };

    return (
        <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
            {!isAvailable && (
                <defs>
                    <filter id={`glow-sq-${state}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
                        <feFlood floodColor={isReady ? C.teal : C.gold} floodOpacity="0.35" result="color" />
                        <feComposite in="color" in2="offsetblur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            )}

            {chairMap[chairs]}

            <rect
                x="22" y="22" width="56" height="56" rx="8"
                fill={tableFill}
                stroke={tableStroke}
                strokeWidth={tableStrokeW}
                filter={!isAvailable ? `url(#glow-sq-${state})` : undefined}
            />

            {/* Inner detail line */}
            {!isAvailable && (
                <rect x="28" y="28" width="44" height="44" rx="5" fill="none" stroke={tableStroke} strokeWidth="0.5" strokeOpacity="0.25" />
            )}
        </svg>
    );
}

function TableCard({
    table, selected, onSelect, tick,
}) {
    const { state, shape, chairs, number, zone, server, startTs } = table;

    const isOccupied = state === 'occupied';
    const isAttention = state === 'attention';
    const isReady = state === 'ready';
    const isAvailable = state === 'available';

    const cardBg = isAvailable
        ? C.bgCard2
        : isReady
            ? '#111C1A'
            : '#1C1710';

    const borderColor = selected
        ? C.goldVibrant
        : isReady
            ? C.tealBorder
            : isAttention
                ? C.goldBorderStrong
                : isOccupied
                    ? C.goldBorder
                    : C.br;

    const shadowBase = selected
        ? `0 0 0 2px ${C.gold}, 0 8px 32px rgba(0,0,0,0.5)`
        : isAttention
            ? `0 0 28px ${C.goldGlow}, 0 6px 20px rgba(0,0,0,0.4)`
            : isReady
                ? `0 0 20px ${C.tealGlow}, 0 6px 20px rgba(0,0,0,0.4)`
                : isOccupied
                    ? `0 0 16px ${C.goldDim}, 0 6px 20px rgba(0,0,0,0.35)`
                    : `0 4px 16px rgba(0,0,0,0.25)`;

    const elapsed = startTs ? getElapsed(startTs) : null;

    const stateLabel = {
        occupied: { text: 'Ocupada', color: C.gold, bg: C.goldDim },
        available: { text: 'Libre', color: C.t3, bg: 'rgba(255,255,255,0.04)' },
        attention: { text: 'Atención', color: C.goldVibrant, bg: C.goldDim },
        ready: { text: 'Lista', color: C.teal, bg: C.tealDim },
    }[state];

    return (
        <motion.div
            onClick={onSelect}
            animate={
                isAttention
                    ? {
                        boxShadow: [
                            `0 0 20px rgba(201,146,74,0.25), 0 6px 20px rgba(0,0,0,0.4)`,
                            `0 0 42px rgba(201,146,74,0.55), 0 0 70px rgba(201,146,74,0.18), 0 6px 20px rgba(0,0,0,0.4)`,
                            `0 0 20px rgba(201,146,74,0.25), 0 6px 20px rgba(0,0,0,0.4)`,
                        ],
                    }
                    : { boxShadow: shadowBase }
            }
            transition={isAttention ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 18,
                padding: '14px 12px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
                transition: 'border-color 0.2s, background 0.2s',
                userSelect: 'none',
            }}
            whileHover={{ scale: 1.025, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
        >
            {/* State badge top-right */}
            {isAttention && (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 20, height: 20,
                    background: C.goldDim,
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <AlertCircle size={12} color={C.gold} strokeWidth={2.5} />
                </div>
            )}
            {isReady && (
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 20, height: 20,
                    background: C.tealDim,
                    border: `1px solid ${C.tealBorder}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <CheckCircle2 size={12} color={C.teal} strokeWidth={2.5} />
                </div>
            )}

            {/* Table SVG */}
            <div style={{ width: 82, height: 82, opacity: isAvailable ? 0.55 : 1 }}>
                <TableSVG shape={shape} chairs={chairs} state={state} />
            </div>

            {/* Table Number */}
            <div style={{
                fontFamily: C.serif,
                fontSize: 15,
                fontWeight: 600,
                color: isAvailable ? C.t3 : isReady ? C.tealLight : C.goldLight,
                lineHeight: 1,
            }}>
                Mesa {number}
            </div>

            {/* Timer (if active) */}
            {elapsed && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: isReady ? C.tealDim : C.goldDim,
                    border: `1px solid ${isReady ? C.tealBorder : C.goldBorder}`,
                    borderRadius: 20,
                    padding: '3px 8px',
                }}>
                    <Clock size={9} color={isReady ? C.teal : C.gold} strokeWidth={2.5} />
                    <span style={{
                        fontSize: 10,
                        fontFamily: C.sans,
                        fontWeight: 600,
                        color: isReady ? C.teal : C.gold,
                        letterSpacing: 0.5,
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {elapsed}
                    </span>
                </div>
            )}

            {/* Zone & Server */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: -2 }}>
                <MapPin size={8} color={C.t3} />
                <span style={{ fontSize: 9, fontFamily: C.sans, color: C.t3 }}>{zone}</span>
                {server && (
                    <>
                        <span style={{ color: C.t3, fontSize: 8 }}>·</span>
                        <UserCircle2 size={8} color={C.t3} />
                        <span style={{ fontSize: 9, fontFamily: C.sans, color: C.t3 }}>{server}</span>
                    </>
                )}
            </div>

            {/* Status badge bottom */}
            <div style={{
                padding: '3px 10px', borderRadius: 20,
                background: stateLabel.bg,
                color: stateLabel.color,
                fontSize: 9,
                fontFamily: C.sans,
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginTop: 2,
            }}>
                {stateLabel.text}
            </div>
        </motion.div>
    );
}

export function TableMap({ tables, selectedId, onSelect, tick }) {
    const [activeZone, setActiveZone] = useState('Todos');

    const filtered = activeZone === 'Todos'
        ? tables
        : tables.filter(t => t.zone === activeZone);

    const counts = {
        occupied: tables.filter(t => t.state === 'occupied').length,
        available: tables.filter(t => t.state === 'available').length,
        attention: tables.filter(t => t.state === 'attention').length,
        ready: tables.filter(t => t.state === 'ready').length,
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: C.bg,
        }}>
            {/* Section Header */}
            <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <h1 style={{
                            fontFamily: C.serif,
                            fontSize: 24,
                            fontWeight: 600,
                            color: C.t1,
                            letterSpacing: '-0.3px',
                            margin: 0,
                            lineHeight: 1.2,
                        }}>
                            Mapa de Salón
                        </h1>
                        <p style={{ fontFamily: C.sans, fontSize: 12, color: C.t3, margin: '4px 0 0' }}>
                            {tables.length} mesas · {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} h
                        </p>
                    </div>

                    {/* Quick stats */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[
                            { label: 'Ocupadas', count: counts.occupied, color: C.gold, bg: C.goldDim, border: C.goldBorder },
                            { label: 'Libres', count: counts.available, color: C.t2, bg: 'rgba(255,255,255,0.04)', border: C.br2 },
                            { label: 'Atención', count: counts.attention, color: C.goldVibrant, bg: C.goldDim, border: C.goldBorderStrong },
                            { label: 'Listas', count: counts.ready, color: C.teal, bg: C.tealDim, border: C.tealBorder },
                        ].map(({ label, count, color, bg, border }) => (
                            <div key={label} style={{
                                padding: '6px 12px', borderRadius: 10,
                                background: bg, border: `1px solid ${border}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                            }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: C.sans }}>{count}</span>
                                <span style={{ fontSize: 9, color: C.t3, fontFamily: C.sans, letterSpacing: 0.4 }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Zone Filter Tabs */}
                <div style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${C.br}`, paddingBottom: 0 }}>
                    {ZONES.map(zone => (
                        <button
                            key={zone}
                            onClick={() => setActiveZone(zone)}
                            style={{
                                padding: '7px 14px',
                                borderRadius: '8px 8px 0 0',
                                background: activeZone === zone ? C.goldDim : 'transparent',
                                border: 'none',
                                borderBottom: activeZone === zone ? `2px solid ${C.gold}` : '2px solid transparent',
                                color: activeZone === zone ? C.goldLight : C.t3,
                                fontSize: 11,
                                fontFamily: C.sans,
                                fontWeight: activeZone === zone ? 600 : 400,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.15s',
                                letterSpacing: 0.3,
                            }}
                        >
                            {zone}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button style={{
                        padding: '6px 14px',
                        borderRadius: '8px 8px 0 0',
                        background: 'transparent', border: 'none',
                        borderBottom: '2px solid transparent',
                        color: C.gold, fontSize: 11, fontFamily: C.sans,
                        cursor: 'pointer', outline: 'none',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <Plus size={12} strokeWidth={2.5} />
                        Nueva Mesa
                    </button>
                </div>
            </div>

            {/* Tables Grid */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px 24px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${C.br2} transparent`,
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                    gap: 14,
                }}>
                    {filtered.map(table => (
                        <TableCard
                            key={table.id}
                            table={table}
                            selected={table.id === selectedId}
                            onSelect={() => onSelect(table.id)}
                            tick={tick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}