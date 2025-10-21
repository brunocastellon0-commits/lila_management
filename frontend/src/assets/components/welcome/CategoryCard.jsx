import { motion } from "framer-motion";

export function CategoryCard({ icon: Icon, title, itemCount, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      <div className="relative bg-white rounded-3xl p-6 border border-purple-100 hover:border-purple-300 shadow-md hover:shadow-xl transition-all duration-300">
        {/* Ícono con fondo degradado */}
        <div
          className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}
        >
          {Icon && <Icon className="w-8 h-8 text-white" />}
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>

        {/* Cantidad o descripción */}
        <p className="text-sm text-gray-500">{itemCount}</p>

        {/* Brillo decorativo */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/5 to-pink-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"></div>
      </div>
    </motion.div>
  );
}
