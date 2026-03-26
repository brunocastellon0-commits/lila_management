/**
 * TestimonialCard.premium.jsx — Tarjeta de testimonio para La Bourboneria
 *
 * Cambios respecto al original:
 * - Fondo oscuro (#13161C) en lugar de bg-white
 * - Comilla gigante flotante como elemento decorativo (no el ícono pequeño)
 * - Estrellas con animación de entrada escalonada
 * - Avatar con ring de color de marca + glow en hover
 * - Nombre en Playfair Display (coherencia con el sistema)
 * - Rol con tipografía mono para look editorial
 * - Borde left de acento en hover (mismo lenguaje que ServiceCard)
 * - Soporte para foto de avatar o iniciales con gradiente
 */

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── COLORES DE AVATAR POR DEFECTO ───────────────────────────────────────────
// Rotan entre los colores de acento del café-bar para dar variedad
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #1C4447, #3a7a80)',
  'linear-gradient(135deg, #8a5a30, #D4A373)',
  'linear-gradient(135deg, #5a7a3a, #A5C088)',
  'linear-gradient(135deg, #2a4050, #3B4252)',
];

function getAvatarGradient(name = '') {
  // Usa la primera letra del nombre para asignar un gradiente consistente
  const index = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
/**
 * TestimonialCard — Tarjeta de testimonio premium.
 *
 * @param {string}   name      - Nombre del cliente
 * @param {string}   role      - Rol o descripción (ej: "Cliente habitual")
 * @param {string}   avatar    - Iniciales como fallback (ej: "MR") o URL de foto
 * @param {number}   rating    - Puntuación de 1 a 5
 * @param {string}   comment   - Texto del testimonio
 * @param {string}   accent    - Color de acento (opcional, default teal)
 */
export function TestimonialCard({
  name,
  role,
  avatar,
  rating = 5,
  comment,
  accent = '#1C4447',
}) {
  const avatarGradient  = getAvatarGradient(name);
  // Detecta si avatar es una URL o son iniciales
  const isUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full"
    >
      <div
        className="relative p-6 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(28,68,71,0.10)',
          boxShadow: '0 4px 20px rgba(28,68,71,0.07)',
        }}
      >

        {/* ── LÍNEA DE ACENTO IZQUIERDA (mismo lenguaje que ServiceCard) ── */}
        <div
          className="absolute left-0 top-8 bottom-8 w-[2px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }}
        />

        {/* ── COMILLA DECORATIVA FLOTANTE ──────────────────────────────────
         * Enorme, semitransparente, posicionada detrás del texto.
         * Mucho más memorable que el ícono Quote pequeño.
         * Usa Playfair Display para que tenga carácter tipográfico.
         */}
        <div
          className="absolute top-2 right-4 text-8xl leading-none font-serif pointer-events-none select-none transition-all duration-500 group-hover:opacity-100"
          style={{
            color: `${accent}`,
            opacity: 0.06,
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          "
        </div>

        {/* ── GLOW DE FONDO EN HOVER ──────────────────────────────────── */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 100% 0%, ${accent}06 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full">

          {/* ── RATING ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -15 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.05 * i,
                  duration: 0.4,
                  ease: 'backOut',
                }}
              >
                <Star
                  className="w-4 h-4"
                  style={{
                    fill: i < rating ? '#D4A373' : 'rgba(43,45,66,0.12)',
                    color: i < rating ? '#D4A373' : 'rgba(43,45,66,0.12)',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* ── COMENTARIO ───────────────────────────────────────────── */}
          {/*
           * pl-4 + border-left sutil = separación visual del "quote context"
           * sin necesidad del ícono Quote.
           */}
          <blockquote
            className="flex-1 text-sm leading-relaxed mb-6 pl-4"
            style={{
              color: 'rgba(43,45,66,0.65)',
              borderLeft: `2px solid ${accent}30`,
              fontWeight: 300,
              fontStyle: 'normal',
            }}
          >
            {comment}
          </blockquote>

          {/* ── SEPARADOR ───────────────────────────────────────────── */}
          <div
            className="h-px mb-4 transition-all duration-500"
            style={{
              background: `linear-gradient(to right, ${accent}30, transparent)`,
            }}
          />

          {/* ── AUTOR ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Avatar con ring de marca */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.2 }}
              className="relative flex-shrink-0"
            >
              {/* Ring exterior que aparece en hover */}
              <div
                className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `${accent}40` }}
              />

              {isUrl ? (
                /* Si es URL: foto real con clip circular */
                <img
                  src={avatar}
                  alt={name}
                  className="relative w-11 h-11 rounded-full object-cover ring-2"
                  style={{ ringColor: accent }}
                />
              ) : (
                /* Si son iniciales: fondo con gradiente del sistema */
                <div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2"
                  style={{
                    background: avatarGradient,
                    ringColor: `${accent}50`,
                    border: `2px solid ${accent}30`,
                  }}
                >
                  {avatar || (name ? name.slice(0, 2).toUpperCase() : '?')}
                </div>
              )}
            </motion.div>

            {/* Datos del autor */}
            <div>
              <p
                className="text-sm font-light leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: '#2B2D42' }}
              >
                {name}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{
                  color: accent,
                  fontFamily: "'DM Mono', monospace",
                  opacity: 0.8,
                }}
              >
                {role}
              </p>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}

/**
 * TestimonialsGrid — Grid con stagger para múltiples tarjetas.
 *
 * Uso:
 * <TestimonialsGrid testimonials={[{ name, role, avatar, rating, comment }]} />
 */
export function TestimonialsGrid({ testimonials = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {testimonials.map((t, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <TestimonialCard {...t} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── DATOS DE EJEMPLO ─────────────────────────────────────────────────────────
export const SAMPLE_TESTIMONIALS = [
  {
    name: 'María Fernández',
    role: 'Cliente habitual · La Recoleta',
    avatar: 'MF',
    rating: 5,
    comment: 'El espacio tiene una vibra única. El café es increíble y el equipo de baristas sabe exactamente lo que hace. Me quedé dos horas sin darme cuenta.',
    accent: '#1C4447',
  },
  {
    name: 'Carlos Medina',
    role: 'Fotógrafo · Cochabamba',
    avatar: 'CM',
    rating: 5,
    comment: 'La iluminación del lugar y el ambiente son perfectos para trabajar. El latte art que hacen es de otro nivel, casi da pena tomárselo.',
    accent: '#D4A373',
  },
  {
    name: 'Sofía Quispe',
    role: 'Diseñadora · Quillacollo',
    avatar: 'SQ',
    rating: 5,
    comment: 'Descubrí La Bourboneria buscando un lugar tranquilo y ya no puedo trabajar en otro sitio. El Chemex de Etiopía es simplemente perfecto.',
    accent: '#A5C088',
  },
];