import { Users, DollarSign, Factory, Utensils, Megaphone, MapPin, LayoutDashboard } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

// Datos de la navegación con sus rutas correspondientes
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/dashboard", // Redirige al panel principal
  },
  {
    id: "recursos-humanos",
    label: "Recursos Humanos",
    icon: <Users className="w-5 h-5" />,
    path: "/rh", // Redirige al módulo de RH
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
    // Fija la barra lateral a la izquierda, debajo del header (top-16)
    // Nota: Agregué 'hidden md:block' por si quieres ocultarlo en móviles, 
    // si lo quieres siempre visible borra 'hidden md:block'.
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto z-40 hidden md:block">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          // Detecta si la ruta actual coincide con la del item
          // (Usa startsWith para que sub-rutas como /rh/empleados mantengan activo el botón RH)
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const buttonClasses = `
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
            ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg shadow-purple-500/40"
                : "text-gray-700 hover:bg-white hover:text-purple-600 hover:shadow-md"
            }
          `;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={buttonClasses.trim()}
            >
              <span className={isActive ? "text-white" : "text-purple-600"}>
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