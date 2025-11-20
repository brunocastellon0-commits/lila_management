import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, Users, Building2, Plus, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, Trash2, CalendarDays, X, Check, AlertCircle,
  User, Briefcase
} from "lucide-react";

// ============================================
// 0. INFRAESTRUCTURA (Integración de tu config.js)
// ============================================

const API_BASE_URL = 'http://127.0.0.1:7000';

/**
 * Maneja respuestas de error del servidor
 */
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

/**
 * Función fetchAPI robusta
 */
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
      // CORREGIDO: Eliminamos 'parseError' del catch para evitar warnings de unused-vars
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
// 2. COMPONENTES UI
// ============================================

const Button = ({ children, variant = "primary", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-teal-500/30",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-700",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
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
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
    {children}
  </span>
);

const Input = ({ className = "", ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow ${className}`}
    {...props}
  />
);

const SelectNative = ({ options, value, onChange, placeholder, className = "" }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full appearance-none items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow ${className}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
      <ChevronLeft className="h-4 w-4 rotate-[-90deg]" />
    </div>
  </div>
);

const Dialog = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
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
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-slate-200 border ${
        toast.type === 'error' 
          ? 'bg-white border-red-100 text-red-600' 
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5 text-teal-400" />}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

// ============================================
// 3. LÓGICA DE NEGOCIO Y COMPONENTES
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
        <div className="flex items-center gap-3 bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <CalendarDays className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-teal-900 capitalize">{formatDate(date)}</h3>
            <p className="text-sm text-teal-600/80 font-medium">
              {events.length} {events.length === 1 ? 'empleado asignado' : 'empleados asignados'}
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-3">
            {events.map((event, idx) => (
              <div key={`${event.id}-${idx}`} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                             {event.employee?.nombre} {event.employee?.apellido}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                             <Briefcase className="w-3 h-3 text-slate-400" />
                             <p className="text-xs text-slate-500 font-medium">
                                {event.employee?.puesto || "Sin puesto definido"}
                             </p>
                          </div>
                       </div>
                       <Badge className="bg-teal-50 text-teal-700 border border-teal-100">
                          {event.nombre_horario}
                       </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg w-fit">
                      <Clock className="w-3.5 h-3.5 text-teal-500" />
                      <span className="font-mono font-semibold">
                        {event.hora_inicio_patron?.toString().slice(0,5)} - {event.hora_fin_patron?.toString().slice(0,5)}
                      </span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <Users className="w-10 h-10 mb-2 opacity-20" />
             <p className="text-sm font-medium">No hay personal programado para este día.</p>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
           <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  );
}

// --- Componente: Calendario de Sucursal ---
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
    <Card className="flex flex-col h-full overflow-hidden ring-1 ring-slate-900/5 shadow-lg shadow-slate-200/50">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {monthNames[currentMonth]} <span className="text-slate-400 font-medium">{currentYear}</span>
          </h2>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={onPrevMonth} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth} className="h-8 w-8 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-50">
        {calendarDays.map((dateObj, index) => (
          <div 
            key={index} 
            onClick={() => dateObj.type === 'current' && onDayClick(dateObj)}
            className={`
              min-h-[100px] border-b border-r border-slate-100 p-1.5 transition-all flex flex-col gap-1 relative group
              ${dateObj.type === 'padding' 
                ? 'bg-slate-50/80 text-slate-300 cursor-default' 
                : 'bg-white hover:bg-teal-50/30 cursor-pointer hover:shadow-inner'}
            `}
          >
            <div className="flex justify-between items-start px-1">
                <span className={`text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                    dateObj.type === 'current' 
                    ? 'text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors' 
                    : 'text-slate-300'
                }`}>
                {dateObj.day}
                </span>
                
                {/* Indicador sutil si hay eventos */}
                {dateObj.events?.length > 0 && (
                    <span className="flex h-2 w-2 rounded-full bg-teal-500 sm:hidden"></span>
                )}
            </div>
            
            <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
              {dateObj.events?.slice(0, 3).map((event, idx) => (
                <div 
                  key={`${event.id}-${idx}`}
                  className="text-[10px] bg-teal-50 border border-teal-100 text-teal-800 px-1.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm"
                  title={`${event.employee?.nombre} ${event.employee?.apellido} - ${event.nombre_horario}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="truncate font-semibold leading-tight">
                    {event.employee?.nombre || "Empleado"}
                  </span>
                </div>
              ))}
              
              {dateObj.events?.length > 3 && (
                <div className="text-[10px] font-medium text-slate-400 pl-1.5 pt-0.5 flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px]">
                        +{dateObj.events.length - 3}
                    </div>
                    <span>más...</span>
                </div>
              )}
            </div>

            {/* Hint hover */}
            {dateObj.type === 'current' && (
                <div className="absolute inset-0 bg-teal-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-bold text-teal-800 bg-white/90 px-2 py-1 rounded shadow-sm transform scale-95 group-hover:scale-100 transition-transform">
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
    <div className="flex items-center gap-4 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full max-w-full overflow-hidden ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2 text-slate-600 pl-3 shrink-0 border-r border-slate-100 pr-3 py-1">
        <Building2 className="w-5 h-5 text-slate-400" />
        <span className="text-sm font-semibold hidden sm:inline text-slate-700">Sucursal</span>
      </div>
      <div className="flex gap-1 overflow-x-auto p-1 no-scrollbar">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onBranchChange(branch.id)}
            className={`
              whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${selectedBranch?.id === branch.id 
                ? "bg-slate-900 text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
            `}
          >
            {branch.nombre_sucursal}
            {branch.employees_count !== undefined && (
               <span className={`ml-2 text-xs opacity-60`}>
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
    <Card className="flex flex-col h-full ring-1 ring-slate-900/5">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-50 p-1.5 rounded-md">
            <CalendarDays className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Patrones Activos</h3>
        </div>
        <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
          {schedules.length}
        </Badge>
      </div>
      
      <div className="p-3 space-y-2 flex-1 overflow-y-auto bg-slate-50/50">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-40 gap-3">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
             <span className="text-xs text-slate-400">Cargando horarios...</span>
           </div>
        ) : schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div key={schedule.id} className="group bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex gap-3 items-center">
                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shadow-sm">
                      {schedule.employee?.nombre?.[0] || "?"}{schedule.employee?.apellido?.[0] || ""}
                   </div>
                   <div>
                      <div className="font-bold text-sm text-slate-800 leading-tight">
                        {schedule.employee?.nombre} {schedule.employee?.apellido}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{schedule.nombre_horario}</div>
                   </div>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                   onClick={() => handleDelete(schedule.id)}
                   disabled={deletingId === schedule.id}
                >
                   {deletingId === schedule.id ? (
                     <div className="animate-spin h-3 w-3 border-2 border-current rounded-full border-t-transparent"/>
                   ) : (
                     <Trash2 className="w-3.5 h-3.5" />
                   )}
                </Button>
              </div>
              
              <div className="pl-[44px] space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 w-fit">
                  <Clock className="w-3 h-3 text-teal-500" />
                  <span className="font-mono font-medium text-slate-700">
                    {schedule.hora_inicio_patron?.toString().slice(0,5)} - {schedule.hora_fin_patron?.toString().slice(0,5)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {getDaysLabel(schedule.dias_semana).split(', ').map((day, i) => (
                        <span key={i} className="text-[10px] font-semibold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                            {day}
                        </span>
                    ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <Users className="w-10 h-10 mb-3 opacity-10" />
            <p className="text-sm font-medium">Sin horarios asignados</p>
            <p className="text-xs opacity-60">Selecciona otra sucursal o crea uno nuevo.</p>
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
            <label className="text-sm font-medium text-slate-700">Empleado de la Sucursal</label>
            <SelectNative 
                placeholder={filteredEmployees.length ? "Seleccionar empleado..." : "No hay empleados en esta sucursal"}
                value={formData.employee_id}
                onChange={(val) => setFormData({...formData, employee_id: val})}
                options={filteredEmployees.map(e => ({ label: `${e.nombre} ${e.apellido}`, value: e.id }))}
                disabled={filteredEmployees.length === 0}
            />
            {filteredEmployees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                   ⚠️ No se encontraron empleados registrados en esta sucursal.
                </p>
            )}
        </div>

        <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Días de recurrencia</label>
            <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                    <button
                        key={day.id}
                        onClick={() => handleDayToggle(day.id)}
                        className={`
                            w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all border
                            ${formData.dias_semana.includes(day.id)
                                ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"}
                        `}
                    >
                        {day.short[0]}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hora Inicio</label>
                <Input type="time" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hora Fin</label>
                <Input type="time" value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre identificador</label>
            <Input 
                placeholder="Ej: Turno Matutino Estándar" 
                value={formData.nombre_horario}
                onChange={e => setFormData({...formData, nombre_horario: e.target.value})}
            />
            <p className="text-[11px] text-slate-400">Este nombre ayuda a identificar el patrón en reportes.</p>
        </div>

        <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.employee_id}>
                {loading ? (
                   <span className="flex items-center gap-2">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
  
  // Estados de Datos
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  
  // Estados de UI
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Nuevo Estado para Detalle de Día
  const [detailModalData, setDetailModalData] = useState({ isOpen: false, date: null, events: [] });

  // 1. Carga de Datos Maestros
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

  // 2. Carga de Horarios
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

  // 3. Enriquecimiento de Datos (Memoizado)
  // Cruzamos los horarios (schedules) con los empleados (employees) para tener datos completos
  // incluso si el endpoint de schedules solo devolvía IDs.
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto space-y-6">
          
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    Gestión de Turnos
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Configura los patrones recurrentes semanales por sucursal.
                </p>
            </div>
            <Button 
                onClick={() => setModalOpen(true)} 
                className="shadow-lg shadow-teal-900/10"
                disabled={!selectedBranchId}
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
                    schedules={enrichedSchedules} // Usamos los datos enriquecidos
                    onDelete={handleDeleteSchedule}
                    isLoading={loadingSchedules}
                />
            </div>

            <div className="xl:col-span-8 h-full overflow-hidden">
                <BranchCalendar 
                    schedules={enrichedSchedules} // Usamos los datos enriquecidos
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onDayClick={handleDayClick} // Nuevo Handler
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

      {/* Nuevo Modal de Detalle */}
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