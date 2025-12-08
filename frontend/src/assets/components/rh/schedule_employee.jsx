import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, Users, Building2, Plus, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, Trash2, CalendarDays, X, Check, AlertCircle,
  User, Briefcase, Loader2
} from "lucide-react";

// ============================================
// 0. INFRAESTRUCTURA (Integración de tu config.js)
// ============================================

const API_BASE_URL = 'http://127.0.0.1:7000';

async function handleErrorResponse(response) {
  console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`);
  
  let errorDetail = null;
  let errorData = null;
  
  try {
    const errorText = await response.text();
    if (errorText && errorText.trim() !== '' && errorText !== 'null') {
      try {
        errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || errorData.message || errorData.error || errorText;
      } catch {
        errorDetail = errorText;
      }
    }
  } catch (parseError) {
    console.error('❌ Error leyendo respuesta de error:', parseError);
  }
  
  const statusMessages = {
    400: 'Solicitud incorrecta - verifica los datos enviados',
    401: 'No autorizado - verifica tus credenciales',
    403: 'Acceso denegado',
    404: 'Recurso no encontrado',
    409: 'Conflicto - datos duplicados o restricción violada',
    500: 'Error interno del servidor',
    502: 'Gateway no disponible',
    503: 'Servicio temporalmente no disponible'
  };
  
  const finalMessage = errorDetail || statusMessages[response.status] || `Error HTTP ${response.status}`;
  const error = new Error(finalMessage);
  error.status = response.status;
  throw error;
}

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const finalEndpoint = cleanEndpoint.endsWith('/') && cleanEndpoint !== '/' 
      ? cleanEndpoint.slice(0, -1) 
      : cleanEndpoint;
    
    const url = `${cleanBase}${finalEndpoint}`;
    console.log(`🔄 Petición a: ${url}`, options.method || 'GET');

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      redirect: 'manual'
    });

    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        const newPath = redirectUrl.replace(API_BASE_URL, '');
        return await fetchAPI(newPath, options);
      }
      throw new Error(`Redirect status ${response.status} sin header Location`);
    }

    if (!response.ok) await handleErrorResponse(response);
    if (response.status === 204) return null;

    const responseText = await response.text();
    if (!responseText || responseText.trim() === '' || responseText === 'null') {
      if (endpoint.includes('/sucursales') || endpoint.includes('/schedules') || endpoint.includes('/employees')) return [];
      return null;
    }
    
    try {
      const parsedData = JSON.parse(responseText);
      if (parsedData === null) {
         if (endpoint.includes('/sucursales') || endpoint.includes('/schedules')) return [];
         return null;
      }
      return parsedData;
    } catch { 
      throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error);
    throw error;
  }
};

const RH_PREFIX = '/rh';

// ============================================
// 1. SERVICIOS
// ============================================

const sucursalService = {
  getAllSucursales: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/sucursales?skip=${skip}&limit=${limit}`);
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.items && Array.isArray(data.items)) return data.items;
      if (data.sucursales && Array.isArray(data.sucursales)) return data.sucursales;
      return [];
    } catch (error) {
      console.error("Error en sucursalService:", error);
      return [];
    }
  },
  getSucursalById: async (id) => fetchAPI(`${RH_PREFIX}/sucursales/${id}`)
};

