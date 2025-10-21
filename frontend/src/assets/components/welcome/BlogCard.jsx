import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { motion } from "framer-motion";

export function BlogCard({ image, category, title, excerpt, date, readTime }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-border hover:border-teal-400/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Imagen */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={image || "/placeholder.jpg"}
            alt={title || "Blog"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-4 left-4 bg-white text-teal-500 border-none">
            {category}
          </Badge>
        </div>

        {/* Contenido */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-teal-500" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-teal-500" />
              <span>{readTime}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-2 line-clamp-2 text-teal-700">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{excerpt}</p>

          <button className="flex items-center gap-2 text-teal-600 font-medium group-hover:gap-3 transition-all">
            Leer más
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
