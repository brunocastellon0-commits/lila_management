import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from "framer-motion";

export function ProductCard({ image, title, status, rating, members, isNew, tag }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-border hover:border-purple-600/30 hover:shadow-xl transition-all duration-300">
        {/* Imagen */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={image || "/placeholder.jpg"} // Imagen local o placeholder
            alt={title || "Producto"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <Badge className="bg-purple-600 text-white">Nuevo</Badge>}
            {tag && <Badge className="bg-pink-500 text-white">{tag}</Badge>}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">{title}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({members} miembros)</span>
          </div>

          {/* Estado y botón */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-600">{status}</span>
            <Button className="bg-purple-600 text-white hover:bg-pink-500 px-4 py-1 rounded-full">
              Acceder
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
