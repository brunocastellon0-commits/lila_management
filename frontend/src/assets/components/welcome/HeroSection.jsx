/**
 * HeroSection.jsx — Paleta oscura cálida
 * bg fallback: #1A1008 (espresso)
 * acento: #C8874E (ámbar) + #E9C46A (dorado)
 * tinte del overlay: #2C1E0E en lugar de #1C4447
 */
import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Coffee, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const backgroundImages = [
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1920&auto=format&fit=crop",
];

export function HeroSection() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentImage(p => (p + 1) % backgroundImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden" style={{ background: '#1A1008' }}>

      {/* ── SLIDER ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImage}
            src={backgroundImages[currentImage]}
            alt="La Bourboneria"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="w-full h-full object-cover"
            style={{ opacity: 0.75 }}
          />
        </AnimatePresence>

        {/* Tinte espresso cálido — reemplaza el tinte teal frío */}
        <div className="absolute inset-0" style={{ background: 'rgba(26,16,8,0.35)', mixBlendMode: 'multiply' }} />
        {/* Viñeta lateral */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,16,8,0.85) 0%, transparent 55%, rgba(26,16,8,0.5) 100%)' }} />
        {/* Fade inferior — conecta con el fondo de la página */}
        <div className="absolute bottom-0 left-0 w-full h-40" style={{ background: 'linear-gradient(to top, #1A1008, transparent)' }} />
      </div>

      {/* ── CONTENIDO ── */}
      <div className="absolute inset-0 container mx-auto px-6 pb-20 pt-32 flex flex-col justify-end md:justify-center z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="max-w-3xl pointer-events-auto"
        >
          {/* Card glass — madera quemada translúcida */}
          <div
            className="p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden group"
            style={{
              background: 'rgba(34,22,8,0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(200,135,78,0.18)',
            }}
          >
            {/* Shimmer en hover */}
            <div
              className="absolute top-0 left-0 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, rgba(200,135,78,0.07), transparent)' }}
            />

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span
                className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full"
                style={{ background: 'rgba(200,135,78,0.2)', border: '1px solid rgba(200,135,78,0.35)', color: '#C8874E' }}
              >
                <MapPin className="w-3 h-3" /> Cochabamba
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,240,232,0.7)' }}
              >
                <Coffee className="w-3 h-3" /> Specialty Coffee
              </span>
            </div>

            {/* Título */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92] mb-6 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8' }}
            >
              Siente la{' '}
              <span
                className="block"
                style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  backgroundImage: 'linear-gradient(to right, #C8874E, #E9C46A, #F5F0E8)' }}
              >
                Experiencia.
              </span>
            </h1>

            <p
              className="text-lg md:text-xl mb-10 leading-relaxed max-w-lg font-light pl-6"
              style={{ color: 'rgba(245,240,232,0.65)', borderLeft: '3px solid #C8874E' }}
            >
              Más que café, somos cultura urbana.<br/>
              <span style={{ color: '#F5F0E8', fontWeight: 500 }}>Arte, sabor y comunidad</span> en el corazón de la ciudad.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/menu")}
                className="flex items-center justify-center gap-2 h-14 px-10 text-lg font-bold rounded-full text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #C8874E, #E9C46A)', boxShadow: '0 0 24px rgba(200,135,78,0.35)' }}
              >
                Ver Menú <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/eventos")}
                className="flex items-center justify-center gap-2 h-14 px-10 text-lg font-bold rounded-full transition-all"
                style={{ background: 'transparent', border: '2px solid rgba(245,240,232,0.2)', color: '#F5F0E8',
                  backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F0E8'; e.currentTarget.style.color = '#1A1008'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#F5F0E8'; }}
              >
                <Calendar className="w-5 h-5" /> Eventos
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── INDICADORES LATERALES ── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-20">
        <div className="w-[2px] h-32 rounded-full relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            animate={{ top: `${currentImage * 33}%` }}
            className="absolute w-full h-1/3 rounded-full"
            style={{ background: '#C8874E' }}
          />
        </div>
        <div className="flex flex-col gap-6">
          {['IG', 'FB', 'TK'].map((s, i) => (
            <a key={i} href="#"
              className="font-bold text-xs tracking-widest transition-all hover:scale-110 duration-300"
              style={{ color: 'rgba(245,240,232,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C8874E'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.25)'}
            >{s}</a>
          ))}
        </div>
      </div>
    </section>
  );
}