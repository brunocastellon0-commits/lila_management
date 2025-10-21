import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative w-full bg-gradient-to-b from-white to-cyan-50 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Contenido principal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 z-10"
          >
            <div className="inline-block px-4 py-2 bg-cyan-100/60 backdrop-blur-sm rounded-full border border-cyan-200">
              <span className="text-sm text-cyan-600 font-medium">
                ✨ Gestión eficiente y centralizada
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Gestiona tu negocio{" "}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                de manera inteligente
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-lg">
              Administra empleados, proyectos y clientes en un solo lugar, con métricas en tiempo real y herramientas colaborativas.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                onClick={() => navigate("/login")}
              >
                Comenzar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>


            {/* Estadísticas */}
            <div className="flex gap-8 pt-8 border-t border-slate-200">
              <div>
                <div className="text-2xl font-bold text-teal-500">120+</div>
                <div className="text-sm text-gray-500">Empleados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-500">35</div>
                <div className="text-sm text-gray-500">Proyectos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">24/7</div>
                <div className="text-sm text-gray-500">Reportes</div>
              </div>
            </div>
          </motion.div>

          {/* Imagen / mockup visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 to-teal-200/40 rounded-3xl blur-2xl"></div>
            <div className="relative w-full h-64 md:h-80 rounded-3xl bg-white border border-cyan-100 shadow-xl flex items-center justify-center text-cyan-500 font-semibold">
              📊 Vista previa del panel (placeholder)
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-xl shadow-md border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Gestión centralizada</div>
                  <div className="text-sm text-gray-500">Todo tu equipo en un solo lugar</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl -z-0"></div>
    </section>
  );
}
