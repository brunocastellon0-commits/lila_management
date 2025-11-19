import React from 'react';
import { Users, ShoppingBag, DollarSign, MapPin, Sparkles, Bell, TrendingUp, Package, LayoutDashboard, Utensils, Megaphone } from "lucide-react";

// --- STUBS DE REACT-ROUTER-DOM (NECESARIOS PARA QUE EL ARCHIVO SEA EJECUTABLE EN ENTORNO ÚNICO) ---
// En tu entorno real (pagina_principal.jsx), estos vendrán de 'react-router-dom'.
// Aquí solo simulamos los hooks y componentes necesarios:
const Link = ({ to, className, children }) => <a href={to} className={className}>{children}</a>;
const useLocation = () => ({ pathname: window.location.pathname || '/dashboard' });
// ---------------------------------------------------------------------------------------------------


// --- SHADCN UI STUBS ---
const Card = ({ className, children }) => (
    <div className={`bg-white rounded-xl shadow-sm ${className || ''}`}>
        {children}
    </div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-2">{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-xl font-semibold ${className || ''}`}>{children}</h3>;
const CardContent = ({ className, children }) => <div className={`p-6 pt-4 ${className || ''}`}>{children}</div>;
const Badge = ({ className, children }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className} bg-gray-100 text-gray-800`}>
        {children}
    </span>
);
const Button = ({ children, className, ...props }) => (
    <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${className}`} {...props}>
        {children}
    </button>
);
const Avatar = ({ className, children }) => (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarImage = ({ src, alt, onError }) => <img src={src} alt={alt} onError={onError} className="aspect-square h-full w-full object-cover" />;
const AvatarFallback = ({ className, children }) => <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>;


// --- 1. DashboardHeader Component ---
// Este componente se mantiene igual, ya que no necesita usar Link/useLocation
export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo y nombre del sistema */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-lg">LM</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base leading-snug">Lila Management</h1>
            <p className="text-gray-500 text-xs leading-none">Sistema ERP</p>
          </div>
        </div>
        {/* Área derecha: notificaciones y usuario */}
        <div className="flex items-center gap-4">
          <Button className="relative hover:bg-gray-100 transition p-2 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full bg-purple-600 hover:bg-purple-600 text-white text-xs font-bold ring-2 ring-white">
              3
            </Badge>
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block"> 
              <p className="text-gray-900 text-sm leading-none">Bienvenido,</p>
              <p className="text-purple-600 text-sm font-medium leading-none mt-1">Carlos Méndez</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-purple-300 transition-shadow hover:shadow-md">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                alt="Avatar de usuario" 
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/A78BFA/ffffff?text=CM" }}
              />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">CM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}


// --- 2. DashboardSidebar Component (MODIFICADO PARA USAR Link y useLocation) ---

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" }, // Rutas absolutas
  { id: "recursos-humanos", label: "Recursos Humanos", icon: <Users className="w-5 h-5" />, path: "/rh" }, // <--- RUTA 'rh'
  { id: "finanzas", label: "Finanzas", icon: <DollarSign className="w-5 h-5" />, path: "/finanzas" },
  { id: "produccion", label: "Producción", icon: <Package className="w-5 h-5" />, path: "/produccion" }, 
  { id: "servicio", label: "Servicio", icon: <Utensils className="w-5 h-5" />, path: "/servicio" }, 
  { id: "marketing", label: "Marketing", icon: <Megaphone className="w-5 h-5" />, path: "/marketing" }, 
  { id: "sucursales", label: "Sucursales", icon: <MapPin className="w-5 h-5" />, path: "/sucursales" },
];


