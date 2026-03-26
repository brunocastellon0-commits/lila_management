// ═══════════════════════════════════════════════════════════════════════════
// MomentsGallery.jsx — Paleta oscura cálida
// ═══════════════════════════════════════════════════════════════════════════
import { motion } from "framer-motion";
import { Play, Instagram, Maximize2, ArrowUpRight } from "lucide-react";
 
const galleryItems = [
  { id:1, type:"image", size:"large", src:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1080", title:"Noches de Jazz", category:"Eventos", date:"Jueves 20:00" },
  { id:2, type:"video", size:"tall",  src:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1080",  title:"After Office",  category:"Vibra",   date:"Lun - Vie" },
  { id:3, type:"image", size:"small", src:"https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1080",   title:"Latte Art",    category:"Café",    date:"Barista Skills" },
  { id:4, type:"image", size:"small", src:"https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1080",  title:"Nuestra Barra",category:"Espacio", date:"Visítanos" },
];
 
export function MomentsGallery() {
  return (
    <section className="py-16 relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* Orbe decorativo */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,135,78,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
 
      <div className="container mx-auto px-4 relative z-10">
 
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase"
              style={{ background: 'rgba(200,135,78,0.15)', border: '1px solid rgba(200,135,78,0.25)', color: '#C8874E' }}>
              <Instagram className="w-3 h-3" /> @labourboneria.bo
            </div>
            <h2 className="text-4xl md:text-5xl font-light leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8' }}>
              Momentos que <br />
              <span style={{ WebkitTextFillColor:'transparent', WebkitBackgroundClip:'text', backgroundClip:'text',
                backgroundImage:'linear-gradient(to right, #C8874E, #E9C46A)' }}>
                inspiran
              </span>
            </h2>
          </div>
 
          <button
            className="group flex items-center gap-3 px-7 py-3.5 rounded-full transition-all duration-300"
            style={{ background: 'rgba(34,22,8,0.7)', border: '1px solid rgba(200,135,78,0.2)',
              backdropFilter:'blur(8px)' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(200,135,78,0.5)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(200,135,78,0.2)'}
          >
            <div className="p-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366)' }}>
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm" style={{ color: '#F5F0E8', fontFamily:"'DM Sans',sans-serif" }}>
              Síguenos en Instagram
            </span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: 'rgba(200,135,78,0.6)' }} />
          </button>
        </div>
 
        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              transition={{ delay: idx*0.12, duration:0.6 }}
              viewport={{ once:true }}
              className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500
                ${item.size==='large' ? 'md:col-span-2 md:row-span-2':''}
                ${item.size==='tall'  ? 'md:col-span-1 md:row-span-2':''}
                ${item.size==='small' ? 'md:col-span-1 md:row-span-1':''}
                ${item.size==='small' ? 'min-h-[200px]' : ''}`}
              style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}
            >
              <img src={item.src} alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" />
 
              {/* Overlay cálido — reemplaza el overlay teal frío */}
              <div className="absolute inset-0 transition-opacity duration-400"
                style={{ background:'linear-gradient(to top, rgba(44,30,14,0.92) 0%, rgba(44,30,14,0.25) 50%, transparent 100%)',
                  opacity: 0.7 }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.92'}
                onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}
              />
 
              {item.type==='video' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background:'rgba(200,135,78,0.2)', backdropFilter:'blur(8px)', border:'1px solid rgba(200,135,78,0.4)' }}>
                  <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
                </div>
              )}
 
              <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="self-start mb-2 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                  style={{ background:'rgba(200,135,78,0.25)', border:'1px solid rgba(200,135,78,0.35)', color:'#E9C46A' }}>
                  {item.category}
                </span>
                <div className="flex justify-between items-end border-t pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                  style={{ borderColor:'rgba(200,135,78,0.2)' }}>
                  <div>
                    <h3 className="text-xl font-light leading-none mb-1" style={{ fontFamily:"'Playfair Display',serif", color:'#F5F0E8' }}>
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono" style={{ color:'rgba(245,240,232,0.5)' }}>{item.date}</p>
                  </div>
                  <div className="p-2 rounded-full" style={{ background:'rgba(200,135,78,0.2)', border:'1px solid rgba(200,135,78,0.3)' }}>
                    <Maximize2 className="w-4 h-4" style={{ color:'#C8874E' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
 