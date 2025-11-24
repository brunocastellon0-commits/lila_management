import { useState, useRef } from "react";
import { Briefcase, Upload, Calendar, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export function Newsletter() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    // CAMBIO 1: Fondo de sección transparente o muy oscuro para fundirse con la web
    <section className="w-full py-16 px-4 flex justify-center bg-[#0c0e12]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        // CAMBIO 2: Card principal oscura (bg-[#13161C]) en lugar de blanca
        // Borde sutil en Cyan/Teal para delimitar
        className="relative w-full max-w-5xl bg-[#13161C] rounded-[2rem] border-2 border-[#1B4F55]/30 shadow-[0_0_40px_-10px_rgba(27,79,85,0.2)] overflow-hidden"
      >
        
        <div className="grid md:grid-cols-12 gap-0">
          
          {/* --- COLUMNA IZQUIERDA --- */}
          {/* CAMBIO 3: Fondo tintado de verde oscuro en lugar de menta claro */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#1B4F55]/10">
            
            <div className="flex flex-col gap-6">
              {/* Badge: Cyan sobre fondo oscuro */}
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-[#2A9D8F]/20 text-[#2A9D8F] text-xs font-bold tracking-wider uppercase border border-[#2A9D8F]/20">
                <Briefcase className="w-3 h-3" />
                Talento Humano
              </div>

              {/* Títulos: Blanco y Cyan */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight font-['Outfit']">
                Únete a <br/>
                <span className="text-[#2A9D8F]">La Bourboneria</span>
              </h2>
            
              {/* Texto descriptivo: Gris claro para contraste */}
              <p className="text-gray-400 leading-relaxed text-lg font-medium">
                Buscamos gente con la misma energía que nuestro café. Si te apasiona la excelencia, este es tu lugar.
              </p>

              {/* Steps visuales */}
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-4">
                  {/* Paso 1: Círculo sólido Teal */}
                  <div className="w-10 h-10 rounded-full bg-[#1B4F55] flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-[#1B4F55]/50">1</div>
                  <p className="text-gray-300 text-sm">Sube tu CV en formato PDF o Word.</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Paso 2: Círculo bordeado claro */}
                  <div className="w-10 h-10 rounded-full bg-transparent border-2 border-[#2A9D8F] text-[#2A9D8F] flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-gray-300 text-sm">Nuestro equipo revisa tu perfil en <span className="font-bold text-[#2A9D8F]">24 hrs</span>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA --- */}
          {/* CAMBIO 4: Fondo oscuro sólido para el formulario */}
          <div className="md:col-span-5 bg-[#13161C] p-8 md:p-12 flex flex-col justify-center relative border-l border-white/5">
            {/* Decoración esquina */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2A9D8F]/5 rounded-bl-[4rem] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              
              <div className="text-center mb-2">
                 <h3 className="text-lg font-bold text-white">Sube tu currículum</h3>
                 <p className="text-xs text-gray-500">Únete al equipo</p>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx" 
                className="hidden" 
              />

              {/* Zona de Carga: Borders claros y efectos glow */}
              <div 
                onClick={triggerFileInput}
                className={`
                  relative border-[2px] border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group
                  ${file 
                    ? 'border-[#2A9D8F] bg-[#2A9D8F]/10' 
                    : 'border-white/10 hover:border-[#2A9D8F] hover:bg-[#2A9D8F]/5'
                  }
                `}
              >
                {file ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#2A9D8F]/20 flex items-center justify-center text-[#2A9D8F] mb-2 shadow-lg shadow-[#2A9D8F]/10">
                        <FileText className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-white text-sm truncate max-w-[180px]">
                        {file.name}
                    </span>
                    <span className="text-xs text-[#2A9D8F] font-semibold mt-1">¡Listo para enviar!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    {/* Icono Upload */}
                    <div className="w-14 h-14 bg-[#1c212c] border-2 border-white/5 rounded-full flex items-center justify-center text-[#2A9D8F] group-hover:scale-110 group-hover:border-[#2A9D8F] group-hover:text-white group-hover:bg-[#2A9D8F] transition-all duration-300 shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-400 group-hover:text-[#2A9D8F] transition-colors">Haz clic para explorar</span>
                  </div>
                )}
              </div>

              {/* BOTÓN: Cyan vibrante sobre oscuro */}
              <Button 
                className={`
                    w-full h-12 rounded-xl font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 group
                    ${file 
                        ? 'bg-[#2A9D8F] hover:bg-[#1B4F55] text-white shadow-[#2A9D8F]/30' 
                        : 'bg-[#1c212c] text-gray-600 border border-white/5 cursor-not-allowed'
                    }
                `}
                disabled={!file}
              >
                {file ? (
                    <>Enviar Postulación <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></>
                ) : (
                    'Selecciona un archivo'
                )}
              </Button>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}