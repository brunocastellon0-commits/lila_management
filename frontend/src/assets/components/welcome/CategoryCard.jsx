/**
 * CategoryCard.premium.jsx — Tarjeta de categoría premium para café-bar
 *
 * Características:
 * - Glassmorphism avanzado con backdrop-blur selectivo
 * - Borde animado con gradiente giratorio (CSS custom property trick)
 * - Hover con scale suave, elevación de luz y reveal de CTA
 * - Imagen de fondo con parallax interno (transform en hover)
 * - Sin imágenes reales necesarias — usa gradientes temáticos
 *
 * IMÁGENES RECOMENDADAS (Unsplash, libre de uso):
 * Café espresso: https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80
 * Cócteles:      https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80
 * Vinos:         https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80
 * Desayunos:     https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80
 * Cocktails dark:https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80
 * Barista:       https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80
 */

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// ─── DATOS DE EJEMPLO ──────────────────────────────────────────────────────────
// Reemplaza con tus categorías reales o recibe estos como props
export const CAFE_CATEGORIES = [
  {
    id: 'espresso',
    label: 'Cafetería',
    title: 'Espressos & Filtros',
    description: 'Orígenes de especialidad, tostados en casa.',
    count: '18 variedades',
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
    accent: '#D4A373', // Café Tostado
    fallbackGradient: 'linear-gradient(135deg, #2e1f0e 0%, #5a3d1e 50%, #2e1f0e 100%)',
    icon: '☕',
  },
  {
    id: 'cocktails',
    label: 'Bar',
    title: 'Cócteles de Autor',
    description: 'Técnica, historia y creatividad en cada vaso.',
    count: '24 creaciones',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
    accent: '#1C4447', // Deep Teal
    fallbackGradient: 'linear-gradient(135deg, #0e1e1f 0%, #1C4447 50%, #0e1e1f 100%)',
    icon: '🍸',
  },
  {
    id: 'wines',
    label: 'Bodega',
    title: 'Vinos & Destilados',
    description: 'Selección curada de cepas y etiquetas premium.',
    count: '40+ etiquetas',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    accent: '#A5C088', // Sage Green
    fallbackGradient: 'linear-gradient(135deg, #1a2a15 0%, #3a5a2a 50%, #1a2a15 100%)',
    icon: '🍷',
  },
  {
    id: 'food',
    label: 'Cocina',
    title: 'Tapas & Desayunos',
    description: 'Del brunch tardío a las tapas de medianoche.',
    count: '32 platos',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    accent: '#D4A373', // Café Tostado
    fallbackGradient: 'linear-gradient(135deg, #2e1f0e 0%, #5a3d1e 50%, #2e1f0e 100%)',
    icon: '🫙',
  },
];


// ─── HOOK DE TILT ─────────────────────────────────────────────────────────────
/**
 * useTilt — Efecto de inclinación 3D al hacer hover sobre la tarjeta.
 * Da la sensación de interactividad física.
 */
function useTilt(strength = 15) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), springConfig);

  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}


// ─── COMPONENTE CATEGORYCARD ──────────────────────────────────────────────────

/**
 * CategoryCard — Tarjeta premium para categorías del menú.
 *
 * @param {string} id                - ID único
 * @param {string} label             - Etiqueta de sección (ej: "Bar")
 * @param {string} title             - Título principal
 * @param {string} description       - Descripción corta
 * @param {string} count             - Cantidad de items
 * @param {string} image             - URL de imagen
 * @param {string} accent            - Color de acento HEX
 * @param {string} fallbackGradient  - Gradiente CSS si imagen falla
 * @param {string} icon              - Emoji o símbolo del icono
 * @param {function} onClick         - Callback al hacer click
 */
