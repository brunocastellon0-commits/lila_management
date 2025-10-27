// src/components/GestionHorariosContent.jsx - VERSIÓN SIMPLIFICADA
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { 
  Clock, 
  Users, 
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  CalendarDays
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

// Importar servicios
import { employeeScheduleService } from "../../../api/employeeScheduleService";
import { employeeService } from "../../../api/employee_Service";
import { sucursalService } from "../../../api/sucursalService";

// Datos estáticos iniciales
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

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ============================================
// COMPONENTES INTERNOS
// ============================================

// Selector de Sucursal
function BranchSelector({ selectedBranch, onBranchChange, isLoading, branches }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-slate-600">
        <Building2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Sucursal:</span>
      </div>
      <Tabs 
        value={selectedBranch?.id?.toString()} 
        onValueChange={(value) => onBranchChange(parseInt(value))} 
        className="flex-1"
      >
        <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
          {branches.map((branch) => (
            <TabsTrigger
              key={branch.id}
              value={branch.id.toString()}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 px-6 font-semibold transition-all duration-200"
              disabled={isLoading}
            >
              {branch.nombre_sucursal}
              <span className="ml-2 text-xs opacity-75">({branch.employees_count || 0})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

// Modal para Asignar Horario
function AssignScheduleModal({ isOpen, onClose, branchId, employees, onScheduleAssigned }) {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [scheduleName, setScheduleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmployees = employees.filter(emp => emp.sucursal_id === branchId);

  const handleDayToggle = (dayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || selectedDays.length === 0 || !scheduleName) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduleData = {
        employee_id: parseInt(selectedEmployee),
        sucursal_id: branchId,
        nombre_horario: scheduleName,
        dias_semana: selectedDays,
        hora_inicio_patron: startTime,
        hora_fin_patron: endTime
      };

      await employeeScheduleService.createSchedule(scheduleData);
      
      toast.success("Horario asignado correctamente");
      onScheduleAssigned();
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedDays([]);
    setStartTime("08:00");
    setEndTime("16:00");
    setScheduleName("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Asignar Horario Recurrente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selección de Empleado */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Empleado *
            </label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                          {emp.nombre?.[0]}{emp.apellido?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.nombre} {emp.apellido} - {emp.puesto}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Días de la semana */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">
              Días de la semana *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.id}
                  type="button"
                  variant={selectedDays.includes(day.id) ? "default" : "outline"}
                  onClick={() => handleDayToggle(day.id)}
                  className={`rounded-lg ${
                    selectedDays.includes(day.id)
                      ? "bg-teal-600 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Hora de inicio *
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Hora de fin *
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Nombre del horario */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Nombre del horario *
            </label>
            <Input
              placeholder="Ej: Turno Mañana - Lunes a Viernes"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-semibold"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-sm"
          >
            {isSubmitting ? "Asignando..." : "Asignar Horario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Panel de Horarios Asignados
function AssignedSchedulesPanel({ schedules, onRefresh, isLoading }) {
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleDelete = async (scheduleId) => {
    setDeleteLoading(scheduleId);
    try {
      await employeeScheduleService.deleteSchedule(scheduleId);
      toast.success("Horario eliminado correctamente");
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getDaysLabel = (diasSemanaStr) => {
    if (!diasSemanaStr) return "No especificado";
    try {
      const days = diasSemanaStr.split(',').map(Number);
      const dayNames = days.map(dayId => 
        daysOfWeek.find(d => d.id === dayId)?.short || `Día ${dayId}`
      );
      return dayNames.join(", ");
    } catch (error) {
      return diasSemanaStr;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-slate-600">Cargando...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900">Horarios Asignados</h3>
        </div>
        <Badge className="bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold shadow-sm">
          {schedules.length} patrones
        </Badge>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 bg-gradient-to-br from-white to-teal-50/30 border border-slate-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="text-sm bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 font-bold">
                      {schedule.employee?.nombre?.[0]}{schedule.employee?.apellido?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-900">
                      {schedule.employee?.nombre} {schedule.employee?.apellido}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {schedule.employee?.puesto}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule.id)}
                  disabled={deleteLoading === schedule.id}
                  className="hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="ml-13 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-slate-900">{schedule.nombre_horario}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Horario:</span>
                  <span className="text-slate-900 font-bold">
                    {schedule.hora_inicio_patron} - {schedule.hora_fin_patron}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Días:</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                    {getDaysLabel(schedule.dias_semana)}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No hay horarios asignados</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function GestionHorariosContent() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Cargar sucursales al iniciar
  useEffect(() => {
    loadBranches();
    loadEmployees();
  }, []);

  // Cargar horarios cuando cambia la sucursal
  useEffect(() => {
    if (selectedBranch) {
      loadSchedules();
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      const data = await sucursalService.getAllSucursales();
      setBranches(data);
      if (data.length > 0 && !selectedBranch) {
        setSelectedBranch(data[0]);
      }
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      toast.error('Error al cargar sucursales');
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      toast.error('Error al cargar empleados');
    }
  };

  const loadSchedules = async () => {
    if (!selectedBranch) return;
    
    setIsLoading(true);
    try {
      console.log('Cargando horarios para sucursal:', selectedBranch.id);
      const data = await employeeScheduleService.getSchedulesBySucursalId(selectedBranch.id);
      console.log('Horarios cargados:', data);
      setSchedules(data);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      toast.error(`Error al cargar horarios: ${error.message}`);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchChange = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      toast.info(`Cambiado a sucursal: ${branch.nombre_sucursal}`);
    }
  };

  const handleScheduleAssigned = () => {
    loadSchedules();
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
              Asigna patrones de horario recurrentes a tu equipo
            </p>
          </div>
          <Button
            onClick={() => setAssignModalOpen(true)}
            disabled={isLoading || !selectedBranch}
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Asignar Horario
          </Button>
        </div>

        {/* Selector de Sucursal */}
        {branches.length > 0 && (
          <BranchSelector 
            selectedBranch={selectedBranch}
            onBranchChange={handleBranchChange}
            isLoading={isLoading}
            branches={branches}
          />
        )}
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Espacio para calendario futuro */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Calendario de Horarios</p>
              <p className="text-sm mt-2">Próximamente: Vista mensual de horarios</p>
            </div>
          </Card>
        </div>

        {/* Panel de Horarios Asignados */}
        <div>
          <AssignedSchedulesPanel 
            schedules={schedules}
            onRefresh={loadSchedules}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modal de Asignación de Horario */}
      <AssignScheduleModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        branchId={selectedBranch?.id}
        employees={employees}
        onScheduleAssigned={handleScheduleAssigned}
      />

      <Toaster />
    </div>
  );
}