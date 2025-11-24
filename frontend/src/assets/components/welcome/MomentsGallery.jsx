import { motion } from "framer-motion";
import { Play, Instagram, Maximize2, ArrowUpRight } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    type: "image",
    size: "large", // Ocupa 2 espacios (Cuadrado grande)
    src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1080",
    title: "Noches de Jazz",
    category: "Eventos",
    date: "Jueves 20:00"
  },
  {
    id: 2,
    type: "video", // Vertical alto
    size: "tall", 
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1080",
    title: "After Office",
    category: "Vibra",
    date: "Lun - Vie"
  },
  {
    id: 3,
    type: "image", // Cuadrado pequeño
    size: "small",
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1080",
    title: "Latte Art",
    category: "Café",
    date: "Barista Skills"
  },
  {
    id: 4,
    type: "image", // Cuadrado pequeño
    size: "small",
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1080",
    title: "Nuestra Barra",
    category: "Espacio",
    date: "Visítanos"
  },
];

export function MomentsGallery() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      
      {/* Elemento decorativo de fondo (Blob sutil) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2A9D8F]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- ENCABEZADO --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4F55] text-white text-xs font-bold tracking-widest uppercase">
                <Instagram className="w-3 h-3" />
                @labourboneria.bo
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#1B4F55] font-['Outfit'] leading-tight">
              Momentos que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F]">
                inspiran
              </span>
            </h2>
          </div>

          <div className="flex gap-4">
             <button className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#1B4F55]/10 rounded-full shadow-lg shadow-[#1B4F55]/5 hover:border-[#1B4F55] hover:shadow-xl transition-all duration-300">
                <div className="p-1.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full text-white">
                    <Instagram className="w-4 h-4" />
                </div>
                <span className="text-[#1B4F55] font-bold font-['Outfit'] group-hover:text-[#2A9D8F] transition-colors">
                    Síguenos en Instagram
                </span>
                <ArrowUpRight className="w-5 h-5 text-[#1B4F55]/40 group-hover:text-[#2A9D8F] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>

        {/* --- BENTO GRID (Mosaico) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[650px]">
          
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className={`
                relative group rounded-[2rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#2A9D8F]/20 transition-all duration-500
                ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${item.size === 'tall' ? 'md:col-span-1 md:row-span-2' : ''}
                ${item.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
              `}
            >
              {/* Imagen con zoom suave */}
              <img 
                src={item.src} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              
              {/* Overlay: Degradado de la marca (No negro puro) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B4F55]/90 via-[#1B4F55]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Icono de Play (Estilo Glassmorphism) */}
              {item.type === 'video' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                </div>
              )}

              {/* Información Flotante */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                 
                 {/* Categoría Badge */}
                 <div className="self-start mb-2 overflow-hidden">
                     <span className="inline-block px-3 py-1 rounded-lg bg-[#2A9D8F] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {item.category}
                     </span>
                 </div>

                 <div className="flex justify-between items-end border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <div>
                        <h3 className="text-white text-2xl font-bold font-['Outfit'] leading-none mb-1">
                           {item.title}
                        </h3>
                        <p className="text-white/70 text-sm font-medium">
                            {item.date}
                        </p>
                    </div>
                    <div className="p-2 bg-white rounded-full text-[#1B4F55] hover:bg-[#2A9D8F] hover:text-white transition-colors">
                        <Maximize2 className="w-5 h-5" />
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