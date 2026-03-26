/**
 * ProductCard.premium.jsx — Tarjeta de producto/plato para La Bourboneria
 *
 * Cambios respecto al original:
 * - Fondo oscuro (#13161C) en lugar de bg-white  
 * - Tilt 3D sutil en hover (igual sistema que CategoryCard)
 * - Estrellas con animación de fill gradual
 * - Badge "Nuevo" con glow pulsante
 * - Badge personalizado con color de acento del café (ámbar/teal/etc.)
 * - Botón "Acceder" con gradiente de marca + glow
 * - Estado con punto indicador animado
 * - Imagen con parallax interno y overlay de marca
 */

import { Star } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

// ─── HOOK DE TILT (reutilizado del sistema de CategoryCard) ───────────────────
function useTilt(strength = 6) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 250, damping: 35 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), springConfig);

  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const onMouseLeave = () => { x.set(0); y.set(0); };

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─── COLORES DE BADGE POR TIPO ────────────────────────────────────────────────
// Mapeo de tags a colores temáticos del café-bar
const TAG_COLORS = {
  'nuevo':       { bg: 'rgba(28,68,71,0.12)',   border: 'rgba(28,68,71,0.3)',    text: '#1C4447'  },
  'popular':     { bg: 'rgba(212,163,115,0.15)', border: 'rgba(212,163,115,0.35)', text: '#a07040'  },
  'limitado':    { bg: 'rgba(165,192,136,0.15)', border: 'rgba(165,192,136,0.35)', text: '#5a8a40'  },
  'temporada':   { bg: 'rgba(212,163,115,0.12)', border: 'rgba(212,163,115,0.3)', text: '#8a6030'  },
  'sin gluten':  { bg: 'rgba(165,192,136,0.1)',  border: 'rgba(165,192,136,0.25)', text: '#5a8a40'  },
  'default':     { bg: 'rgba(28,68,71,0.06)',    border: 'rgba(28,68,71,0.15)',   text: 'rgba(43,45,66,0.6)' },
};

function getTagColor(tag) {
  if (!tag) return TAG_COLORS.default;
  const key = tag.toLowerCase();
  return TAG_COLORS[key] || TAG_COLORS.default;
}

// ─── COMPONENTE ESTRELLA ANIMADA ──────────────────────────────────────────────
function AnimatedStar({ filled, index }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.05 * index, duration: 0.3, ease: 'backOut' }}
    >
      <Star
        className="w-3.5 h-3.5"
        style={{
          fill: filled ? '#D4A373' : 'rgba(43,45,66,0.12)',
          color: filled ? '#D4A373' : 'rgba(43,45,66,0.12)',
        }}
      />
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ProductCard({ image, title, status, rating = 0, members, isNew, tag }) {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(5);
  const tagColor = getTagColor(tag);

  return (
    <div style={{ perspective: '1200px' }}>
      <motion.div
        ref={ref}
        className="group cursor-pointer"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative overflow-hidden rounded-2xl transition-all duration-500"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(28,68,71,0.10)',
            boxShadow: '0 4px 20px rgba(28,68,71,0.08)',
          }}
        >
          {/* ── BORDER GLOW EN HOVER ──────────────────────────────────── */}
          <div
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(135deg, rgba(28,68,71,0.12) 0%, transparent 40%, rgba(212,163,115,0.08) 100%)',
            }}
          />

          {/* ── IMAGEN ──────────────────────────────────────────────── */}
          <div className="relative aspect-square overflow-hidden bg-[#0c0e12]">
            
            {/* Imagen con zoom */}
            <img
              src={image || 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80'}
              alt={title || 'Producto'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />

            {/* Overlay para que los badges se lean */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)' }}
            />

            {/* Overlay de acento en hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              style={{ background: '#1C4447', mixBlendMode: 'multiply' }}
            />

            {/* ── BADGES ── */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              
              {/* Badge "Nuevo" — glow pulsante */}
              {isNew && (
                <motion.div
                  animate={{ boxShadow: ['0 0 8px rgba(28,68,71,0.25)', '0 0 16px rgba(28,68,71,0.45)', '0 0 8px rgba(28,68,71,0.25)'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="px-2.5 py-1 rounded-full text-[9px] font-mono font-medium uppercase tracking-[0.2em]"
                  style={{
                    background: 'rgba(28,68,71,0.15)',
                    border: '1px solid rgba(28,68,71,0.4)',
                    color: '#1C4447',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  Nuevo
                </motion.div>
              )}

              {/* Badge de tag con color dinámico */}
              {tag && (
                <div
                  className="px-2.5 py-1 rounded-full text-[9px] font-mono font-medium uppercase tracking-[0.15em]"
                  style={{
                    background: tagColor.bg,
                    border: `1px solid ${tagColor.border}`,
                    color: tagColor.text,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {tag}
                </div>
              )}
            </div>

          </div>

          {/* ── CONTENIDO ────────────────────────────────────────────── */}
          <div className="p-4 relative z-10">
            
            {/* Título */}
            <h3
              className="text-base font-light leading-snug mb-3 line-clamp-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#2B2D42',
                minHeight: '2.8rem',
              }}
            >
              {title}
            </h3>

            {/* Rating con estrellas animadas */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <AnimatedStar key={i} filled={i < Math.floor(rating)} index={i} />
                ))}
              </div>
              {members && (
                <span
                  className="text-[11px] font-mono"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  ({members})
                </span>
              )}
            </div>

            {/* Separador */}
            <div
              className="h-px mb-4"
              style={{ background: 'rgba(28,68,71,0.08)' }}
            />

            {/* Footer: estado + botón */}
            <div className="flex items-center justify-between">
              
              {/* Estado con indicador de punto animado */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#1C4447' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: '#1C4447', fontFamily: "'DM Mono', monospace" }}
                >
                  {status}
                </span>
              </div>

              {/* Botón Acceder */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-1.5 rounded-full text-white text-xs font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #1C4447, #D4A373)',
                  boxShadow: '0 0 16px rgba(28,68,71,0.2)',
                }}
              >
                Acceder
              </motion.button>

            </div>
          </div>

          {/* ── LUZ AMBIENTAL ──────────────────────────────────────── */}
          <div
            className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(42,157,143,0.1) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />

        </div>
      </motion.div>
    </div>
  );
}