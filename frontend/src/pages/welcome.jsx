/**
 * welcome.jsx — Living Background | La Bourboneria
 *
 * Fondo vivo en 3 capas:
 *  1. Ondas de espresso rotando (base — CSS puro, 0 JS)
 *  2. Vapor/humo subiendo (CSS keyframes)
 *  3. Granos de café flotando (SVG + framer-motion)
 *
 * Fondo base: #1A1008 (espresso oscuro CÁLIDO — sin azul)
 *
 * EFECTO SCROLL ZOOM + BLUR:
 *  - Sección entrando desde abajo: scale 0.90, blur 6px, opacidad 0.3
 *  - Sección en el centro del viewport: scale 1.0, blur 0, opacidad 1.0
 *  - Sección saliendo hacia arriba: scale 1.10, blur 8px, opacidad 0.0
 */

import { useEffect, useState, useRef } from 'react';
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  useScroll,
  AnimatePresence,
} from 'framer-motion';

import { Header }              from '../assets/components/welcome/Header';
import { HeroSection }         from '../assets/components/welcome/HeroSection';
import { MomentsGallery }      from '../assets/components/welcome/MomentsGallery';
import { CategoryCard }        from '../assets/components/welcome/CategoryCard';
import { PromotionsCarousel }  from '../assets/components/welcome/PromotionCarousel';
import { Newsletter }          from '../assets/components/welcome/Newsletter';
import { Footer }              from '../assets/components/welcome/Footer';
import { CoffeeScrollSection } from '../assets/components/welcome/ScrollObject3D';

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#1A1008',
  surface:  '#221608',
  surface2: '#2C1E0E',
  teal:     '#2A9D8F',
  tealDark: '#1B4F55',
  amber:    '#C8874E',
  gold:     '#E9C46A',
  cream:    '#F5F0E8',
};

