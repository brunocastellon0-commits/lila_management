import { Users, DollarSign, Factory, Utensils, Megaphone, MapPin, LayoutDashboard } from "lucide-react";

// Datos de la navegación (sin tipado TypeScript)
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    active: true, // Item activo por defecto
  },
  {
    id: "recursos-humanos",
    label: "Recursos Humanos",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: "produccion",
    label: "Producción",
    icon: <Factory className="w-5 h-5" />,
  },
  {
    id: "servicio",
    label: "Servicio",
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    id: "sucursales",
    label: "Sucursales",
    icon: <MapPin className="w-5 h-5" />,
  },
];

export function DashboardSidebar() {
  return (
    // Fija la barra lateral a la izquierda, debajo del header (top-16)
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto z-40">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.active;
          const buttonClasses = `
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
            ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg shadow-purple-500/40"
                : "text-gray-700 hover:bg-white hover:text-purple-600 hover:shadow-md"
            }
          `;

          return (
            <button
              key={item.id}
              className={buttonClasses.trim()}
            >
              <span className={isActive ? "text-white" : "text-purple-600"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}