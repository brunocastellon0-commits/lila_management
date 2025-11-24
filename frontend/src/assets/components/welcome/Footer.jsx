import { Heart, Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    // CAMBIO: Fondo sólido con el color principal de la marca (Deep Teal)
    // Esto crea un bloque de cierre fuerte y elegante.
    <footer className="bg-[#1B4F55] text-white font-['Inter'] border-t border-[#2A9D8F]/30 relative z-10">
      
      {/* Decoración superior sutil (línea de luz neón) */}
      <div className="w-full h-1 bg-gradient-to-r from-[#1B4F55] via-[#2A9D8F] to-[#1B4F55]" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* 1. Marca e Identidad */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              {/* Logo simulado con los colores de la marca */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-[#2A9D8F] shadow-lg shadow-black/20">
                 {/* Usamos el corazón como símbolo de "Pasión por el café" */}
                <Heart className="w-6 h-6 text-[#1B4F55] fill-[#1B4F55]" />
              </div>
              <div>
                <span className="text-2xl font-bold font-['Outfit'] tracking-tight block leading-none">
                  La Bourboneria
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#2A9D8F] font-bold">
                  Cafés que van contigo
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-200 mb-6 leading-relaxed font-light">
              El primer laboratorio de café de especialidad en Cochabamba. 
              Donde el arte urbano se encuentra con la taza perfecta.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-[#2A9D8F] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-[#2A9D8F] hover:scale-110 group shadow-sm"
                >
                  <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Enlaces Rápidos */}
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-[#2A9D8F] rounded-full shadow-[0_0_10px_#2A9D8F]"></span>
              Explorar
            </h3>
            <ul className="space-y-3">
              {['Nuestra Historia', 'Menú de Especialidad', 'Tienda de Grano', 'Ubicaciones', 'Trabaja con nosotros'].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-[#2A9D8F] hover:translate-x-2 transition-all duration-300 flex items-center gap-2"
                  >
                    › {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Productos / Servicios */}
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-[#2A9D8F] rounded-full shadow-[0_0_10px_#2A9D8F]"></span>
              Experiencia
            </h3>
            <ul className="space-y-3">
              {['Métodos de Extracción', 'Brunch & Bakery', 'Cata de Café', 'Eventos Privados', 'Barista Academy'].map((service, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-[#2A9D8F] hover:translate-x-2 transition-all duration-300 flex items-center gap-2"
                  >
                      › {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contacto Cochabamba */}
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-[#2A9D8F] rounded-full shadow-[0_0_10px_#2A9D8F]"></span>
              Visítanos
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#2A9D8F] transition-colors shadow-inner">
                    <MapPin className="w-5 h-5 text-[#2A9D8F] group-hover:text-white flex-shrink-0" />
                </div>
                <span className="text-sm text-gray-300 leading-tight group-hover:text-white transition-colors">
                  Calle Potosí 1234, Zona Recoleta<br/>
                  Cochabamba, Bolivia
                </span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#2A9D8F] transition-colors shadow-inner">
                    <Phone className="w-5 h-5 text-[#2A9D8F] group-hover:text-white" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">+591 4 445-6789</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#2A9D8F] transition-colors shadow-inner">
                    <Mail className="w-5 h-5 text-[#2A9D8F] group-hover:text-white" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">hola@labourboneria.bo</span>
              </li>
            </ul>
            
            {/* Widget de Horario */}
            <div className="mt-6 p-4 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20 backdrop-blur-sm hover:bg-[#2A9D8F]/20 transition-colors">
               <div className="flex items-center gap-2 mb-2 text-[#2A9D8F]">
                   <Clock className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-wider">Horario de Atención</span>
               </div>
              <p className="text-xs text-gray-300 space-y-1">
                <span className="flex justify-between"><span>Lun - Sáb:</span> <span className="text-white font-medium">07:30 - 22:00</span></span>
                <span className="flex justify-between"><span>Domingos:</span> <span className="text-white font-medium">08:00 - 21:00</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom / Copyright */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm text-gray-400">
              © 2025 <span className="text-white font-semibold">La Bourboneria</span>. Hecho con cafeína en Cochabamba.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              {['Aviso Legal', 'Privacidad', 'Libro de Reclamaciones'].map((text, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-xs text-gray-400 hover:text-[#2A9D8F] transition-colors uppercase tracking-wide font-medium"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}