// ─── MOUSE PARALLAX ──────────────────────────────────────────────────────────
function useMouseParallax() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 100 });
  useEffect(() => {
    const h = (e) => {
      mouseX.set((e.clientX / window.innerWidth  - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [mouseX, mouseY]);
  return { springX, springY };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  SCROLL ZOOM SECTION                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
/**
 * Envuelve cualquier sección con efecto de zoom + blur sincronizado con scroll.
 *
 * Curva de animación:
 *   scrollYProgress 0.00 → sección aparece en viewport desde abajo
 *                          scale=0.90  opacity=0.3  blur=6px
 *   scrollYProgress 0.25 → entra al "foco"
 *                          scale=1.00  opacity=1.0  blur=0px
 *   scrollYProgress 0.75 → sigue en foco mientras el scroll avanza
 *                          scale=1.00  opacity=1.0  blur=0px
 *   scrollYProgress 1.00 → sección desaparece por arriba
 *                          scale=1.10  opacity=0.0  blur=8px
 *
 * offset: ['start end', 'end start']
 *   → el progreso va de 0 a 1 durante TODA la travesía de la sección
 *     por el viewport (entra por abajo hasta que sale por arriba).
 */
function ScrollZoomSection({ children, className = '', style = {} }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Scale: pequeño al entrar → normal en el centro → grande al salir
  const scale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.78, 1.00, 1.00, 1.22]
  );

  // Opacity: translúcido al entrar → opaco en el centro → invisible al salir
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.20, 0.80, 1],
    [0.15, 1.0, 1.0, 0.0]
  );

  // Desplazamiento Y: baja al entrar → en posición → sube al salir
  const y = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [80, 0, 0, -80]
  );

  // Blur: borroso al entrar → nítido en el centro → borroso al salir
  const blurValue = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    [10, 0, 0, 14]
  );
  // Convertir el número a string CSS: "6px" → "blur(6px)"
  const filterStyle = useTransform(blurValue, (v) => `blur(${v}px)`);

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div
        style={{
          scale,
          opacity,
          y,
          filter: filterStyle,
          transformOrigin: 'center center',
          // Hint al navegador para optimizar GPU
          willChange: 'transform, opacity, filter',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  FONDO VIVO — 3 capas superpuestas                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
function WaveBackground() {
  return (
    <>
      <style>{`
        @keyframes wave-spin-1 {
          from { transform: rotate(0deg) translateY(0px); }
          to   { transform: rotate(360deg) translateY(-30px); }
        }
        @keyframes wave-spin-2 {
          from { transform: rotate(0deg) translateY(0px); }
          to   { transform: rotate(-360deg) translateY(20px); }
        }
        @keyframes wave-spin-3 {
          from { transform: rotate(180deg) translateY(0px); }
          to   { transform: rotate(540deg) translateY(-15px); }
        }
        @keyframes orb-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes grain-float {
          0%   { opacity: 0;                    transform: translateY(0)   rotate(0deg)   scale(0.85); }
          15%  { opacity: var(--grain-op); }
          85%  { opacity: var(--grain-op); }
          100% { opacity: 0;                    transform: translateY(-220px) rotate(200deg) scale(1.1); }
        }
        @keyframes vapor-rise {
          0%   { opacity: 0; transform: translateY(0) scaleX(1); }
          25%  { opacity: var(--vapor-op); }
          75%  { opacity: calc(var(--vapor-op) * 0.4); }
          100% { opacity: 0; transform: translateY(-300px) scaleX(3); }
        }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ backgroundColor: C.bg }}>

        {/* ── Ondas rotantes ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: '10%', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', width: '140vw', height: '140vw', borderRadius: '42%',
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(200,135,78,0.09) 0%, transparent 70%)',
            animation: 'wave-spin-1 28s linear infinite', transformOrigin: '50% 60%',
          }} />
          <div style={{
            position: 'absolute', width: '110vw', height: '110vw', borderRadius: '38%',
            background: 'radial-gradient(ellipse 50% 35% at 50% 50%, rgba(42,157,143,0.07) 0%, transparent 70%)',
            animation: 'wave-spin-2 38s linear infinite', transformOrigin: '50% 55%',
          }} />
          <div style={{
            position: 'absolute', width: '80vw', height: '80vw', borderRadius: '45%',
            background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(233,196,106,0.05) 0%, transparent 70%)',
            animation: 'wave-spin-3 20s linear infinite', transformOrigin: '52% 58%',
          }} />
        </div>

        {/* ── Orbes estáticos con breathe ── */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,135,78,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)', animation: 'orb-breathe 7s ease-in-out infinite', mixBlendMode: 'screen',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-8%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42,157,143,0.12) 0%, transparent 70%)',
          filter: 'blur(90px)', animation: 'orb-breathe 9s ease-in-out infinite reverse', mixBlendMode: 'screen',
        }} />

        {/* ── Noise texture ── */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }} />
      </div>
    </>
  );
}

function CoffeeGrains() {
  const grains = useRef(
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left:  5 + Math.random() * 90,
      size:  7 + Math.random() * 9,
      dur:   7 + Math.random() * 10,
      delay: Math.random() * 12,
      op:    0.12 + Math.random() * 0.22,
      rotate: Math.random() * 360,
      color: ['#3D2008','#5C3010','#7A4518','#4A2810','#6B3A1A'][Math.floor(Math.random() * 5)],
    }))
  ).current;

  return (
    <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {grains.map((g) => (
        <div key={g.id} style={{
          position: 'absolute', left: `${g.left}%`, bottom: `${Math.random() * 15}%`,
          width: g.size, height: g.size * 0.62, borderRadius: '50% 40% 50% 40%',
          background: g.color, border: '0.5px solid rgba(255,255,255,0.08)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
          '--grain-op': g.op,
          animation: `grain-float ${g.dur}s ease-in-out ${g.delay}s infinite`,
          transform: `rotate(${g.rotate}deg)`,
        }} />
      ))}
    </div>
  );
}

function CoffeeVapor() {
  const vapors = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i, left: 15 + i * 15 + Math.random() * 5,
      dur: 6 + Math.random() * 6, delay: Math.random() * 6,
      size: 30 + Math.random() * 50, op: 0.06 + Math.random() * 0.08,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {vapors.map((v) => (
        <div key={v.id} style={{
          position: 'absolute', bottom: 0, left: `${v.left}%`,
          width: v.size, height: v.size * 2, borderRadius: '50%',
          background: `rgba(200, 135, 78, ${v.op * 2})`, filter: 'blur(18px)',
          '--vapor-op': v.op, animation: `vapor-rise ${v.dur}s ease-out ${v.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

function ParallaxOrbs({ springX, springY }) {
  const o1x = useTransform(springX, [-1, 1], ['-4%', '4%']);
  const o1y = useTransform(springY, [-1, 1], ['-4%', '4%']);
  const o2x = useTransform(springX, [-1, 1], ['5%', '-5%']);
  const o2y = useTransform(springY, [-1, 1], ['3%', '-3%']);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      <motion.div style={{
        position: 'absolute', top: '15%', left: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,135,78,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', mixBlendMode: 'screen', x: o1x, y: o1y,
      }} />
      <motion.div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(42,157,143,0.07) 0%, transparent 70%)',
        filter: 'blur(70px)', mixBlendMode: 'screen', x: o2x, y: o2y,
      }} />
    </div>
  );
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY < 80);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
        >
          <div className="relative w-6 h-10 rounded-full overflow-hidden"
            style={{ border: `1px solid ${C.amber}50` }}>
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1 left-1/2 -translate-x-1/2"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <ellipse cx="5" cy="7" rx="4" ry="5.5" fill={C.amber} fillOpacity="0.9"/>
                <path d="M5 1.5 C5 4.5, 5 9.5, 5 12.5" stroke={C.bg} strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono"
            style={{ color: `${C.amber}70` }}>scroll</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionLabel({ children }) {
  return (
    <motion.div className="flex items-center justify-center gap-3 mb-3"
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <div className="h-px w-8" style={{ background: `${C.amber}55` }} />
      <span className="text-[11px] tracking-[0.3em] uppercase font-mono" style={{ color: C.amber }}>
        {children}
      </span>
      <div className="h-px w-8" style={{ background: `${C.amber}55` }} />
    </motion.div>
  );
}

function CoffeeDivider() {
  return (
    <motion.div className="flex items-center justify-center gap-4 py-10"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true }} transition={{ duration: 1 }}>
      <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to right, transparent, ${C.amber}40)` }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.5 }}>
        <ellipse cx="10" cy="10" rx="8" ry="5.5" stroke={C.amber} strokeWidth="1.2"/>
        <path d="M10 4.5 C10 7.5, 10 12.5, 10 15.5" stroke={C.amber} strokeWidth="1" strokeLinecap="round"/>
        <path d="M5.5 7 C7 8.5, 9 9, 10 10" stroke={C.amber} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <path d="M14.5 13 C13 11.5, 11 11, 10 10" stroke={C.amber} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      </svg>
      <div className="h-px flex-1 max-w-24" style={{ background: `linear-gradient(to left, transparent, ${C.amber}40)` }} />
    </motion.div>
  );
}

function FadeReveal({ children, direction = 'up', delay = 0, amount = 0.1, className = '' }) {
  const dirs = { up: { y: 36, x: 0, scale: 1 }, scale: { y: 0, x: 0, scale: 0.96 } };
  const d = dirs[direction] || dirs.up;
  return (
    <motion.div className={className}
      initial={{ opacity: 0, ...d }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  WELCOME                                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
export default function Welcome() {
  const { springX, springY } = useMouseParallax();

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: C.bg, color: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── FONDO VIVO (fixed, detrás de todo) ── */}
      <WaveBackground />
      <CoffeeGrains />
      <CoffeeVapor />
      <ParallaxOrbs springX={springX} springY={springY} />

      <ScrollIndicator />

      <div className="relative z-50"><Header /></div>

      <main className="relative z-10">

        {/* ────────────────────────────────────────────────
         *  1. HERO — también con ScrollZoomSection
         *  El Hero es la primera sección, solo se verá el
         *  efecto de "salida" (sale hacia arriba con zoom+blur)
         *  porque al cargar ya está en el centro.
         * ──────────────────────────────────────────────── */}
        <ScrollZoomSection className="relative">
          <HeroSection />
          <div className="absolute bottom-0 left-0 w-full h-52 pointer-events-none z-10"
            style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
        </ScrollZoomSection>

        {/* ────────────────────────────────────────────────
         *  2. GALERÍA
         * ──────────────────────────────────────────────── */}
        <ScrollZoomSection className="relative pt-4 pb-16">
          <div className="text-center mb-4 px-4 pt-4">
            <SectionLabel>Momentos</SectionLabel>
            <FadeReveal direction="up" delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-light mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                Vivido en cada sorbo
              </h2>
            </FadeReveal>
          </div>
          <FadeReveal direction="scale" delay={0.15} amount={0.05}>
            <MomentsGallery />
          </FadeReveal>
        </ScrollZoomSection>

        <CoffeeDivider />

        {/* ────────────────────────────────────────────────
         *  3. MENÚ — superficie semi-opaca sobre el fondo vivo
         * ──────────────────────────────────────────────── */}
        <ScrollZoomSection className="relative py-16 overflow-hidden">
          {/*
           * bg semi-opaco: deja ver LEVEMENTE las ondas del fondo.
           */}
          <div className="absolute inset-0"
            style={{ background: `rgba(28, 18, 8, 0.75)`, backdropFilter: 'blur(1px)' }} />

          <div className="absolute top-0 left-0 w-full h-px pointer-events-none"
            style={{ background: `linear-gradient(to right, transparent, ${C.amber}45, transparent)` }} />
          <div className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
            style={{ background: `linear-gradient(to right, transparent, ${C.amber}20, transparent)` }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <SectionLabel>Nuestra Carta</SectionLabel>
              <FadeReveal direction="up" delay={0.1}>
                <h2 className="text-4xl md:text-5xl font-light mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                  Explora el menú
                </h2>
              </FadeReveal>
              <FadeReveal direction="up" delay={0.2}>
                <p className="text-sm tracking-wide max-w-md mx-auto font-light"
                  style={{ color: `${C.cream}50` }}>
                  Cada categoría, una invitación a descubrir algo nuevo.
                </p>
              </FadeReveal>
            </div>
            <FadeReveal direction="scale" delay={0.1} amount={0.05}>
              <CategoryCard />
            </FadeReveal>
          </div>
        </ScrollZoomSection>

        {/* Bleeding Menú → Promociones */}
        <div className="w-full pointer-events-none"
          style={{ height: '5vh', background: `linear-gradient(to bottom, rgba(28,18,8,0.75), transparent)` }} />

        {/* ────────────────────────────────────────────────
         *  4. PROMOCIONES — fondo transparente, ondas visibles
         * ──────────────────────────────────────────────── */}
        <ScrollZoomSection className="relative py-16">
          <div className="text-center mb-8 px-4">
            <SectionLabel>Ofertas</SectionLabel>
            <FadeReveal direction="up" delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-light mb-3"
                style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                Promociones del día
              </h2>
            </FadeReveal>
          </div>
          <FadeReveal direction="up" delay={0.15} amount={0.05}>
            <PromotionsCarousel />
          </FadeReveal>
        </ScrollZoomSection>

        <CoffeeDivider />

        {/* ────────────────────────────────────────────────
         *  5. NEWSLETTER
         * ──────────────────────────────────────────────── */}
        <ScrollZoomSection className="relative pb-32 px-4">
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <SectionLabel>Únete</SectionLabel>
            <FadeReveal direction="up" delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-light mb-8"
                style={{ fontFamily: "'Playfair Display', serif", color: C.cream }}>
                Forma parte del equipo
              </h2>
            </FadeReveal>
            <FadeReveal direction="scale" delay={0.2} amount={0.1}>
              <Newsletter />
            </FadeReveal>
          </div>
        </ScrollZoomSection>

      </main>

      {/* Bleeding → Footer */}
      <div className="w-full h-24 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${C.tealDark})` }} />

      <Footer />
    </div>
  );
}