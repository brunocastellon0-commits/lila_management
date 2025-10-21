import { Star, Quote } from 'lucide-react';

export function TestimonialCard({ name, role, avatar, rating, comment }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border hover:border-teal-400/30 hover:shadow-lg transition-all duration-300 h-full">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <div className="relative mb-4">
        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-teal-600/20" />
        <p className="text-gray-600 relative z-10 pl-4">{comment}</p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-teal-700">{name}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </div>
    </div>
  );
}
