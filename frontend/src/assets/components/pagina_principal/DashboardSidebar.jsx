import { Users, DollarSign, Factory, Utensils, Megaphone, MapPin, LayoutDashboard } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

// Datos de la navegación
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/dashboard", 
  },
  {
    id: "recursos-humanos",
    label: "Recursos Humanos",
    icon: <Users className="w-5 h-5" />,
    path: "/rh", 
  },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: <DollarSign className="w-5 h-5" />,
    path: "/finanzas",
  },
  {
    id: "produccion",
    label: "Producción",
    icon: <Factory className="w-5 h-5" />,
    path: "/produccion",
  },
  {
    id: "servicio",
    label: "Servicio",
    icon: <Utensils className="w-5 h-5" />,
    path: "/servicio",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <Megaphone className="w-5 h-5" />,
    path: "/marketing",
  },
  {
    id: "sucursales",
    label: "Sucursales",
    icon: <MapPin className="w-5 h-5" />,
    path: "/sucursales",
  },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    // CAMBIO: Fondo negro mate (#0c0e12) y borde sutil blanco
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#0c0e12] border-r border-white/10 overflow-y-auto z-40 hidden md:block">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          // Detecta ruta activa
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          // Clases dinámicas
          const buttonClasses = `
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border group
            ${
              isActive
                // Activo: Gradiente de marca y brillo Teal
                ? "bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white shadow-[0_0_15px_rgba(42,157,143,0.3)] border-white/10"
                // Inactivo: Texto gris, hover sutil con borde
                : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white hover:border-white/5"
            }
          `;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={buttonClasses.trim()}
            >
              {/* Icono: Blanco si activo, Teal si inactivo (pasa a blanco en hover por el group-hover) */}
              <span className={`transition-colors ${isActive ? "text-white" : "text-[#2A9D8F] group-hover:text-white"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}