/**
 * ScrollFocusCards.jsx — Efecto zoom focal en scroll vertical
 *
 * Mientras el usuario scrollea hacia arriba/abajo normalmente,
 * la card que pasa por el CENTRO de la pantalla se agranda
 * y las que están arriba/abajo se encogen y se difuminan.
 *
 * Como si hubiera una lente en el centro del viewport.
 *
 * USO en welcome.jsx — reemplaza la sección de CategoryCard:
 *
 *   import { ScrollFocusCards } from '../assets/components/welcome/ScrollFocusCards';
 *   <ScrollFocusCards />
 */

import { useRef, useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

// ─── ITEMS ────────────────────────────────────────────────────────────────────
const ITEMS = [
  {
    id: 0,
    label:    'Cafetería',
    title:    'Espressos & Filtros',
    sub:      'Orígenes de especialidad, tostados en casa.',
    image:    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200&q=80',
    accent:   '#C8874E',
  },
  {
    id: 1,
    label:    'Bar',
    title:    'Cócteles de Autor',
    sub:      'Técnica, historia y creatividad en cada vaso.',
    image:    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80',
    accent:   '#2A9D8F',
  },
  {
    id: 2,
    label:    'Brunch',
    title:    'Cocina de Autor',
    sub:      'Del brunch tardío a las tapas de medianoche.',
    image:    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80',
    accent:   '#E9C46A',
  },
  {
    id: 3,
    label:    'Bodega',
    title:    'Vinos & Destilados',
    sub:      'Selección curada de cepas y etiquetas premium.',
    image:    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
    accent:   '#C8874E',
  },
  {
    id: 4,
    label:    'Bakery',
    title:    'Horneado Diario',
    sub:      'Artesanal cada mañana, sin excepción.',
    image:    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=1200&q=80',
    accent:   '#F5F0E8',
  },
];

// ─── CARD INDIVIDUAL ──────────────────────────────────────────────────────────
function FocalCard({ item }) {
  const cardRef = useRef(null);
  const [proximity, setProximity] = useState(0); // -1 a 1, 0 = centro exacto

  // Spring para suavizar los cambios
  const smoothProximity = useSpring(proximity, { stiffness: 120, damping: 24 });
  const [sp, setSp] = useState(0);

  useEffect(() => {
    return smoothProximity.on('change', v => setSp(v));
  }, [smoothProximity]);

  // Mide la distancia del centro del card al centro del viewport
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onScroll = () => {
      const rect         = card.getBoundingClientRect();
      const cardCenter   = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      // Distancia normalizada: 0 = centro perfecto, ±1 = un viewport de distancia
      const dist = (cardCenter - viewportCenter) / (window.innerHeight * 0.6);
      const clamped = Math.max(-1, Math.min(1, dist));

      setProximity(clamped);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check inicial
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cuánto está "en el centro" — 1 = centro exacto, 0 = lejos
  const centerAmount = Math.max(0, 1 - Math.abs(sp));

  // Valores calculados
  const scale       = 0.82 + centerAmount * 0.22;        // 0.82 → 1.04
  const opacity     = 0.35 + centerAmount * 0.65;        // 0.35 → 1.0
  const blur        = (1 - centerAmount) * 5;            // 5px → 0px
  const height      = 340 + centerAmount * 160;          // 340px → 500px
  const brightness  = 0.6 + centerAmount * 0.5;          // 0.6 → 1.1

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        opacity,
        filter: `blur(${blur}px) brightness(${brightness})`,
        transformOrigin: 'center center',
        willChange: 'transform, opacity, filter',
      }}
      className="w-full relative overflow-hidden"
      // El border-radius también cambia — más redondeado cuando está lejos
      animate={{ borderRadius: 12 + (1 - centerAmount) * 12 }}
      transition={{ borderRadius: { duration: 0.3 } }}
    >
      <div
        style={{ height, transition: 'height 0.4s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
          borderRadius: 'inherit', position: 'relative' }}
      >
        {/* Imagen de fondo */}
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            // La imagen hace un leve zoom inverso para efecto parallax interno
            transform: `scale(${1.1 - centerAmount * 0.08})`,
            transition: 'transform 0.5s ease',
          }}
          loading="lazy"
        />

        {/* Overlay de color cálido */}
        <div className="absolute inset-0"
          style={{ background: 'rgba(26,16,8,0.25)', mixBlendMode: 'multiply' }} />

        {/* Gradiente inferior */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(26,16,8,0.92) 0%, rgba(26,16,8,0.2) 50%, transparent 100%)',
        }} />

        {/* Línea de acento inferior — crece al entrar en foco */}
        <div className="absolute bottom-0 left-0 h-[2px]" style={{
          width: `${centerAmount * 100}%`,
          background: `linear-gradient(to right, ${item.accent}, transparent)`,
          transition: 'width 0.5s ease',
        }} />

        {/* Contenido */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">

          {/* Label pill */}
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{
              background: `${item.accent}18`,
              border: `1px solid ${item.accent}35`,
              opacity: 0.5 + centerAmount * 0.5,
              transform: `translateY(${(1 - centerAmount) * 10}px)`,
              transition: 'opacity 0.4s, transform 0.4s',
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-medium"
              style={{ color: item.accent }}>
              {item.label}
            </span>
          </div>

          {/* Título */}
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: `clamp(1.8rem, ${2 + centerAmount * 1.5}vw + 1rem, ${centerAmount > 0.7 ? 4 : 2.5}rem)`,
              fontWeight: 400,
              color: '#F5F0E8',
              lineHeight: 1.1,
              marginBottom: 10,
              transform: `translateY(${(1 - centerAmount) * 8}px)`,
              transition: 'transform 0.4s ease, font-size 0.4s ease',
            }}
          >
            {item.title}
          </h2>

          {/* Subtítulo — solo visible cerca del centro */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 300,
            color: 'rgba(245,240,232,0.55)',
            marginBottom: 20,
            opacity: Math.max(0, (centerAmount - 0.4) * 2.5),
            transform: `translateY(${(1 - centerAmount) * 16}px)`,
            transition: 'opacity 0.4s, transform 0.4s',
          }}>
            {item.sub}
          </p>

          {/* CTA — solo visible cuando está en foco */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: Math.max(0, (centerAmount - 0.6) * 4),
            transform: `translateY(${(1 - centerAmount) * 20}px)`,
            transition: 'opacity 0.3s, transform 0.4s',
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, fontWeight: 500,
              color: item.accent,
              borderBottom: `1px solid ${item.accent}60`,
              paddingBottom: 2,
            }}>
              Ver selección
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke={item.accent}
                strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Número de item — visible cuando está lejos */}
        <div className="absolute top-8 right-8" style={{
          opacity: Math.max(0, 1 - centerAmount * 2),
          transition: 'opacity 0.3s',
        }}>
          <span className="font-mono text-sm"
            style={{ color: 'rgba(245,240,232,0.2)', letterSpacing: '0.2em' }}>
            {String(item.id + 1).padStart(2, '0')}
          </span>
        </div>

      </div>
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ScrollFocusCards() {
  return (
    <section className="relative py-8" style={{ background: '#1A1008' }}>

      {/* Título de sección */}
      <div className="text-center mb-16 px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div style={{ height: 1, width: 32, background: 'rgba(200,135,78,0.5)' }} />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#C8874E' }}>
            Nuestra Carta
          </span>
          <div style={{ height: 1, width: 32, background: 'rgba(200,135,78,0.5)' }} />
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 400,
          color: '#F5F0E8',
        }}>
          Explora el menú
        </h2>
      </div>

      {/*
       * Stack vertical de cards.
       * gap negativo (-40px) hace que se superpongan levemente
       * dando más sensación de profundidad al efecto focal.
       */}
      <div
        className="flex flex-col mx-auto px-4 md:px-8"
        style={{
          maxWidth: 760,
          gap: '-20px',         // superposición sutil
          paddingBottom: 80,
        }}
      >
        {ITEMS.map(item => (
          <div key={item.id} style={{ marginBottom: -20 }}>
            <FocalCard item={item} />
          </div>
        ))}
      </div>

    </section>
  );
}

export default ScrollFocusCards;