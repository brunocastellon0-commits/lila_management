import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const promotions = [
  {
    id: 1,
    title: "Combo Familiar XL",
    subtitle: "Ideal para compartir",
    description: "2 Pizzas Gigantes + Bebida 2L + Garlic Knots caseros.",
    price: 85.00,
    originalPrice: 120.00,
    tag: "Ahorra 30%",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1080&q=80",
  },
  {
    id: 2,
    title: "Happy Hour 2x1",
    subtitle: "Bebidas seleccionadas",
    description: "Disfruta el doble en todos nuestros cócteles premium.",
    price: 25.00,
    originalPrice: 50.00,
    tag: "2x1 Solo Hoy",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1080&q=80",
  },
  {
    id: 3,
    title: "Burger Pack",
    subtitle: "Edición Limitada",
    description: "4 Hamburguesas Gourmet con papas rústicas y salsas.",
    price: 60.00,
    originalPrice: 85.00,
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1080&q=80",
  },
];

export function PromotionsCarousel() {
  const [activeId, setActiveId] = useState(promotions[0].id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; 
    const interval = 50;   
    
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          const currentIndex = promotions.findIndex(p => p.id === activeId);
          const nextIndex = (currentIndex + 1) % promotions.length;
          setActiveId(promotions[nextIndex].id);
          return 0;
        }
        return old + (100 / (duration / interval));
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeId]);

  const handleManualChange = (id) => {
    setActiveId(id);
    setProgress(0);
  };

  const activePromo = promotions.find((p) => p.id === activeId);

  return (
    <section className="w-full py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header de la sección alineado con tu estilo */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-cyan-100 rounded-lg text-cyan-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold tracking-wider text-cyan-600 uppercase">Ofertas Activas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Promociones del Día
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
             <Clock className="w-4 h-4 text-teal-500" /> 
             <span>Actualizado hace 5 minutos</span>
          </div>
        </div>

        {/* Card Principal - Estilo "Glass" y Bordes Suaves */}
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-xl shadow-cyan-100/20 overflow-hidden h-[550px] md:h-[450px] grid md:grid-cols-12">
          
          {/* ZONA IZQUIERDA: Imagen y Contenido (Highlight) */}
          <div className="md:col-span-7 lg:col-span-8 relative group overflow-hidden h-full bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePromo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={activePromo.image} 
                  alt={activePromo.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Degradado para asegurar lectura */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent" />
                
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 bg-teal-500/90 backdrop-blur border border-teal-400/30">
                      {activePromo.tag}
                    </span>
                    
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                      {activePromo.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg mb-6 line-clamp-2 leading-relaxed">
                      {activePromo.description}
                    </p>
                    
                    <div className="flex items-end gap-3 mb-8">
                      <span className="text-4xl font-bold text-white tracking-tight">${activePromo.price}</span>
                      <span className="text-xl text-gray-400 line-through mb-1">${activePromo.originalPrice}</span>
                    </div>

                    <Button 
                      className="h-12 px-8 rounded-xl text-white font-semibold shadow-lg shadow-teal-900/20 bg-gradient-to-r from-teal-500 to-cyan-500 hover:scale-105 transition-all border-0"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Pedir ahora
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ZONA DERECHA: Lista de Selección Estilizada */}
          <div className="md:col-span-5 lg:col-span-4 bg-white flex flex-col border-l border-cyan-50">
            {promotions.map((promo) => {
              const isActive = activeId === promo.id;
              return (
                <button
                  key={promo.id}
                  onClick={() => handleManualChange(promo.id)}
                  className={`
                    relative flex-1 flex items-center gap-4 px-6 text-left transition-all duration-300 group
                    ${isActive ? 'bg-cyan-50/50' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Indicador lateral activo (Barra Teal) */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-cyan-500" 
                    />
                  )}
                  
                  {/* Miniatura con borde condicional */}
                  <div className={`
                    w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300
                    ${isActive ? 'ring-2 ring-cyan-200 shadow-md' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}
                  `}>
                    <img src={promo.image} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 py-2">
                    <h4 className={`font-bold text-sm mb-1 truncate transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {promo.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">{promo.subtitle}</p>
                    
                    {/* Badge pequeño solo si está activo */}
                    {isActive && (
                       <div className="flex items-center gap-1 mt-1 text-teal-600 text-xs font-semibold">
                         <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                         Oferta seleccionada
                       </div>
                    )}
                  </div>

                  {isActive ? (
                    <ArrowRight className="w-5 h-5 text-teal-500" />
                  ) : (
                    <div className="w-5 h-5" /> // Espaciador
                  )}

                  {/* Barra de Progreso Sutil en la base del item */}
                  {isActive && (
                     <div className="absolute bottom-0 left-0 h-[2px] w-full bg-cyan-100/50">
                        <motion.div 
                          className="h-full bg-teal-400"
                          style={{ width: `${progress}%` }}
                        />
                     </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}