// ═══════════════════════════════════════════════════════════════════════════
// PromotionsCarousel.jsx — Paleta oscura cálida
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Clock } from "lucide-react";
 
const promotions = [
  { id:1, title:"Combo Mañanero", subtitle:"Para empezar el día", description:"Espresso doble + Croissant de mantequilla + jugo de naranja natural.", price:35, originalPrice:52, tag:"Favorito", image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80" },
  { id:2, title:"Happy Hour 2x1", subtitle:"Cócteles seleccionados", description:"Disfruta el doble en todos nuestros cócteles de autor, de 18 a 20 hrs.", price:25, originalPrice:50, tag:"2x1 Hoy", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1080&q=80" },
  { id:3, title:"Brunch del Domingo", subtitle:"Edición especial", description:"Tabla gourmet + café de método + postre de la casa para dos personas.", price:80, originalPrice:110, tag:"Best Seller", image:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1080&q=80" },
];
 
export function PromotionsCarousel() {
  const [activeId, setActiveId] = useState(promotions[0].id);
  const [progress, setProgress] = useState(0);
 
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          setActiveId(id => { const i = promotions.findIndex(p=>p.id===id); return promotions[(i+1)%promotions.length].id; });
          return 0;
        }
        return old + (100 / (5000/50));
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);
 
  const active = promotions.find(p => p.id === activeId);
 
  return (
    <section className="w-full px-4">
      <div className="container mx-auto max-w-6xl">
 
        {/* Card principal — glassmorphism madera quemada */}
        <motion.div
          initial={{ opacity:0, y:40 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:"-10%" }}
          transition={{ duration:0.8, ease:"easeOut" }}
          className="overflow-hidden rounded-2xl grid md:grid-cols-12"
          style={{ background:'rgba(34,22,8,0.85)', backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(200,135,78,0.15)',
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)', height: undefined, minHeight: 450 }}
        >
          {/* Zona izquierda — imagen */}
          <div className="md:col-span-7 lg:col-span-8 relative group overflow-hidden" style={{ minHeight:300 }}>
            <AnimatePresence mode="wait">
              <motion.div key={active.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:0.5}} className="absolute inset-0">
                <img src={active.image} alt={active.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ opacity:0.55 }} />
                <div className="absolute inset-0"
                  style={{ background:'linear-gradient(to right, rgba(26,16,8,0.95) 0%, rgba(26,16,8,0.6) 50%, transparent 100%)' }} />
 
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
                  <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold mb-4"
                      style={{ background:'rgba(200,135,78,0.25)', border:'1px solid rgba(200,135,78,0.4)', color:'#E9C46A' }}>
                      {active.tag}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-light mb-3 leading-tight"
                      style={{ fontFamily:"'Playfair Display',serif", color:'#F5F0E8' }}>
                      {active.title}
                    </h3>
                    <p className="text-base mb-6 leading-relaxed line-clamp-2" style={{ color:'rgba(245,240,232,0.55)', fontWeight:300 }}>
                      {active.description}
                    </p>
                    <div className="flex items-end gap-3 mb-8">
                      <span className="text-4xl font-bold" style={{ color:'#E9C46A' }}>${active.price}</span>
                      <span className="text-xl line-through mb-1" style={{ color:'rgba(245,240,232,0.35)' }}>${active.originalPrice}</span>
                    </div>
                    <button className="flex items-center gap-2 h-12 px-8 rounded-xl font-semibold text-white transition-all hover:scale-105"
                      style={{ background:'linear-gradient(135deg, #C8874E, #E9C46A)', boxShadow:'0 0 20px rgba(200,135,78,0.3)' }}>
                      <ShoppingBag className="w-5 h-5" /> Pedir ahora
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
 
          {/* Zona derecha — lista */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col"
            style={{ borderLeft:'1px solid rgba(200,135,78,0.1)' }}>
            {promotions.map(promo => {
              const isActive = activeId === promo.id;
              return (
                <button key={promo.id} onClick={() => { setActiveId(promo.id); setProgress(0); }}
                  className="relative flex-1 flex items-center gap-4 px-5 text-left transition-all duration-300"
                  style={{ background: isActive ? 'rgba(200,135,78,0.1)' : 'transparent' }}
                  onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='rgba(200,135,78,0.05)'; }}
                  onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
                >
                  {isActive && (
                    <motion.div layoutId="promo-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                      style={{ background:'linear-gradient(to bottom, #C8874E, #E9C46A)' }} />
                  )}
                  <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${!isActive ? 'grayscale opacity-50' : ''}`}
                    style={{ border: isActive ? '1px solid rgba(200,135,78,0.35)' : 'none' }}>
                    <img src={promo.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    <h4 className="font-medium text-sm mb-0.5 truncate"
                      style={{ color: isActive ? '#F5F0E8' : 'rgba(245,240,232,0.45)', fontFamily:"'DM Sans',sans-serif" }}>
                      {promo.title}
                    </h4>
                    <p className="text-xs truncate font-mono" style={{ color:'rgba(245,240,232,0.3)' }}>{promo.subtitle}</p>
                    {isActive && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#C8874E' }} />
                        <span className="text-xs font-mono" style={{ color:'#C8874E' }}>Oferta activa</span>
                      </div>
                    )}
                  </div>
                  {isActive && <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color:'#C8874E' }} />}
 
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-[1px] w-full" style={{ background:'rgba(200,135,78,0.1)' }}>
                      <motion.div className="h-full" style={{ width:`${progress}%`, background:'rgba(200,135,78,0.5)' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
 
        {/* Info footer */}
        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background:'rgba(34,22,8,0.6)', border:'1px solid rgba(200,135,78,0.1)' }}>
            <Clock className="w-3.5 h-3.5" style={{ color:'rgba(200,135,78,0.6)' }} />
            <span className="text-xs font-mono" style={{ color:'rgba(245,240,232,0.35)' }}>Actualizado hace 5 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
 