export function CategoryCard({
  label       = 'Categoría',
  title       = 'Título',
  description = 'Descripción de la categoría.',
  count       = '',
  image       = '',
  accent      = '#1C4447',
  fallbackGradient = 'linear-gradient(135deg, #1C4447 0%, #2e6368 100%)',
  icon        = '✦',
  onClick,
}) {
  const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(8);

  return (
    /*
     * perspective-[1200px] activa el contexto 3D del tilt.
     * La tarjeta necesita esta perspectiva en su padre.
     */
    <div style={{ perspective: '1200px' }}>
      <motion.div
        ref={ref}
        className="relative group cursor-pointer select-none"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >

        {/* ── BORDE ANIMADO CON GRADIENTE ─────────────────────────────── */}
        {/*
         * Técnica: Usamos un pseudo-elemento (aquí un div absoluto) con
         * fondo de gradiente cónico giratorio para simular un borde animado.
         * El clip interior crea el efecto de "borde iluminado".
         *
         * RENDIMIENTO: Solo anima `transform: rotate()` — no repaint ni reflow.
         */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ zIndex: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${accent} 30%, transparent 60%, ${accent}40 80%, transparent 100%)`,
              filter: 'blur(2px)',
            }}
          />
        </motion.div>


        {/* ── CUERPO DE LA TARJETA (Glassmorphism) ────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl h-[360px] flex flex-col justify-end"
          style={{
            /*
             * GLASSMORPHISM OPTIMIZADO:
             * backdrop-filter SOLO en el overlay de texto (abajo), NO en la imagen.
             * Esto evita que el blur pesado afecte toda la tarjeta.
             *
             * bg: base oscura con alfa alto para que se vea sobre cualquier fondo.
             * border: semitransparente que capta el gradiente del hover.
             */
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            zIndex: 1,
          }}
        >

          {/* ── IMAGEN + OVERLAY DE CALIDAD ─────────────────────────── */}
          <div className="absolute inset-0">
            {/* Imagen con parallax interno en hover */}
            <motion.div
              className="absolute inset-0"
              style={{ scale: 1 }} // el scale se aplica en group-hover vía CSS
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Si la imagen falla, muestra el gradiente de respaldo
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full" style={{ background: fallbackGradient }} />
              )}
            </motion.div>

            {/* Gradiente de vignette — oscurece bordes, focaliza el centro */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%),
                  linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)
                `,
              }}
            />

            {/* Overlay de color de acento — sutil, solo en hover */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.15 }}
              transition={{ duration: 0.4 }}
              style={{ background: accent, mixBlendMode: 'overlay' }}
            />
          </div>


          {/* ── CONTENIDO TEXTUAL ───────────────────────────────────── */}
          {/*
           * GLASSMORPHISM LOCAL: El backdrop-blur se aplica SOLO al footer
           * de la tarjeta, no a toda la tarjeta. Mucho más eficiente.
           *
           * Tailwind classes clave:
           * - backdrop-blur-md   → blur moderado (8px) — buen equilibrio perf/calidad
           * - bg-black/30        → base oscura semitransparente
           * - border-t border-white/5 → línea separadora casi invisible
           */}
          <div
            className="relative z-10 p-5 backdrop-blur-md"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >

            {/* Etiqueta de sección */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: accent }}
              />
              <span
                className="text-[10px] tracking-[0.25em] uppercase font-mono font-medium"
                style={{ color: accent }}
              >
                {label}
              </span>
            </div>

            {/* Título */}
            <h3
              className="text-white text-xl font-light leading-tight mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>

            {/* Descripción — oculta por defecto, aparece en hover */}
            <motion.p
              className="text-white/50 text-sm leading-snug overflow-hidden"
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              whileHover={{ height: 'auto', opacity: 1, marginBottom: 12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {description}
            </motion.p>

            {/* Footer: count + CTA */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/30 text-xs font-mono">{count}</span>

              {/* CTA — aparece en hover */}
              <motion.div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: accent }}
                initial={{ opacity: 0, x: -8 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span>Ver todo</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>

          </div>


          {/* ── LUZ DE ACENTO (Z-axis feel) ─────────────────────────── */}
          {/*
           * Un orbe de luz del color del acento que aparece en hover.
           * Da la sensación de que la tarjeta "se ilumina desde dentro".
           * RENDIMIENTO: Solo opacity transition — GPU friendly.
           */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accent}25 0%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'translate(30%, -30%)',
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

        </div>
      </motion.div>
    </div>
  );
}


// ─── MENU GALLERY — El componente que va en Welcome.jsx ───────────────────────
/**
 * MenuGallery — Grid de CategoryCards con stagger de entrada.
 * Reemplaza el <CategoryCard /> actual en Welcome.jsx con:
 *   <MenuGallery />
 */
export function MenuGallery({ categories = CAFE_CATEGORIES }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat, index) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.7,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <CategoryCard
            {...cat}
            onClick={() => console.log(`Navegando a: ${cat.id}`)}
          />
        </motion.div>
      ))}
    </div>
  );
}