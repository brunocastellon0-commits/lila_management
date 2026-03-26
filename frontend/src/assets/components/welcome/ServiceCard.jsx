/**
 * ServiceCard.premium.jsx — Tarjeta de servicio/característica para La Bourboneria
 *
 * Cambios respecto al original:
 * - Fondo oscuro (#13161C) en lugar de bg-white
 * - Ícono con glow animado y gradiente de marca
 * - Línea de acento izquierda que crece en hover (no el scale del ícono — eso es genérico)
 * - Reveal de descripción con más detalle y tipografía refinada
 * - Borde inferior de color que aparece en hover
 * - Soporte para colores de acento personalizados por servicio
 */

import { motion } from 'framer-motion';

/**
 * ServiceCard — Tarjeta de servicio/característica premium.
 *
 * @param {Component} icon        - Componente ícono de Lucide React
 * @param {string}    title       - Nombre del servicio
 * @param {string}    description - Descripción corta
 * @param {string}    accent      - Color HEX de acento (por defecto: teal #2A9D8F)
 * @param {string}    label       - Etiqueta superior opcional (ej: "Exclusivo")
 * @param {string}    gradient    - Sobrescribe el gradiente del ícono si se provee
 */
export function ServiceCard({
  icon: Icon,
  title,
  description,
  accent = '#1C4447',
  label,
  gradient,
}) {
  // Construye el gradiente del ícono dinámicamente basado en el acento
  const iconGradient = gradient || `linear-gradient(135deg, #1C4447 0%, ${accent} 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-default"
    >
      <div
        className="relative p-6 rounded-2xl overflow-hidden transition-all duration-500 h-full"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(28,68,71,0.10)',
          boxShadow: '0 4px 20px rgba(28,68,71,0.07)',
        }}
      >

        {/* ── LÍNEA DE ACENTO IZQUIERDA ─────────────────────────────────────
         * Crece de arriba a abajo en hover.
         * Mucho más sutil y elegante que solo hacer scale del ícono.
         */}
        <div
          className="absolute left-0 top-8 bottom-8 w-[2px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }}
        />

        {/* ── BORDE INFERIOR DE ACENTO ─────────────────────────────────────
         * Aparece en hover desde el centro hacia afuera.
         * Alternativa más sofisticada al border-teal básico.
         */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }}
        />

        {/* ── GLOW DE FONDO ─────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 0% 100%, ${accent}08 0%, transparent 60%)`,
          }}
        />

        {/* ── CONTENIDO ────────────────────────────────────────────────── */}
        <div className="relative z-10">

          {/* Etiqueta opcional */}
          {label && (
            <div
              className="inline-flex items-center mb-4 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.2em]"
              style={{
                background: `${accent}15`,
                border: `1px solid ${accent}30`,
                color: accent,
              }}
            >
              {label}
            </div>
          )}

          {/* ── ÍCONO ────────────────────────────────────────────────── */}
          <div className="mb-5 relative">
            {/*
             * El ícono tiene dos capas:
             * 1. El fondo con gradiente (siempre visible)
             * 2. Un glow radial que pulsa en hover
             */}
            <div className="relative inline-flex">
              
              {/* Glow pulsante detrás del ícono */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
                  filter: 'blur(10px)',
                  transform: 'scale(1.5)',
                }}
              />

              {/* Contenedor del ícono */}
              <div
                className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  background: iconGradient,
                  boxShadow: `0 0 20px ${accent}25`,
                }}
              >
                {Icon && (
                  <Icon
                    className="w-7 h-7"
                    style={{ color: 'rgba(255,255,255,0.95)' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Título */}
          <h3
            className="text-lg font-light mb-2 transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif", color: '#2B2D42' }}
          >
            {title}
          </h3>

          {/* Separador decorativo */}
          <div
            className="h-px mb-3 transition-all duration-500"
            style={{
              background: `linear-gradient(to right, ${accent}50, transparent)`,
              width: '32px',
            }}
          />

          {/* Descripción */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(43,45,66,0.55)', fontWeight: 300 }}
          >
            {description}
          </p>

        </div>

      </div>
    </motion.div>
  );
}

/**
 * ServicesGrid — Wrapper con stagger automático.
 * Úsalo así:
 *
 * <ServicesGrid services={[
 *   { icon: Coffee, title: "Barismo", description: "...", accent: "#2A9D8F" },
 *   { icon: UtensilsCrossed, title: "Cocina", description: "...", accent: "#C8874E" },
 * ]} />
 */
export function ServicesGrid({ services = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.6,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ServiceCard {...service} />
        </motion.div>
      ))}
    </div>
  );
}