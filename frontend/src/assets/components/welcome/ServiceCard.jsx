export function ServiceCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-border hover:border-teal-400/30 hover:shadow-lg transition-all duration-300">
      <div
        className={`w-14 h-14 rounded-xl ${gradient || 'bg-gradient-to-br from-teal-500 to-cyan-400'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {Icon && <Icon className="w-7 h-7 text-white" />}
      </div>
      <h3 className="font-semibold mb-2 text-teal-700">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
