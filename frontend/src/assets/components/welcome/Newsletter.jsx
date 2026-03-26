// ═══════════════════════════════════════════════════════════════════════════
// Newsletter.jsx — Paleta oscura cálida
// ═══════════════════════════════════════════════════════════════════════════
import { useState as useStateN, useRef as useRefN } from "react";
import { Briefcase, Upload, FileText, ArrowRight as ArrowRightN } from "lucide-react";
import { motion as motionN } from "framer-motion";
 
export function Newsletter() {
  const [file, setFile] = useStateN(null);
  const fileInputRef = useRefN(null);
  const handleFileChange = e => { if(e.target.files?.[0]) setFile(e.target.files[0]); };
 
  return (
    <section className="w-full py-8 px-4 flex justify-center">
      <motionN.div
        initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} transition={{ duration:0.6 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl"
        style={{ background:'rgba(34,22,8,0.8)', backdropFilter:'blur(16px)',
          WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(200,135,78,0.2)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}
      >
        {/* Orbe decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(200,135,78,0.08) 0%, transparent 70%)', filter:'blur(40px)', transform:'translate(30%,-30%)' }} />
 
        <div className="grid md:grid-cols-12">
          {/* Columna izquierda */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center" style={{ borderRight:'1px solid rgba(200,135,78,0.1)' }}>
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase"
                style={{ background:'rgba(200,135,78,0.15)', border:'1px solid rgba(200,135,78,0.25)', color:'#C8874E' }}>
                <Briefcase className="w-3 h-3" /> Talento Humano
              </div>
 
              <h2 className="text-3xl md:text-4xl font-light leading-tight"
                style={{ fontFamily:"'Playfair Display',serif", color:'#F5F0E8' }}>
                Únete a <br/>
                <span style={{ color:'#C8874E' }}>La Bourboneria</span>
              </h2>
 
              <p className="text-lg font-light leading-relaxed" style={{ color:'rgba(245,240,232,0.55)' }}>
                Buscamos gente con la misma energía que nuestro café. Si te apasiona la excelencia, este es tu lugar.
              </p>
 
              <div className="space-y-4">
                {[
                  { n:'1', text:'Sube tu CV en formato PDF o Word.', solid:true },
                  { n:'2', text:<>Revisamos tu perfil en <span style={{color:'#C8874E',fontWeight:600}}>24 hrs</span>.</>, solid:false },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={s.solid
                        ? { background:'linear-gradient(135deg,#C8874E,#E9C46A)', color:'white' }
                        : { background:'transparent', border:'1px solid rgba(200,135,78,0.35)', color:'#C8874E' }}>
                      {s.n}
                    </div>
                    <p className="text-sm" style={{ color:'rgba(245,240,232,0.65)' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Columna derecha */}
          <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-lg font-light" style={{ fontFamily:"'Playfair Display',serif", color:'#F5F0E8' }}>
                Sube tu currículum
              </h3>
              <p className="text-xs mt-1 font-mono" style={{ color:'rgba(245,240,232,0.3)' }}>Únete al equipo</p>
            </div>
 
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
 
            <div onClick={() => fileInputRef.current.click()}
              className="group relative border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-5"
              style={{ borderWidth:'1.5px', borderStyle:'dashed',
                borderColor: file ? '#C8874E' : 'rgba(245,240,232,0.12)',
                background: file ? 'rgba(200,135,78,0.1)' : 'transparent' }}
              onMouseEnter={e=>{ if(!file) e.currentTarget.style.borderColor='rgba(200,135,78,0.4)'; }}
              onMouseLeave={e=>{ if(!file) e.currentTarget.style.borderColor='rgba(245,240,232,0.12)'; }}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background:'rgba(200,135,78,0.2)', border:'1px solid rgba(200,135,78,0.3)' }}>
                    <FileText className="w-6 h-6" style={{ color:'#C8874E' }} />
                  </div>
                  <span className="font-medium text-sm truncate max-w-[180px]" style={{ color:'#F5F0E8' }}>{file.name}</span>
                  <span className="text-xs font-mono" style={{ color:'#C8874E' }}>¡Listo para enviar!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background:'rgba(245,240,232,0.04)', border:'1px solid rgba(245,240,232,0.08)', color:'rgba(200,135,78,0.7)' }}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium" style={{ color:'rgba(245,240,232,0.4)' }}>Haz clic para explorar</span>
                </div>
              )}
            </div>
 
            <button
              disabled={!file}
              className="w-full h-12 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all group/btn"
              style={file
                ? { background:'linear-gradient(135deg,#C8874E,#E9C46A)', color:'white', boxShadow:'0 0 20px rgba(200,135,78,0.25)' }
                : { background:'rgba(245,240,232,0.04)', color:'rgba(245,240,232,0.2)', border:'1px solid rgba(245,240,232,0.06)', cursor:'not-allowed' }}
            >
              {file ? (
                <><span>Enviar Postulación</span><ArrowRightN className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
              ) : 'Selecciona un archivo'}
            </button>
          </div>
        </div>
      </motionN.div>
    </section>
  );
}