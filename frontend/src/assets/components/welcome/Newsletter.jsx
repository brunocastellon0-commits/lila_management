import { Mail, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion } from "framer-motion";

export function Newsletter() {
  return (
    <section className="relative w-full bg-gradient-to-b from-white to-cyan-50 py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white border border-cyan-100 shadow-lg rounded-3xl p-10 text-center relative z-10"
        >
          {/* Icono principal */}
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Mail className="w-8 h-8 text-cyan-600" />
          </div>

          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Suscríbete a actualizaciones de{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Lila Management
            </span>
          </h2>

          {/* Descripción */}
          <p className="text-lg text-gray-600 mb-8">
            Recibe consejos de gestión, novedades de la plataforma y mejoras directamente en tu correo.
          </p>

          {/* Formulario */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              className="bg-gray-50 border border-gray-200 px-6 py-6 rounded-full flex-1 text-gray-700 focus:ring-2 focus:ring-cyan-400"
            />
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-md hover:scale-105 transition-all duration-300 rounded-full px-8"
            >
              <Send className="w-5 h-5 mr-2" />
              Suscribirme
            </Button>
          </div>

          {/* Texto inferior */}
          <p className="text-sm text-gray-500 mt-5">
            Al suscribirte, aceptas nuestra{" "}
            <span className="text-cyan-600 font-medium cursor-pointer hover:underline">
              política de privacidad
            </span>
          </p>
        </motion.div>
      </div>

      {/* Formas decorativas suaves */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-100 rounded-full blur-3xl"></div>
    </section>
  );
}
