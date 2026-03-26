
// ═══════════════════════════════════════════════════════════════════════════
// Footer.jsx — Paleta oscura cálida
// ═══════════════════════════════════════════════════════════════════════════
import { Heart, Facebook, Instagram as Ig2, Twitter, MapPin, Phone, Mail, Clock as ClockF } from 'lucide-react';
 
export function Footer() {
  return (
    <footer style={{ background:'#1B4F55', color:'white', fontFamily:"'DM Sans',sans-serif" }}
      className="relative z-10">
      {/* Línea de acento ámbar arriba */}
      <div className="w-full h-[2px]" style={{ background:'linear-gradient(to right, #1B4F55, #C8874E 30%, #E9C46A 50%, #C8874E 70%, #1B4F55)' }} />
 
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
 
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background:'rgba(245,240,232,0.1)', border:'2px solid rgba(200,135,78,0.4)' }}>
                <Heart className="w-6 h-6" style={{ color:'#C8874E', fill:'#C8874E' }} />
              </div>
              <div>
                <span className="text-xl font-bold block leading-none" style={{ fontFamily:"'Playfair Display',serif" }}>
                  La Bourboneria
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color:'#C8874E' }}>
                  Cafés que van contigo
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed font-light mb-6" style={{ color:'rgba(245,240,232,0.6)' }}>
              El primer laboratorio de café de especialidad en Cochabamba. Donde el arte urbano se encuentra con la taza perfecta.
            </p>
            <div className="flex gap-3">
              {[Facebook, Ig2, Twitter].map((Icon,i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background:'rgba(245,240,232,0.08)', border:'1px solid rgba(245,240,232,0.1)' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(200,135,78,0.3)'; e.currentTarget.style.borderColor='rgba(200,135,78,0.5)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(245,240,232,0.08)'; e.currentTarget.style.borderColor='rgba(245,240,232,0.1)'; }}>
                  <Icon className="w-4 h-4" style={{ color:'rgba(245,240,232,0.6)' }} />
                </a>
              ))}
            </div>
          </div>
 
          {/* Explorar */}
          {[
            { title:'Explorar', links:['Nuestra Historia','Menú de Especialidad','Tienda de Grano','Ubicaciones','Trabaja con nosotros'] },
            { title:'Experiencia', links:['Métodos de Extracción','Brunch & Bakery','Cata de Café','Eventos Privados','Barista Academy'] },
          ].map(col => (
            <div key={col.title}>
              <h3 className="font-bold text-base mb-6 flex items-center gap-2" style={{ fontFamily:"'Playfair Display',serif" }}>
                <span className="w-6 h-0.5 rounded-full" style={{ background:'#C8874E' }} />
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((l,i) => (
                  <li key={i}>
                    <a href="#" className="text-sm flex items-center gap-1.5 transition-all duration-300 hover:translate-x-1"
                      style={{ color:'rgba(245,240,232,0.55)' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#C8874E'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(245,240,232,0.55)'}>
                      <span style={{ color:'rgba(200,135,78,0.5)' }}>›</span> {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
 
          {/* Contacto */}
          <div>
            <h3 className="font-bold text-base mb-6 flex items-center gap-2" style={{ fontFamily:"'Playfair Display',serif" }}>
              <span className="w-6 h-0.5 rounded-full" style={{ background:'#C8874E' }} /> Visítanos
            </h3>
            <ul className="space-y-4">
              {[
                { Icon:MapPin, text:<>Calle Potosí 1234, Zona Recoleta<br/>Cochabamba, Bolivia</> },
                { Icon:Phone, text:'+591 4 445-6789' },
                { Icon:Mail,  text:'hola@labourboneria.bo' },
              ].map(({Icon,text},i) => (
                <li key={i} className="flex items-start gap-3 group cursor-pointer">
                  <div className="p-2 rounded-lg transition-colors"
                    style={{ background:'rgba(245,240,232,0.06)', border:'1px solid rgba(245,240,232,0.08)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(200,135,78,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(245,240,232,0.06)'}>
                    <Icon className="w-4 h-4" style={{ color:'#C8874E' }} />
                  </div>
                  <span className="text-sm leading-snug" style={{ color:'rgba(245,240,232,0.6)' }}>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-4 rounded-xl" style={{ background:'rgba(200,135,78,0.08)', border:'1px solid rgba(200,135,78,0.18)' }}>
              <div className="flex items-center gap-2 mb-2" style={{ color:'#C8874E' }}>
                <ClockF className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Horario</span>
              </div>
              <div className="space-y-1">
                {[['Lun - Sáb:','07:30 - 22:00'],['Domingos:','08:00 - 21:00']].map(([d,h])=>(
                  <div key={d} className="flex justify-between text-xs">
                    <span style={{ color:'rgba(245,240,232,0.45)' }}>{d}</span>
                    <span className="font-medium" style={{ color:'#F5F0E8' }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
 
        <div className="pt-8" style={{ borderTop:'1px solid rgba(245,240,232,0.08)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color:'rgba(245,240,232,0.35)' }}>
              © 2025 <span style={{ color:'#F5F0E8', fontWeight:500 }}>La Bourboneria</span>. Hecho con cafeína en Cochabamba.
            </p>
            <div className="flex gap-6">
              {['Aviso Legal','Privacidad','Reclamaciones'].map(t=>(
                <a key={t} href="#" className="text-xs font-mono uppercase tracking-wide transition-colors"
                  style={{ color:'rgba(245,240,232,0.3)' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#C8874E'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(245,240,232,0.3)'}>
                  {t}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
 