const employeeService = {
  getAllEmployees: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees?skip=${skip}&limit=${limit}`);
      return Array.isArray(data) ? data : (data.items || []);
    } catch (error) {
      console.error("Error en employeeService:", error);
      return [];
    }
  }
};

const employeeScheduleService = {
  getSchedulesBySucursalId: async (sucursalId) => {
    const data = await fetchAPI(`${RH_PREFIX}/schedules?sucursal_id=${sucursalId}&limit=100`);
    return Array.isArray(data) ? data : [];
  },

  createSchedule: async (scheduleData) => {
    const payload = {
      employee_id: parseInt(scheduleData.employee_id),
      sucursal_id: parseInt(scheduleData.sucursal_id),
      nombre_horario: scheduleData.nombre_horario.trim(),
      dias_semana: scheduleData.dias_semana,
      hora_inicio_patron: scheduleData.hora_inicio_patron,
      hora_fin_patron: scheduleData.hora_fin_patron,
      es_actual: true,
      descripcion: scheduleData.descripcion || "Web App"
    };
    return await fetchAPI(`${RH_PREFIX}/schedules`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteSchedule: async (id) => {
    return await fetchAPI(`${RH_PREFIX}/schedules/${id}`, { method: 'DELETE' });
  }
};

// ============================================
// 2. COMPONENTES UI (DARK MODE)
// ============================================

const Button = ({ children, variant = "primary", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 font-['Outfit']";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white hover:from-[#2A9D8F] hover:to-[#1B4F55] shadow-lg shadow-[#2A9D8F]/20 border border-white/10",
    outline: "border border-white/10 bg-transparent hover:bg-white/5 text-white hover:text-[#2A9D8F]",
    ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
    destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-lg text-xs",
    icon: "h-10 w-10",
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#13161C] rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold transition-colors ${className}`}>
    {children}
  </span>
);

