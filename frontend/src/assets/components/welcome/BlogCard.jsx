/**
 * BlogCard.premium.jsx — Tarjeta de artículo editorial para La Bourboneria
 *
 * Cambios respecto al original:
 * - Fondo oscuro (#13161C) en lugar de bg-white
 * - Imagen con zoom suave + overlay de acento teal en hover
 * - Tipografía Playfair Display para el título (editorial)
 * - Metadata con iconos usando color de marca en lugar de gris genérico
 * - Borde con gradiente animado en hover (igual que CategoryCard)
 * - Categoría con glass pill en lugar de Badge blanco
 * - CTA con flecha que se anima en hover
 * - Línea decorativa de acento que crece en hover
 */

import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function BlogCard({ image, category, title, excerpt, date, readTime }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer h-full"
      style={{ perspective: '1000px' }}
    >
      {/*
       * Card container — glassmorphism oscuro.
       * border-[#1e2530] como base, se transforma en teal en hover via group-hover.
       * No usamos bg-white — usamos la superficie oscura del sistema.
       */}
      <div
        className="relative h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(28,68,71,0.10)',
          boxShadow: '0 4px 20px rgba(28,68,71,0.08)',
        }}
      >

        {/* ── BORDE DE ACENTO ACTIVO EN HOVER ──────────────────────────────
         * Un div absolute con gradiente que solo aparece en hover.
         * Ocupa -1px inset para simular un borde extra de 1px.
         * RENDIMIENTO: Solo opacity transition. No repaint.
         */}
        <div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(28,68,71,0.15) 0%, transparent 50%, rgba(212,163,115,0.08) 100%)',
          }}
        />

        {/* ── IMAGEN ───────────────────────────────────────────────────── */}
        <div className="relative aspect-video overflow-hidden bg-[#0c0e12] flex-shrink-0">
          
          {/* Imagen con zoom en hover */}
          <img
            src={image || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80'}
            alt={title || 'Artículo'}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay base oscuro para que la imagen no compita con el contenido */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
              opacity: 0.7,
            }}
          />

          {/* Overlay de color de acento en hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ background: '#1C4447', mixBlendMode: 'overlay' }}
          />

          {/* ── BADGE DE CATEGORÍA ── Glassmorphism pill ── */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-[0.2em]"
            style={{
              background: 'rgba(253,248,241,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(28,68,71,0.25)',
              color: '#1C4447',
            }}
          >
            {category}
          </div>

          {/* ── LÍNEA DE ACENTO inferior de imagen ── */}
          {/* Crece de izquierda a derecha en hover */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out"
            style={{ background: 'linear-gradient(to right, #1C4447, #D4A373)' }}
          />
        </div>

        {/* ── CONTENIDO ────────────────────────────────────────────────── */}
        <div className="p-6 flex flex-col flex-1 relative z-10">

          {/* Metadata: fecha y tiempo de lectura */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: '#1C4447' }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(43,45,66,0.5)' }}>
                {date}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(43,45,66,0.2)' }} />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: '#1C4447' }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(43,45,66,0.5)' }}>
                {readTime}
              </span>
            </div>
          </div>

          {/* Título — Playfair Display para feel editorial */}
          <h3
            className="text-xl font-light leading-snug mb-3 line-clamp-2 transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2B2D42' }}
          >
            {title}
          </h3>

          {/* Separador decorativo que se ilumina en hover */}
          <div
            className="h-px mb-3 transition-all duration-500"
            style={{
              background: 'linear-gradient(to right, rgba(28,68,71,0.35), transparent)',
              width: '40px',
            }}
          />

          {/* Excerpt */}
          <p
            className="text-sm line-clamp-3 flex-1 leading-relaxed mb-5"
            style={{ color: 'rgba(43,45,66,0.55)', fontWeight: 300 }}
          >
            {excerpt}
          </p>

          {/* CTA */}
          <button
            className="flex items-center gap-2 text-sm font-medium transition-all duration-300 group/cta self-start"
            style={{ color: '#1C4447' }}
          >
            <span
              className="border-b border-transparent group-hover/cta:border-current transition-colors duration-300 pb-0.5"
            >
              Leer más
            </span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1.5"
            />
          </button>

        </div>

        {/* ── LUZ AMBIENTAL DE HOVER ─────────────────────────────────── */}
        {/* Glow del color teal en la esquina superior derecha */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(28,68,71,0.08) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

      </div>
    </motion.div>
  );
}