export function DashboardSidebar() {
  const location = useLocation(); // Hook para saber la ruta actual

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto z-40 hidden lg:block">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          // Compara la ruta actual con la ruta del item (usando startsWith para capturar /rh/sub-ruta)
          const isActive = location.pathname.startsWith(item.path); 
          
          const buttonClasses = `
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm transform
            ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg shadow-purple-500/40"
                : "text-gray-700 hover:bg-white hover:text-purple-600 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
            }
          `;

          return (
            // Usamos Link para la navegación
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


// --- 3. KPICard, NewsCard, etc. (Se mantienen iguales) ---

const colorClasses = {
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  green: { bg: "bg-green-50", icon: "text-green-600" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600" },
};

export function KPICard({ title, value, IconComponent, trend, trendUp, color }) { 
  const selectedColor = colorClasses[color] || colorClasses.purple;
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
            <p className="text-gray-900 text-3xl font-bold mb-1">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm font-medium ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}>
                <span className="mr-1">{trendUp ? "↑" : "↓"}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl ${selectedColor.bg} flex items-center justify-center flex-shrink-0`}>
            {IconComponent && <IconComponent className={`w-7 h-7 ${selectedColor.icon}`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const newsItems = [
  { id: "1", title: "Nueva actualización disponible", description: "Sistema de inventario mejorado con alertas automáticas", type: "update", date: "Hace 2 horas" },
  { id: "2", title: "Recordatorio: Cierre mensual", description: "Recuerda completar el cierre contable antes del 15 de noviembre", type: "reminder", date: "Hoy" },
  { id: "3", title: "Análisis de ventas mejorado", description: "Ahora puedes exportar reportes personalizados en múltiples formatos", type: "feature", date: "Hace 1 día" },
];
export function NewsCard() {
  const getIcon = (type) => {
    switch (type) {
      case "update":
        return <Package className="w-4 h-4" />;
      case "reminder":
        return <Bell className="w-4 h-4" />;
      case "feature":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };
  const getBadgeColor = (type) => {
    switch (type) {
      case "update":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "reminder":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "feature":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };
  return (
    <Card className="border-0 shadow-lg transition-shadow duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Últimas Novedades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsItems.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col gap-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <Badge className={`h-6 px-2 py-0.5 border-0 rounded-md ${getBadgeColor(item.type)}`}>
                {getIcon(item.type)}
              </Badge>
              <p className="text-gray-900 text-sm font-medium">{item.title}</p>
            </div>
            <p className="text-gray-600 text-sm ml-8 leading-snug">{item.description}</p>
            <p className="text-gray-400 text-xs mt-0.5 ml-8">{item.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Componentes de Simulación de Páginas ---

// 1. Dashboard Principal (Contenido)
export function DashboardContent() {
    return (
        <>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            <h1 className="text-gray-900 text-3xl font-bold">Bienvenido a Lila Management</h1>
                        </div>
                        <p className="text-gray-600 text-lg">
                            El ERP que impulsa la gestión completa de tu restaurante.
                        </p>
                    </div>
                    <div className="w-full md:w-64 h-32 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 transition-transform duration-500">
                        <img 
                            src="https://images.unsplash.com/photo-1726661025397-d6877dbf2da5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWFuYWdlbWVudCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYzMDcwMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                            alt="Restaurant Management"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x128/9333ea/ffffff?text=Lila+ERP" }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Empleados Activos" value="127" IconComponent={Users} trend="8% vs. mes anterior" trendUp={true} color="purple" />
                <KPICard title="Pedidos de Hoy" value="243" IconComponent={ShoppingBag} trend="12% vs. ayer" trendUp={true} color="blue" />
                <KPICard title="Ventas del Día" value="$18,420" IconComponent={DollarSign} trend="5% vs. promedio" trendUp={true} color="green" />
                <KPICard title="Sucursales Operativas" value="8" IconComponent={MapPin} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-purple-600 to-violet-700 text-white h-full">
                    <CardContent className="p-6 md:p-8 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-white mb-4 text-2xl font-semibold">¿Qué es Lila Management?</h2>
                            <p className="text-purple-100 text-lg leading-relaxed mb-6">
                                Lila Management es un ERP diseñado para optimizar la operación de restaurantes. 
                                Administra recursos humanos, finanzas, producción, servicio al cliente, marketing 
                                y múltiples sucursales desde una sola plataforma.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white/80 text-sm">Control Total</p>
                                <p className="text-white text-xl font-bold">100%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white/80 text-sm">Módulos</p>
                                <p className="text-white text-xl font-bold">6</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white/80 text-sm">Uptime</p>
                                <p className="text-white text-xl font-bold">99.9%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <NewsCard />
            </div>
        </>
    );
}

// 2. Componente de Layout de Dashboard (Shell: Header + Sidebar + Children)
export function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-violet-50/40 font-sans">
            <DashboardHeader />
            
            <div className="flex pt-16">
                <DashboardSidebar />
                
                <main className="flex-1 p-4 lg:p-8 transition-all duration-300 lg:ml-64">
                    {children}
                </main>
            </div>
        </div>
    );
}

// 3. Página Simulada de Recursos Humanos (RH)
export function RhPage() {
    return (
        <Card className="p-8 h-96 flex items-center justify-center border-0 shadow-lg">
            <h1 className="text-3xl font-bold text-purple-700">Módulo: Recursos Humanos (RH)</h1>
        </Card>
    );
}


// --- 5. App Component (Punto de entrada para el Router) ---

// Este componente ahora es el que importará tu Router en pagina_principal.jsx
export default function App() {
    // Retornamos el Layout con el contenido predeterminado,
    // asumiendo que este 'App.jsx' será mapeado a una ruta en el Router principal.
    return (
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    );
}