const Input = ({ className = "", ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-xl border border-white/10 bg-[#0c0e12] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2A9D8F] focus-visible:border-[#2A9D8F] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
    {...props}
  />
);

const SelectNative = ({ options, value, onChange, placeholder, className = "" }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full appearance-none items-center justify-between rounded-xl border border-white/10 bg-[#0c0e12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2A9D8F] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
    >
      <option value="" disabled className="bg-[#13161C] text-gray-500">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#13161C] text-white">{opt.label}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
      <ChevronLeft className="h-4 w-4 rotate-[-90deg]" />
    </div>
  </div>
);

const Dialog = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-[#13161C] rounded-[2rem] shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/10`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#13161C] sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white font-['Outfit']">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  
  const show = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return { toast, show };
};

const ToastContainer = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
        toast.type === 'error' 
          ? 'bg-[#13161C] border-red-500/30 text-red-400' 
          : 'bg-[#13161C] border-[#2A9D8F]/30 text-[#2A9D8F]'
      }`}>
        {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
        <span className="text-sm font-medium text-white">{toast.message}</span>
      </div>
    </div>
  );
};

// ============================================
// 3. LÓGICA DE NEGOCIO Y COMPONENTES (DARK)
// ============================================

const daysOfWeek = [
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
  { id: 7, name: "Domingo", short: "Dom" },
];

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// --- Componente: Modal Detalle del Día ---
function DayDetailModal({ isOpen, onClose, date, events }) {
  if (!date) return null;

  const formatDate = (d) => {
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(d);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Detalle de Personal" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-[#2A9D8F]/10 p-4 rounded-xl border border-[#2A9D8F]/20 mb-6">
          <div className="p-2 bg-[#13161C] rounded-lg shadow-sm border border-white/10">
            <CalendarDays className="w-6 h-6 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white capitalize font-['Outfit']">{formatDate(date)}</h3>
            <p className="text-sm text-[#2A9D8F] font-medium">
              {events.length} {events.length === 1 ? 'empleado asignado' : 'empleados asignados'}
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-3">
            {events.map((event, idx) => (
              <div key={`${event.id}-${idx}`} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-[#0c0e12] shadow-lg hover:border-[#2A9D8F]/30 transition-all group">
                 <div className="w-10 h-10 rounded-full bg-[#13161C] flex items-center justify-center border border-white/10 shrink-0 group-hover:border-[#2A9D8F]/50">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-white" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-bold text-white text-sm">
                             {event.employee?.nombre} {event.employee?.apellido}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                             <Briefcase className="w-3 h-3 text-gray-500" />
                             <p className="text-xs text-gray-400 font-medium">
                                {event.employee?.puesto || "Sin puesto definido"}
                             </p>
                          </div>
                       </div>
                       <Badge className="bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/30">
                          {event.nombre_horario}
                       </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-300 bg-[#13161C] p-2 rounded-lg w-fit border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span className="font-mono font-semibold">
                        {event.hora_inicio_patron?.toString().slice(0,5)} - {event.hora_fin_patron?.toString().slice(0,5)}
                      </span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-[#0c0e12] rounded-xl border border-dashed border-white/10">
             <Users className="w-10 h-10 mb-2 opacity-20" />
             <p className="text-sm font-medium">No hay personal programado para este día.</p>
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-white/10 mt-4">
           <Button onClick={onClose} variant="outline">Cerrar</Button>
        </div>
      </div>
    </Dialog>
  );
}

// --- Componente: Calendario de Sucursal (Dark Mode) ---
function BranchCalendar({ schedules, currentYear, currentMonth, onPrevMonth, onNextMonth, onDayClick }) {
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay(); 
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, type: 'padding' });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDate = new Date(currentYear, currentMonth, i);
      const jsDay = currentDate.getDay(); 
      const isoDay = jsDay === 0 ? 7 : jsDay;

      const dailyEvents = schedules.filter(schedule => {
        let activeDays = [];
        if (Array.isArray(schedule.dias_semana)) {
          activeDays = schedule.dias_semana;
        } else if (typeof schedule.dias_semana === 'string') {
          activeDays = schedule.dias_semana.split(',').map(Number);
        }
        return activeDays.includes(isoDay);
      });

      days.push({ 
        day: i, 
        type: 'current', 
        date: currentDate,
        events: dailyEvents 
      });
    }
    return days;
  }, [currentYear, currentMonth, schedules]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#13161C]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2A9D8F]/10 rounded-lg border border-[#2A9D8F]/20">
            <CalendarIcon className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <h2 className="text-lg font-bold text-white capitalize font-['Outfit']">
            {monthNames[currentMonth]} <span className="text-gray-500 font-medium">{currentYear}</span>
          </h2>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8 rounded-lg border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-lg border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-[#0c0e12] border-b border-white/10">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="py-2.5 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-[#0c0e12]">
        {calendarDays.map((dateObj, index) => (
          <div 
            key={index} 
            onClick={() => dateObj.type === 'current' && onDayClick(dateObj)}
            className={`
              min-h-[100px] border-b border-r border-white/5 p-1.5 transition-all flex flex-col gap-1 relative group
              ${dateObj.type === 'padding' 
                ? 'bg-[#0c0e12] text-gray-700 cursor-default' 
                : 'bg-[#13161C] hover:bg-[#2A9D8F]/10 cursor-pointer'}
            `}
          >
            <div className="flex justify-between items-start px-1">
                <span className={`text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                  dateObj.type === 'current' 
                    ? 'text-gray-300 group-hover:bg-[#2A9D8F] group-hover:text-white transition-colors' 
                    : 'text-gray-700'
                }`}>
                {dateObj.day}
                </span>
                
                {dateObj.events?.length > 0 && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#2A9D8F] sm:hidden shadow-[0_0_5px_#2A9D8F]"></span>
                )}
            </div>
            
            <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
              {dateObj.events?.slice(0, 3).map((event, idx) => (
                <div 
                  key={`${event.id}-${idx}`}
                  className="text-[10px] bg-[#2A9D8F]/10 border border-[#2A9D8F]/20 text-[#2A9D8F] px-1.5 py-1 rounded-md flex items-center gap-1.5"
                  title={`${event.employee?.nombre} ${event.employee?.apellido} - ${event.nombre_horario}`}
                >
                  <div className="w-1 h-1 rounded-full bg-[#2A9D8F] shrink-0" />
                  <span className="truncate font-semibold leading-tight text-white/90">
                    {event.employee?.nombre || "Empleado"}
                  </span>
                </div>
              ))}
              
              {dateObj.events?.length > 3 && (
                <div className="text-[10px] font-medium text-gray-500 pl-1.5 pt-0.5 flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px]">
                        +{dateObj.events.length - 3}
                    </div>
                    <span>más...</span>
                </div>
              )}
            </div>

            {/* Hint hover */}
            {dateObj.type === 'current' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-white bg-[#2A9D8F] px-2 py-1 rounded shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                        Ver detalle
                    </span>
                </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function BranchSelector({ selectedBranch, onBranchChange, branches }) {
  return (
    <div className="flex items-center gap-4 mb-6 bg-[#13161C] p-2 rounded-2xl border border-white/10 shadow-lg w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-2 text-gray-400 pl-3 shrink-0 border-r border-white/10 pr-3 py-1">
        <Building2 className="w-5 h-5 text-[#2A9D8F]" />
        <span className="text-sm font-semibold hidden sm:inline text-gray-300">Sucursal</span>
      </div>
      <div className="flex gap-2 overflow-x-auto p-1 no-scrollbar">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onBranchChange(branch.id)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border
              ${selectedBranch?.id === branch.id 
                ? "bg-[#2A9D8F]/10 border-[#2A9D8F] text-[#2A9D8F] shadow-[0_0_10px_rgba(42,157,143,0.2)]" 
                : "bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-white"}
            `}
          >
            {branch.nombre_sucursal}
            {branch.employees_count !== undefined && (
               <span className="ml-2 text-xs opacity-60 bg-white/10 px-1.5 rounded-md">
                 {branch.employees_count}
               </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AssignedSchedulesPanel({ schedules, onDelete, isLoading }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este patrón de horario?")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const getDaysLabel = (diasSemana) => {
    if (!diasSemana) return "Sin días";
    let days = [];
    if (typeof diasSemana === 'string') days = diasSemana.split(',').map(Number);
    else if (Array.isArray(diasSemana)) days = diasSemana;
    
    return days.map(dayId => daysOfWeek.find(d => d.id === dayId)?.short).join(", ");
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#13161C] rounded-t-[2rem]">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#2A9D8F]/10 p-1.5 rounded-md border border-[#2A9D8F]/20">
            <CalendarDays className="w-4 h-4 text-[#2A9D8F]" />
          </div>
          <h3 className="font-bold text-white text-sm font-['Outfit']">Patrones Activos</h3>
        </div>
        <Badge className="bg-white/10 text-white border border-white/10">
          {schedules.length}
        </Badge>
      </div>
      
      <div className="p-4 space-y-3 flex-1 overflow-y-auto bg-[#0c0e12]/50 custom-scrollbar">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-40 gap-3">
             <Loader2 className="w-6 h-6 text-[#2A9D8F] animate-spin" />
             <span className="text-xs text-gray-500">Cargando horarios...</span>
           </div>
        ) : schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div key={schedule.id} className="group bg-[#13161C] p-4 rounded-xl border border-white/5 shadow-md hover:border-[#2A9D8F]/30 hover:bg-[#1A1D24] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                   <div className="w-10 h-10 rounded-full bg-[#0c0e12] border border-white/10 flex items-center justify-center text-[#2A9D8F] font-bold text-xs shadow-inner">
                      {schedule.employee?.nombre?.[0] || "?"}{schedule.employee?.apellido?.[0] || ""}
                   </div>
                   <div>
                      <div className="font-bold text-sm text-white leading-tight">
                        {schedule.employee?.nombre} {schedule.employee?.apellido}
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">{schedule.nombre_horario}</div>
                   </div>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                   onClick={() => handleDelete(schedule.id)}
                   disabled={deletingId === schedule.id}
                >
                   {deletingId === schedule.id ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <Trash2 className="w-4 h-4" />
                   )}
                </Button>
              </div>
              
              <div className="pl-[52px] space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#0c0e12] p-2 rounded-lg border border-white/5 w-fit">
                  <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span className="font-mono font-medium text-gray-300">
                    {schedule.hora_inicio_patron?.toString().slice(0,5)} - {schedule.hora_fin_patron?.toString().slice(0,5)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {getDaysLabel(schedule.dias_semana).split(', ').map((day, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-400 border border-white/10 px-2 py-1 rounded bg-[#0c0e12]">
                            {day}
                        </span>
                    ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 py-10">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Sin horarios asignados</p>
            <p className="text-xs opacity-50">Selecciona otra sucursal o crea uno nuevo.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function AssignScheduleModal({ isOpen, onClose, branchId, employees, onSuccess }) {
  const { show: showToast } = useToast();
  const [formData, setFormData] = useState({
    employee_id: "",
    dias_semana: [],
    hora_inicio: "08:00",
    hora_fin: "16:00",
    nombre_horario: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        employee_id: "", 
        dias_semana: [], 
        hora_inicio: "08:00", 
        hora_fin: "16:00", 
        nombre_horario: "" 
      });
    }
  }, [isOpen]);

  const filteredEmployees = useMemo(() => 
    employees.filter(emp => emp.sucursal_id === branchId),
  [employees, branchId]);

  const handleDayToggle = (dayId) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dayId) 
        ? prev.dias_semana.filter(d => d !== dayId)
        : [...prev.dias_semana, dayId].sort()
    }));
  };

  const handleSubmit = async () => {
    if (!formData.employee_id) return showToast("Selecciona un empleado", "error");
    if (formData.dias_semana.length === 0) return showToast("Selecciona al menos un día", "error");
    if (!formData.nombre_horario) return showToast("Ingresa un nombre para el horario", "error");
    if (!formData.hora_inicio || !formData.hora_fin) return showToast("Define las horas", "error");

    setLoading(true);
    try {
        const payload = {
            employee_id: formData.employee_id,
            sucursal_id: branchId,
            nombre_horario: formData.nombre_horario,
            dias_semana: formData.dias_semana,
            hora_inicio_patron: formData.hora_inicio, 
            hora_fin_patron: formData.hora_fin,
            descripcion: "Creado desde Web"
        };

        await employeeScheduleService.createSchedule(payload);
        
        showToast("Horario asignado exitosamente");
        onSuccess();
        onClose();
    } catch (e) {
        console.error(e); 
        showToast(e.message || "Error al guardar el horario", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Asignar Nuevo Patrón">
      <div className="space-y-6">
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">Empleado de la Sucursal</label>
            <SelectNative 
                placeholder={filteredEmployees.length ? "Seleccionar empleado..." : "No hay empleados en esta sucursal"}
                value={formData.employee_id}
                onChange={(val) => setFormData({...formData, employee_id: val})}
                options={filteredEmployees.map(e => ({ label: `${e.nombre} ${e.apellido}`, value: e.id }))}
                disabled={filteredEmployees.length === 0}
            />
            {filteredEmployees.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">
                    ⚠️ No se encontraron empleados registrados en esta sucursal.
                </p>
            )}
        </div>

        <div className="space-y-3">
            <label className="text-sm font-bold text-gray-400">Días de recurrencia</label>
            <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                    <button
                        key={day.id}
                        onClick={() => handleDayToggle(day.id)}
                        className={`
                            w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all border
                            ${formData.dias_semana.includes(day.id)
                                ? "bg-[#2A9D8F] border-[#2A9D8F] text-white shadow-lg shadow-[#2A9D8F]/30"
                                : "bg-[#0c0e12] border-white/10 text-gray-500 hover:border-[#2A9D8F]/50 hover:text-white"}
                        `}
                    >
                        {day.short[0]}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">Hora Inicio</label>
                <Input type="time" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} className="[color-scheme:dark]" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">Hora Fin</label>
                <Input type="time" value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} className="[color-scheme:dark]" />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">Nombre identificador</label>
            <Input 
                placeholder="Ej: Turno Matutino Estándar" 
                value={formData.nombre_horario}
                onChange={e => setFormData({...formData, nombre_horario: e.target.value})}
            />
            <p className="text-[11px] text-gray-600">Este nombre ayuda a identificar el patrón en reportes.</p>
        </div>

        <div className="pt-4 flex gap-3 justify-end border-t border-white/10 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading} className="bg-transparent border-white/10 text-gray-400 hover:text-white">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.employee_id}>
                {loading ? (
                   <span className="flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Guardando...
                   </span>
                ) : "Asignar Horario"}
            </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ============================================
