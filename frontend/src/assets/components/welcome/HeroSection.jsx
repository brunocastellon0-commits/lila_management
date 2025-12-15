import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Coffee, Calendar } from "lucide-react";
import { Button } from "../ui/button"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const backgroundImages = [
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1920&auto=format&fit=crop",
  "https://scontent.cdninstagram.com/v/t51.75761-15/476314356_18053788043487990_7431928703067722220_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=MzU2MDcyODQzMjk1ODk3MzM1OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=Uo0wzUmR5O8Q7kNvwEFY-Cy&_nc_oc=AdnjMkU13RaeGM533IGIm2opOvL53798bglYpwRtKIP0zudV42HBdalS8NmEWcD0NGw&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=eORfIbt1HTLqgyhAkfCECg&oh=00_AfkjoSFwISl3Dlh0IoW_SKbXfwDZC3qU9cUya4_onuhUGg&oe=694221A5",
  "https://scontent.cdninstagram.com/v/t51.75761-15/474640407_18052422794487990_9186530544464049180_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=MzU1MTI0NjQ4MTgyODI1NDM5Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTc5OS5zZHIuQzMifQ%3D%3D&_nc_ohc=zOnDiOHw88QQ7kNvwGNVcOO&_nc_oc=AdkjmV2Z_-2BHFemJJbSUfEjh1jgEbjB_j8_Uke1WV50uXjFVc0Bb_eVc727ZyGHn_k&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=eORfIbt1HTLqgyhAkfCECg&oh=00_AflOmw9s6w5AwAzZzvCpUk0U2H0yjl_vJKRoL_Ry1GqOaA&oe=69421399"
];

export function HeroSection() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    // CAMBIO: Fallback background ajustado al negro mate de la web
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-[#0c0e12]">
      
      {/* 1. SLIDER DE FONDO */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImage}
            src={backgroundImages[currentImage]}
            alt="Ambiente La Bourboneria"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full object-cover opacity-80" // Bajamos un poco la opacidad para que el negro de fondo ayude
          />
        </AnimatePresence>
        
        {/* CAPA DE DISEÑO OSCURO */}
        
        {/* A. Filtro de Marca: Tinte verde petróleo muy sutil */}
        <div className="absolute inset-0 bg-[#1B4F55]/20 mix-blend-multiply" /> 
        
        {/* B. Viñeta Radial: Oscurece los bordes para centrar la atención */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

        {/* C. FADE TO BLACK (CRÍTICO): Este degradado conecta el Hero con el resto de la web */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0c0e12] to-transparent" />
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="absolute inset-0 container mx-auto px-6 pb-20 pt-32 flex flex-col justify-end md:justify-center z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl pointer-events-auto"
        >
          {/* Tarjeta Glass Dark: Más oscura y transparente para resaltar sobre negro */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            
            {/* Brillo decorativo cyan al hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#2A9D8F]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#2A9D8F] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(42,157,143,0.4)]">
                <MapPin className="w-3 h-3" /> Cochabamba
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                <Coffee className="w-3 h-3" /> Specialty Coffee
              </span>
            </div>

            {/* TÍTULO HERO */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] text-white mb-6 font-['Outfit'] tracking-tight drop-shadow-2xl">
              Siente la <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A9D8F] via-[#4FD1C5] to-white animate-gradient-x">
                Experiencia.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg font-light border-l-4 border-[#2A9D8F] pl-6">
              Más que café, somos cultura urbana. <br/>
              <span className="text-white font-medium">Arte, sabor y comunidad</span> en el corazón de la ciudad.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/menu")}
                className="bg-[#2A9D8F] hover:bg-[#238276] text-white font-bold rounded-full h-14 px-10 text-lg shadow-[0_0_20px_rgba(42,157,143,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(42,157,143,0.5)]"
              >
                Ver Menú
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/eventos")}
                className="bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-[#1B4F55] font-bold rounded-full h-14 px-10 text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2 hover:border-white"
              >
                <Calendar className="w-5 h-5" />
                Eventos
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. INDICADORES LATERALES */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-20">
         {/* Barra de progreso */}
         <div className="w-[2px] h-32 bg-white/10 rounded-full relative overflow-hidden">
            <motion.div 
                animate={{ top: `${currentImage * 33}%` }}
                className="absolute w-full h-1/3 bg-[#2A9D8F] rounded-full transition-all duration-500 box-shadow-[0_0_10px_#2A9D8F]"
            />
         </div>
         
         <div className="flex flex-col gap-6">
            {['IG', 'FB', 'TK'].map((social, i) => (
                <a key={i} href="#" className="text-white/30 hover:text-[#2A9D8F] font-bold text-xs tracking-widest transition-colors hover:scale-110 duration-300">
                    {social}
                </a>
            ))}
         </div>
      </div>
    </section>
  );
}