/**
 * VideoScrollSection.jsx — Efecto Apple con tu video de café
 *
 * Cómo funciona:
 * - La sección tiene height: 300vh (3x la pantalla)
 * - El video queda sticky (pegado) mientras el usuario scrollea
 * - El scroll controla el currentTime del video frame a frame
 * - Textos aparecen/desaparecen según el progreso del scroll
 * - Al terminar el scroll, el video queda en el último frame
 *
 * INSTALACIÓN del video:
 * Copia tu MP4 a: public/videos/cafe-scroll.mp4
 * (la carpeta public/ está en la raíz de tu proyecto, al mismo nivel que src/)
 *
 * USO en welcome.jsx:
 *   import { VideoScrollSection } from '../assets/components/welcome/VideoScrollSection';
 *   // Colócalo entre HeroSection y MomentsGallery
 *   <VideoScrollSection />
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// ─── TEXTOS QUE APARECEN DURANTE EL SCROLL ───────────────────────────────────
// Cada item define en qué % del scroll aparece y desaparece
const SCROLL_COPY = [
  {
    id: 1,
    // Aparece 0-28% del scroll
    showAt:  0.02,
    hideAt:  0.28,
    label:   '01 / 04',
    title:   'El arte del café',
    subtitle: 'Cada grano, una historia.',
    align:   'left',
  },
  {
    id: 2,
    showAt:  0.28,
    hideAt:  0.52,
    label:   '02 / 04',
    title:   'Origen de especialidad',
    subtitle: 'Altura, suelo y microclima.',
    align:   'right',
  },
  {
    id: 3,
    showAt:  0.52,
    hideAt:  0.76,
    label:   '03 / 04',
    title:   'Tostado artesanal',
    subtitle: 'Punto exacto. Sin compromisos.',
    align:   'left',
  },
  {
    id: 4,
    showAt:  0.76,
    hideAt:  0.98,
    label:   '04 / 04',
    title:   'En tu taza, hoy',
    subtitle: 'La Bourboneria · Cochabamba',
    align:   'center',
  },
];

// ─── INDICADOR DE PROGRESO (puntos) ──────────────────────────────────────────
function ProgressDots({ progress }) {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
      {SCROLL_COPY.map((item, i) => {
        const isActive = progress >= item.showAt && progress < item.hideAt;
        const isPast   = progress >= item.hideAt;
        return (
          <div
            key={item.id}
            className="transition-all duration-500"
            style={{
              width:  isActive ? 8 : 4,
              height: isActive ? 8 : 4,
              borderRadius: '50%',
              background: isActive
                ? '#C8874E'
                : isPast
                  ? 'rgba(200,135,78,0.4)'
                  : 'rgba(245,240,232,0.15)',
              boxShadow: isActive ? '0 0 8px rgba(200,135,78,0.6)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── BARRA DE PROGRESO INFERIOR ───────────────────────────────────────────────
function ProgressBar({ progress }) {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      style={{ width: 120 }}
    >
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 2, background: 'rgba(245,240,232,0.1)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(to right, #C8874E, #E9C46A)',
          }}
        />
      </div>
      <p
        className="text-center mt-2 font-mono"
        style={{ fontSize: 9, color: 'rgba(245,240,232,0.3)', letterSpacing: '0.2em' }}
      >
        {Math.round(progress * 100)}%
      </p>
    </div>
  );
}

// ─── OVERLAY DE TEXTO ─────────────────────────────────────────────────────────
function TextOverlay({ item, progress }) {
  const isVisible = progress >= item.showAt && progress < item.hideAt;

  // Calcular opacidad: fade in al entrar, fade out al salir
  let opacity = 0;
  const fadeRange = 0.04; // 4% del scroll para fade in/out
  if (isVisible) {
    const enterProgress = (progress - item.showAt) / fadeRange;
    const exitProgress  = (item.hideAt - progress) / fadeRange;
    opacity = Math.min(1, Math.min(enterProgress, exitProgress));
  }

  const alignClass = {
    left:   'left-8 md:left-16 items-start text-left',
    right:  'right-8 md:right-16 items-end text-right',
    center: 'left-1/2 -translate-x-1/2 items-center text-center',
  }[item.align];

  const translateY = isVisible ? 0 : progress < item.showAt ? 20 : -20;

  return (
    <div
      className={`absolute bottom-20 flex flex-col gap-2 z-20 ${alignClass}`}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        maxWidth: 380,
        pointerEvents: 'none',
      }}
    >
      {/* Número de paso */}
      <span
        className="font-mono"
        style={{ fontSize: 10, letterSpacing: '0.25em', color: '#C8874E' }}
      >
        {item.label}
      </span>

      {/* Línea decorativa */}
      <div
        style={{
          height: 1,
          width: 40,
          background: 'linear-gradient(to right, #C8874E, transparent)',
          alignSelf: item.align === 'right' ? 'flex-end' : item.align === 'center' ? 'center' : 'flex-start',
        }}
      />

      {/* Título */}
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontWeight: 400,
          color: '#F5F0E8',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {item.title}
      </h2>

      {/* Subtítulo */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 300,
          color: 'rgba(245,240,232,0.55)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {item.subtitle}
      </p>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function VideoScrollSection() {
  const sectionRef  = useRef(null);
  const videoRef    = useRef(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(8); // fallback 8s

  // ── Inicializar video ─────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setVideoDuration(video.duration);
      setVideoReady(true);
      // Pausar en frame 0 — el scroll controla la reproducción
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener('loadedmetadata', onLoaded);
    // Si ya está cargado
    if (video.readyState >= 1) onLoaded();

    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  // ── Scroll → video scrubbing ──────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section || !video) return;

    const onScroll = () => {
      const rect       = section.getBoundingClientRect();
      const sectionH   = section.offsetHeight - window.innerHeight;
      const scrolled   = -rect.top;
      const prog       = Math.max(0, Math.min(1, scrolled / sectionH));

      setProgress(prog);

      // Controla el tiempo del video según el scroll
      if (videoReady) {
        const targetTime = prog * videoDuration;
        // Solo actualizar si la diferencia es significativa (evita jitter)
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
          video.currentTime = targetTime;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check inicial
    return () => window.removeEventListener('scroll', onScroll);
  }, [videoReady, videoDuration]);

  return (
    /*
     * height: 300vh = la sección ocupa 3 veces la pantalla.
     * Mientras el usuario scrollea esas 3 pantallas, el video avanza.
     * Ajusta a 250vh o 400vh según cuánto quieras que dure la experiencia.
     */
    <section
      ref={sectionRef}
      style={{ height: '300vh', position: 'relative' }}
    >
      {/* ── STICKY CONTAINER — se queda fijo mientras scrolleas ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#1A1008',
        }}
      >

        {/* ── VIDEO ── */}
        <video
          ref={videoRef}
          src="/videos/cafe-scroll.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // Opacity aumenta con el scroll — aparece gradualmente
            opacity: 0.55 + progress * 0.35,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* ── OVERLAYS DE GRADIENTE ── integración con el fondo espresso */}
        {/* Gradiente superior — conecta con el hero */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '25%',
            background: 'linear-gradient(to bottom, #1A1008, transparent)',
            pointerEvents: 'none', zIndex: 10,
          }}
        />
        {/* Gradiente inferior — conecta con la galería */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', height: '25%',
            background: 'linear-gradient(to top, #1A1008, transparent)',
            pointerEvents: 'none', zIndex: 10,
          }}
        />
        {/* Viñeta lateral sutil */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(26,16,8,0.6) 100%)',
            pointerEvents: 'none', zIndex: 10,
          }}
        />
        {/* Overlay de color de marca — tinte espresso sobre el video */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,16,8,0.25)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none', zIndex: 10,
          }}
        />

        {/* ── TEXTOS DE SCROLL ── */}
        {SCROLL_COPY.map(item => (
          <TextOverlay key={item.id} item={item} progress={progress} />
        ))}

        {/* ── INDICADORES ── */}
        <ProgressDots progress={progress} />
        <ProgressBar  progress={progress} />

        {/* ── HINT INICIAL (desaparece al scrollear) ── */}
        <div
          style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            opacity: Math.max(0, 1 - progress * 8), // Desaparece rápido
            transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 20,
          }}
        >
          {/* Grano de café animado */}
          <div
            style={{
              width: 24, height: 36, borderRadius: '50%',
              border: '1px solid rgba(200,135,78,0.5)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
                animation: 'coffee-drop 1.8s ease-in-out infinite',
              }}
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <ellipse cx="5" cy="7" rx="4" ry="5.5" fill="#C8874E" fillOpacity="0.85"/>
                <path d="M5 1.5 C5 4.5, 5 9.5, 5 12.5" stroke="#1A1008" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(200,135,78,0.6)',
            fontFamily: "'DM Mono', monospace", textTransform: 'uppercase' }}>
            scroll
          </span>
        </div>

      </div>

      {/* Keyframe del grano de café */}
      <style>{`
        @keyframes coffee-drop {
          0%   { transform: translateX(-50%) translateY(0); opacity: 1; }
          80%  { transform: translateX(-50%) translateY(16px); opacity: 0.7; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

export default VideoScrollSection;