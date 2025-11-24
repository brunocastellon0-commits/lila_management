import { useState } from "react";
import { motion } from "framer-motion";
import { Coffee, Croissant, UtensilsCrossed, GlassWater, ArrowRight } from "lucide-react";

// DATOS ADAPTADOS A "LA BOURBONERIA"
const categories = [
  {
    id: "coffee",
    title: "Barista",
    subtitle: "Orígenes & Métodos",
    icon: Coffee,
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1080&q=80",
    // Color ajustado para modo oscuro: Teal Profundo
    color: "#1B4F55", 
    accent: "bg-[#1B4F55]" 
  },
  {
    id: "brunch",
    title: "Brunch",
    subtitle: "Cocina de Autor",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&w=1080&q=80",
    // Color madera/ámbar
    color: "#C18A5B",
    accent: "bg-[#C18A5B]"
  },
  {
    id: "bakery",
    title: "Bakery",
    subtitle: "Horneado Diario",
    icon: Croissant,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1080&q=80",
    // Cyan vibrante
    color: "#2A9D8F",
    accent: "bg-[#2A9D8F]"
  },
  {
    id: "cold",
    title: "Fríos",
    subtitle: "Mocktails & Cold Brew",
    icon: GlassWater,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1080&q=80",
    // Gris metálico oscuro
    color: "#22252A",
    accent: "bg-[#22252A]"
  },
];

export function CategoryCard() {
  const [activeId, setActiveId] = useState("coffee");

  return (
    // CAMBIO: Fondo transparente para que se vea el "Matte Black" del padre
    <section className="w-full py-20 px-4 bg-transparent relative z-10">
      
      <div className="container mx-auto max-w-6xl">
        
        {/* Header de Sección - VERSIÓN DARK MODE */}
        <div className="text-center mb-12 space-y-4">
          
          {/* Badge: Ahora usa Cyan sobre fondo oscuro para brillar */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs font-bold tracking-widest uppercase border border-[#2A9D8F]/20">
            <Coffee className="w-3 h-3" />
            Nuestra Carta
          </div>
          
          {/* Título: Blanco puro + Acento Cyan */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
            Explora nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2A9D8F] to-[#4FD1C5]">Mundos</span>
          </h2>
          
          {/* Subtítulo: Gris claro para lectura sobre negro */}
          <p className="text-gray-400 max-w-lg mx-auto font-medium text-lg">
            Desde la extracción perfecta hasta el horneado artesanal.
          </p>
        </div>

        {/* Contenedor Flex Interactivo */}
        <div className="flex flex-col md:flex-row h-[600px] md:h-[500px] w-full gap-4">
          {categories.map((category) => {
            const isActive = activeId === category.id;
            
            return (
              <motion.div
                key={category.id}
                onHoverStart={() => setActiveId(category.id)}
                onClick={() => setActiveId(category.id)}
                layout
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className={`
                  relative rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl
                  ${isActive 
                    // CAMBIO: Ring (Borde brillante) color Cyan/Teal en lugar de oscuro
                    ? 'flex-[3] md:flex-[3.5] ring-2 ring-[#2A9D8F] shadow-[#2A9D8F]/20' 
                    : 'flex-[1] opacity-80 hover:opacity-100 grayscale-[50%] hover:grayscale-0'
                  }
                `}
              >
                {/* Imagen de Fondo */}
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className={`
                      w-full h-full object-cover transition-transform duration-1000 ease-out
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `} 
                  />
                  
                  {/* Overlay Gradiente para Dark Mode */}
                  {/* Hacemos el degradado un poco más fuerte en la base para que el texto blanco se lea perfecto */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(to top, ${category.color} 10%, rgba(0,0,0,0.5) 50%, transparent 100%)`,
                        opacity: isActive ? 0.95 : 0.7
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  
                  {/* ESTADO INACTIVO */}
                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center md:items-end md:justify-center md:pb-10">
                        {/* Mobile */}
                        <div className="md:hidden flex flex-col items-center text-white/90">
                            <category.icon className="w-8 h-8 mb-2 drop-shadow-lg" />
                            <span className="text-xs font-bold uppercase tracking-widest">{category.title}</span>
                        </div>
                        
                        {/* Desktop: Texto Rotado */}
                        <div className="hidden md:block">
                             <span className="text-white/80 font-['Outfit'] font-bold text-xl tracking-[0.2em] uppercase rotate-[-90deg] whitespace-nowrap drop-shadow-md origin-bottom translate-y-8 hover:text-white transition-colors">
                                {category.title}
                             </span>
                        </div>
                    </div>
                  )}

                  {/* ESTADO ACTIVO */}
                  <div className={`transition-all duration-500 transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden md:block'}`}>
                    
                    {/* Badge interno */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-4">
                       <category.icon className="w-3 h-3" />
                       {category.title}
                    </div>

                    <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight font-['Outfit'] drop-shadow-lg">
                      {category.subtitle}
                    </h3>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ delay: 0.2 }}
                    >
                        <button className="group flex items-center gap-3 text-white font-medium hover:text-[#2A9D8F] transition-all">
                            <span className="border-b border-white/40 group-hover:border-[#2A9D8F] pb-0.5 transition-colors">Ver selección</span>
                            <div className="w-8 h-8 rounded-full bg-white text-[#1B4F55] flex items-center justify-center group-hover:bg-[#2A9D8F] group-hover:text-white transition-all duration-300">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </motion.div>
                  </div>
                  
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}