// 4. APP PRINCIPAL
// ============================================
export default function GestionHorariosContent() {
  const { toast, show } = useToast();
  const [today] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [detailModalData, setDetailModalData] = useState({ isOpen: false, date: null, events: [] });

  useEffect(() => {
    const loadMasterData = async () => {
        try {
            const [sucursalesData, employeesData] = await Promise.all([
                sucursalService.getAllSucursales(),
                employeeService.getAllEmployees()
            ]);
            
            setBranches(sucursalesData);
            setEmployees(employeesData);
            
            if (sucursalesData.length > 0) {
                setSelectedBranchId(sucursalesData[0].id);
            }
        } catch (error) {
            console.error("Error loading master data", error);
            show("Error cargando datos. Backend no disponible.", "error");
        }
    };
    loadMasterData();
  }, []); 

  useEffect(() => {
    if (!selectedBranchId) return;
    
    let isMounted = true;
    setLoadingSchedules(true);

    const fetchSchedules = async () => {
        try {
            const data = await employeeScheduleService.getSchedulesBySucursalId(selectedBranchId);
            if (isMounted) setSchedules(data);
        } catch (err) {
            if (isMounted) {
                console.error("Error cargando horarios:", err);
                setSchedules([]); 
            }
        } finally {
            if (isMounted) setLoadingSchedules(false);
        }
    };

    fetchSchedules();

    return () => { isMounted = false; };
  }, [selectedBranchId]);

  const enrichedSchedules = useMemo(() => {
    return schedules.map(schedule => {
        const employeeInfo = employees.find(e => e.id === schedule.employee_id) || schedule.employee || {};
        return {
            ...schedule,
            employee: {
                ...employeeInfo,
                nombre: employeeInfo.nombre || "Desconocido",
                apellido: employeeInfo.apellido || "",
                puesto: employeeInfo.puesto || "Sin asignar"
            }
        };
    });
  }, [schedules, employees]);

  const handleCreateSuccess = () => {
    if (selectedBranchId) {
        setLoadingSchedules(true);
        employeeScheduleService.getSchedulesBySucursalId(selectedBranchId)
            .then(setSchedules)
            .catch(() => show("Error recargando horarios", "error"))
            .finally(() => setLoadingSchedules(false));
    }
  };

  const handleDeleteSchedule = async (id) => {
      try {
          await employeeScheduleService.deleteSchedule(id);
          show("Horario eliminado correctamente");
          setSchedules(prev => prev.filter(s => s.id !== id));
      } catch (error) {
          show(error.message, "error");
      }
  };

  const handleDayClick = (dateObj) => {
      setDetailModalData({
          isOpen: true,
          date: dateObj.date,
          events: dateObj.events
      });
  };

  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === parseInt(selectedBranchId)), 
  [branches, selectedBranchId]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(c => c - 1);
    } else {
      setCurrentMonth(c => c - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(c => c + 1);
    } else {
      setCurrentMonth(c => c + 1);
    }
  };

  return (
    // CONTENEDOR PRINCIPAL DARK
    <div className="min-h-screen bg-[#0c0e12] p-4 md:p-8 font-sans text-gray-200">
      <div className="max-w-[1400px] mx-auto space-y-6">
          
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit']">
                    Gestión de Turnos
                </h1>
                <p className="text-gray-400 font-light text-sm">
                    Configura los patrones recurrentes semanales por sucursal.
                </p>
            </div>
            <Button 
                onClick={() => setModalOpen(true)} 
                disabled={!selectedBranchId}
                className="px-6 py-6 rounded-xl"
            >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Patrón
            </Button>
        </div>

        <BranchSelector 
            branches={branches} 
            selectedBranch={selectedBranch} 
            onBranchChange={setSelectedBranchId} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[600px]">
            <div className="xl:col-span-4 h-full overflow-hidden">
                <AssignedSchedulesPanel 
                    schedules={enrichedSchedules} 
                    onDelete={handleDeleteSchedule}
                    isLoading={loadingSchedules}
                />
            </div>

            <div className="xl:col-span-8 h-full overflow-hidden">
                <BranchCalendar 
                    schedules={enrichedSchedules}
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onDayClick={handleDayClick} 
                />
            </div>
        </div>

      </div>

      <AssignScheduleModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        branchId={selectedBranchId}
        employees={employees}
        onSuccess={handleCreateSuccess}
      />

      <DayDetailModal 
        isOpen={detailModalData.isOpen}
        onClose={() => setDetailModalData(prev => ({ ...prev, isOpen: false }))}
        date={detailModalData.date}
        events={detailModalData.events}
      />

      <ToastContainer toast={toast} />
    </div>
  );
}