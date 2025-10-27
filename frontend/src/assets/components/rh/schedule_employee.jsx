import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { 
  Clock, 
  Users, 
  UserCheck, 
  AlertCircle, 
  Building2,
  ArrowRightLeft,
  Check,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit,
  Trash2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

// ============================================
// DATOS MOCK
// ============================================
const branches = [
  { id: "central", name: "Central", count: 24 },
  { id: "norte", name: "Norte", count: 18 },
  { id: "sur", name: "Sur", count: 16 },
];

const timeSlots = [
  { id: "morning", name: "Mañana", hours: "6:00 - 14:00" },
  { id: "afternoon", name: "Tarde", hours: "14:00 - 22:00" },
  { id: "night", name: "Noche", hours: "22:00 - 6:00" },
];

const mockEmployees = [
  { id: 1, name: "Ana García", role: "Cajera", avatar: "AG" },
  { id: 2, name: "Pedro López", role: "Mesero", avatar: "PL" },
  { id: 3, name: "María Ruiz", role: "Chef", avatar: "MR" },
  { id: 4, name: "Carlos Díaz", role: "Bartender", avatar: "CD" },
  { id: 5, name: "Laura Sánchez", role: "Hostess", avatar: "LS" },
  { id: 6, name: "Juan Pérez", role: "Mesero", avatar: "JP" },
  { id: 7, name: "Sofía Torres", role: "Cajera", avatar: "ST" },
  { id: 8, name: "Diego Morales", role: "Chef", avatar: "DM" },
];

const requests = [
  {
    id: 1,
    from: "Ana García",
    to: "Pedro López",
    date: "2025-10-29",
    shift: "Tarde",
    reason: "Cita médica",
    time: "Hace 2h",
  },
  {
    id: 2,
    from: "María Ruiz",
    to: "Laura Sánchez",
    date: "2025-10-31",
    shift: "Mañana",
    reason: "Asunto personal",
    time: "Hace 4h",
  },
];

// ============================================
// UTILIDADES PARA CALENDARIO
// ============================================
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isToday = (year, month, day) => {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
};

// ============================================
// COMPONENTES INTERNOS
// ============================================

// Selector de Sucursal
function BranchSelector({ selectedBranch, onBranchChange }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-slate-600">
        <Building2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Sucursal:</span>
      </div>
      <Tabs value={selectedBranch} onValueChange={onBranchChange} className="flex-1">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
          {branches.map((branch) => (
            <TabsTrigger
              key={branch.id}
              value={branch.id}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 px-6 font-semibold transition-all duration-200"
            >
              {branch.name}
              <span className="ml-2 text-xs opacity-75">({branch.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

// Calendario Mensual
function MonthlyCalendar({ scheduleData, onDayClick, currentYear, currentMonth, onPrevMonth, onNextMonth }) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = [];

  // Rellenar días vacíos antes del primer día
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Rellenar días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getShiftsForDay = (day) => {
    if (!day) return [];
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    return scheduleData[dateStr] || [];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Header del Calendario */}
      <div className="p-6 bg-gradient-to-br from-white to-teal-50/30 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevMonth}
              className="rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                onDayClick(today.getFullYear(), today.getMonth());
              }}
              className="rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 font-semibold"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              className="rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center bg-gradient-to-br from-slate-50 to-white border-r border-slate-200 last:border-r-0"
          >
            <span className="text-sm font-bold text-slate-600">{day}</span>
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const shifts = getShiftsForDay(day);
          const today = day && isToday(currentYear, currentMonth, day);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-slate-200 last:border-r-0 ${
                !day ? 'bg-slate-50/50' : 'bg-white hover:bg-teal-50/20 cursor-pointer'
              } transition-colors ${today ? 'ring-2 ring-teal-500 ring-inset' : ''}`}
              onClick={() => day && onDayClick(currentYear, currentMonth, day)}
            >
              {day && (
                <>
                  <div className={`text-sm font-bold mb-2 ${
                    today 
                      ? 'bg-teal-600 text-white w-7 h-7 rounded-full flex items-center justify-center' 
                      : 'text-slate-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {shifts.slice(0, 2).map((shift, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1.5 rounded-lg bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-200/50"
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-600" />
                          <span className="font-semibold text-teal-700 truncate">
                            {shift.employee.name.split(' ')[0]}
                          </span>
                        </div>
                        <div className="text-xs text-teal-600 font-medium truncate">
                          {shift.shift}
                        </div>
                      </div>
                    ))}
                    {shifts.length > 2 && (
                      <div className="text-xs text-center text-slate-500 font-semibold bg-slate-100 rounded-lg py-1">
                        +{shifts.length - 2} más
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Modal para Gestionar Turnos del Día
function DayScheduleModal({ isOpen, onClose, date, shifts, onAddShift, onDeleteShift }) {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedShift, setSelectedShift] = useState("");

  const handleAdd = () => {
    if (!selectedEmployee || !selectedShift) {
      toast.error("Selecciona un empleado y un turno");
      return;
    }

    const employee = mockEmployees.find(e => e.id === parseInt(selectedEmployee));
    const shift = timeSlots.find(s => s.id === selectedShift);

    onAddShift({
      employee,
      shift: shift.name,
      hours: shift.hours,
      status: "active"
    });

    setSelectedEmployee("");
    setSelectedShift("");
    toast.success("Turno asignado correctamente");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Gestionar Turnos
          </DialogTitle>
          <DialogDescription className="text-slate-600 font-medium">
            {date ? new Date(date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Formulario para agregar turno */}
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Empleado
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                            {emp.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span>{emp.name} - {emp.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Turno
              </label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.name} ({slot.hours})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Turno
          </Button>
        </div>

        {/* Lista de turnos actuales */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Turnos Asignados</h4>
          {shifts && shifts.length > 0 ? (
            shifts.map((shift, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 font-bold">
                      {shift.employee.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-900">{shift.employee.name}</div>
                    <div className="text-xs text-slate-600 font-medium">
                      {shift.employee.role} • {shift.shift} ({shift.hours})
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteShift(index)}
                  className="hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No hay turnos asignados para este día</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-semibold"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Panel de Solicitudes
function RequestsPanel({ requests, onApprove, onReject }) {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900">Solicitudes de Cambio</h3>
        </div>
        <Badge className="bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold shadow-sm">
          {requests.length} pendientes
        </Badge>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-gradient-to-br from-white to-teal-50/30 border border-slate-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-teal-600 to-teal-500 text-white font-bold">
                    {request.from.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{request.from}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {request.time}
                  </div>
                </div>
              </div>
              <div className="ml-11 space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Cambio con:</span>
                  <span className="text-slate-900 font-bold">{request.to}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Fecha:</span>
                  <span className="text-slate-900 font-bold">
                    {new Date(request.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Turno:</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                    {request.shift}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 italic font-medium">
                  Motivo: {request.reason}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onApprove(request.id)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-bold shadow-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(request.id)}
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                >
                  <X className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <ArrowRightLeft className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No hay solicitudes pendientes</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Resumen de Estadísticas
function ScheduleSummary({ scheduleData }) {
  const totalShifts = Object.values(scheduleData).reduce((sum, shifts) => sum + shifts.length, 0);
  const activeEmployees = new Set(
    Object.values(scheduleData).flatMap(shifts => shifts.map(s => s.employee.id))
  ).size;

  const stats = [
    {
      icon: Users,
      label: "Empleados Activos",
      value: activeEmployees.toString(),
      change: "+3",
      color: "from-teal-600 to-teal-500",
      bgColor: "from-teal-50 to-teal-100/50",
    },
    {
      icon: UserCheck,
      label: "Turnos Asignados",
      value: totalShifts.toString(),
      change: "+12",
      color: "from-emerald-600 to-emerald-500",
      bgColor: "from-emerald-50 to-emerald-100/50",
    },
    {
      icon: AlertCircle,
      label: "Reemplazos",
      value: "8",
      change: "-2",
      color: "from-yellow-600 to-yellow-500",
      bgColor: "from-yellow-50 to-yellow-100/50",
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: "3",
      change: "0",
      color: "from-purple-600 to-purple-500",
      bgColor: "from-purple-50 to-purple-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-slate-200/50`}>
                <Icon className="w-6 h-6 text-teal-600" />
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                stat.change.startsWith('+') 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : stat.change.startsWith('-')
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {stat.change !== "0" && stat.change}
                {stat.change === "0" && "Sin cambios"}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600 font-semibold">{stat.label}</div>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function GestionHorariosContent() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedBranch, setSelectedBranch] = useState("central");
  const [pendingRequests, setPendingRequests] = useState(requests);
  const [scheduleData, setScheduleData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    toast.info(`Cambiado a sucursal: ${branches.find(b => b.id === branchId)?.name}`);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (year, month, day) => {
    if (day) {
      const dateStr = formatDate(new Date(year, month, day));
      setSelectedDate(dateStr);
      setModalOpen(true);
    } else {
      // Si no hay día, es el botón "Hoy"
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  };

  const handleAddShift = (shift) => {
    setScheduleData(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), shift]
    }));
  };

  const handleDeleteShift = (index) => {
    setScheduleData(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter((_, i) => i !== index)
    }));
    toast.success("Turno eliminado correctamente");
  };

  const handleApprove = (requestId) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success("Solicitud aprobada correctamente", {
      description: "El cambio de turno ha sido confirmado"
    });
  };

  const handleReject = (requestId) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    toast.error("Solicitud rechazada", {
      description: "El empleado será notificado"
    });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Gestión de Horarios
            </h1>
            <p className="text-slate-600 font-medium">
              Administra los turnos y horarios de tu equipo
            </p>
          </div>
        </div>

        {/* Resumen de Estadísticas */}
        <div className="mb-8">
          <ScheduleSummary scheduleData={scheduleData} />
        </div>

        {/* Selector de Sucursal */}
        <BranchSelector 
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
        />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendario - 2 columnas */}
        <div className="lg:col-span-2">
          <MonthlyCalendar 
            scheduleData={scheduleData}
            onDayClick={handleDayClick}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        {/* Panel de Solicitudes - 1 columna */}
        <div>
          <RequestsPanel 
            requests={pendingRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>

      {/* Modal de Gestión de Turnos */}
      <DayScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        shifts={scheduleData[selectedDate] || []}
        onAddShift={handleAddShift}
        onDeleteShift={handleDeleteShift}
      />

      <Toaster />
    </div>
  );
}