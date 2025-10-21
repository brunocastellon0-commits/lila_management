import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui/alert_dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Toaster } from "../ui/sonner";
import { employeeScheduleService } from "../../../api/employeeScheduleService";

// ============================================
// COMPONENTE DE ACCESO DENEGADO
// ============================================
function AccesoDenegado() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm max-w-md text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceso Restringido</h2>
        <p className="text-slate-600 mb-2">
          No tienes permisos para acceder a la gestión completa de horarios.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Este módulo está disponible solo para administradores del sistema.
        </p>
        <p className="text-slate-500 text-sm">
          Si necesitas acceso, contacta al administrador del sistema.
        </p>
        <Button 
          className="mt-6 bg-teal-600 hover:bg-teal-700"
          onClick={() => window.location.href = '/mi-horario'}
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Mi Horario Personal
        </Button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE VISUALIZACIÓN PARA EMPLEADOS
// ============================================
function MiHorarioPersonal() {
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMySchedules();
  }, []);

  const loadMySchedules = async () => {
    try {
      // En una app real, esto vendría de tu contexto de autenticación
      const currentEmployeeId = localStorage.getItem('currentEmployeeId') || '1'; // Ejemplo
      const allSchedules = await employeeScheduleService.getAllSchedules();
      
      // Filtrar solo los horarios del empleado actual
      const mySchedules = allSchedules.filter(
        schedule => schedule.employee_id.toString() === currentEmployeeId
      );
      
      setMySchedules(mySchedules);
    } catch (error) {
      console.error("Error al cargar horarios personales:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDiaNombre = (dia) => {
    const diasSemana = [
      { value: 1, label: "Lunes" },
      { value: 2, label: "Martes" },
      { value: 3, label: "Miércoles" },
      { value: 4, label: "Jueves" },
      { value: 5, label: "Viernes" },
      { value: 6, label: "Sábado" },
      { value: 7, label: "Domingo" }
    ];
    const diaObj = diasSemana.find((d) => d.value === dia);
    return diaObj ? diaObj.label : "N/A";
  };

  const formatTimeForInput = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') {
      return timeObj.slice(0, 5);
    }
    return `${String(timeObj.hours).padStart(2, '0')}:${String(timeObj.minutes).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando tu horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen">
      {/* Encabezado para empleados */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="h-8 w-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-slate-900">Mi Horario Personal</h1>
        </div>
        <p className="text-slate-600 font-medium">
          Consulta tus turnos y horarios asignados
        </p>
      </div>

      {/* Horarios del empleado */}
      {mySchedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No tienes horarios asignados</h3>
          <p className="text-slate-500">Contacta con recursos humanos para asignarte horarios.</p>
        </div>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {mySchedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{schedule.nombre_horario}</h3>
                  <Badge 
                    className={`
                      mt-2 ${schedule.es_actual 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-700'
                      }
                    `}
                  >
                    {schedule.es_actual ? 'Horario Actual' : 'Horario Inactivo'}
                  </Badge>
                </div>
                <Badge variant="outline" className="border-teal-200 text-teal-700 text-lg px-4 py-2">
                  {getDiaNombre(schedule.dia_semana)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold">Inicio:</span>
                  <span className="text-lg">{formatTimeForInput(schedule.hora_inicio_patron)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold">Fin:</span>
                  <span className="text-lg">{formatTimeForInput(schedule.hora_fin_patron)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL MODIFICADO
// ============================================
export default function GestionHorariosContent() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para administradores
  const [schedules, setSchedules] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    employee_id: "",
    nombre_horario: "",
    dia_semana: "",
    hora_inicio_patron: "",
    hora_fin_patron: "",
    es_actual: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDia, setFilterDia] = useState("todos");

  // Verificar permisos del usuario
  useEffect(() => {
    const checkPermissions = async () => {
      // En una app real, esto vendría de tu contexto de autenticación
      setTimeout(() => {
        const userIsAdmin = localStorage.getItem('userRole') === 'admin';
        // const userIsAdmin = false; // Para probar como empleado normal
        setUserRole(userIsAdmin ? 'admin' : 'employee');
        setLoading(false);
        
        // Si es admin, cargar los datos
        if (userIsAdmin) {
          loadSchedules();
        }
      }, 500);
    };

    checkPermissions();
  }, []);

  // 🔹 Solo para administradores
  const diasSemana = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 7, label: "Domingo" }
  ];

  const loadSchedules = async () => {
    try {
      const data = await employeeScheduleService.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchSearch =
      schedule.nombre_horario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.employee_id?.toString().includes(searchTerm);
    const matchDia = filterDia === "todos" || schedule.dia_semana === parseInt(filterDia);
    return matchSearch && matchDia;
  });

  const resetForm = () => {
    setFormData({
      id: null,
      employee_id: "",
      nombre_horario: "",
      dia_semana: "",
      hora_inicio_patron: "",
      hora_fin_patron: "",
      es_actual: true
    });
    setIsEditing(false);
    setIsFormOpen(false);
  };

  const formatTimeForInput = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') {
      return timeObj.slice(0, 5);
    }
    return `${String(timeObj.hours).padStart(2, '0')}:${String(timeObj.minutes).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.employee_id ||
      !formData.nombre_horario ||
      !formData.dia_semana ||
      !formData.hora_inicio_patron ||
      !formData.hora_fin_patron
    ) {
      console.log("Por favor completa todos los campos");
      return;
    }

    try {
      const scheduleData = {
        employee_id: parseInt(formData.employee_id),
        nombre_horario: formData.nombre_horario,
        dia_semana: parseInt(formData.dia_semana),
        hora_inicio_patron: formData.hora_inicio_patron + ":00",
        hora_fin_patron: formData.hora_fin_patron + ":00",
        es_actual: formData.es_actual
      };

      if (isEditing) {
        await employeeScheduleService.updateSchedule(formData.id, scheduleData);
        console.log("Horario actualizado correctamente");
      } else {
        await employeeScheduleService.createSchedule(scheduleData);
        console.log("Horario creado correctamente");
      }

      resetForm();
      loadSchedules();
    } catch (error) {
      console.error("Error al guardar horario:", error);
    }
  };

  const handleEdit = async (schedule) => {
    try {
      const fullSchedule = await employeeScheduleService.getScheduleById(schedule.id);
      
      setFormData({
        id: fullSchedule.id,
        employee_id: fullSchedule.employee_id.toString(),
        nombre_horario: fullSchedule.nombre_horario,
        dia_semana: fullSchedule.dia_semana.toString(),
        hora_inicio_patron: formatTimeForInput(fullSchedule.hora_inicio_patron),
        hora_fin_patron: formatTimeForInput(fullSchedule.hora_fin_patron),
        es_actual: fullSchedule.es_actual
      });
      
      setIsEditing(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error("Error al cargar horario para editar:", error);
    }
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await employeeScheduleService.deleteSchedule(scheduleToDelete.id);
      console.log("Horario eliminado correctamente");
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
      loadSchedules();
    } catch (error) {
      console.error("Error al eliminar horario:", error);
    }
  };

  const handleCreateAllDays = async () => {
    if (!formData.employee_id || !formData.nombre_horario || 
        !formData.hora_inicio_patron || !formData.hora_fin_patron) {
      console.log("Por favor completa los campos básicos primero");
      return;
    }

    try {
      const baseData = {
        employee_id: parseInt(formData.employee_id),
        nombre_horario: formData.nombre_horario,
        hora_inicio_patron: formData.hora_inicio_patron + ":00",
        hora_fin_patron: formData.hora_fin_patron + ":00",
        es_actual: formData.es_actual
      };

      const promises = diasSemana.map(dia => {
        const scheduleData = {
          ...baseData,
          dia_semana: dia.value,
          nombre_horario: `${baseData.nombre_horario} - ${dia.label}`
        };
        return employeeScheduleService.createSchedule(scheduleData);
      });

      await Promise.all(promises);
      console.log("Horarios creados para todos los días");
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error("Error creando horarios para todos los días:", error);
    }
  };

  const getDiaNombre = (dia) => {
    const diaObj = diasSemana.find((d) => d.value === dia);
    return diaObj ? diaObj.label : "N/A";
  };

  // ============================================
  // RENDER PRINCIPAL CON CONTROL DE ACCESO
  // ============================================
  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, mostrar acceso restringido o su horario personal
  if (userRole !== 'admin') {
    return <MiHorarioPersonal />;
    // O si quieres mostrar acceso denegado en lugar del horario personal:
    // return <AccesoDenegado />;
  }

  // ============================================
  // INTERFAZ DE ADMINISTRADOR (tu código original)
  // ============================================
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen">
      <Toaster position="top-right" richColors />

      {/* Encabezado */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Gestión de Horarios
          </h1>
          <p className="text-slate-600 font-medium">
            Administra los turnos y horarios del personal
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 font-semibold px-6 py-2.5 rounded-xl border border-teal-400/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      {/* ... (el resto de tu código original para administradores) */}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Buscar por nombre o ID empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
        <Select value={filterDia} onValueChange={setFilterDia}>
          <SelectTrigger className="border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100">
            <SelectValue placeholder="Filtrar por día" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los días</SelectItem>
            {diasSemana.map((dia) => (
              <SelectItem key={dia.value} value={dia.value.toString()}>
                {dia.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-medium">ID Empleado *</label>
                <Input
                  type="number"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Ej: 123"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium">Nombre del Horario *</label>
                <Input
                  type="text"
                  value={formData.nombre_horario}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_horario: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Ej: Turno Mañana"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium">Día de la Semana *</label>
                <Select
                  value={formData.dia_semana}
                  onValueChange={(v) =>
                    setFormData({ ...formData, dia_semana: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-700 font-medium">Hora Inicio *</label>
                <Input
                  type="time"
                  value={formData.hora_inicio_patron}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hora_inicio_patron: e.target.value
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium">Hora Fin *</label>
                <Input
                  type="time"
                  value={formData.hora_fin_patron}
                  onChange={(e) =>
                    setFormData({ ...formData, hora_fin_patron: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={formData.es_actual}
                  onChange={(e) =>
                    setFormData({ ...formData, es_actual: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <label className="text-slate-700 font-medium">Horario actual</label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 flex-wrap">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
              
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateAllDays}
                  disabled={!formData.employee_id || !formData.nombre_horario || 
                           !formData.hora_inicio_patron || !formData.hora_fin_patron}
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Crear para todos los días
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-slate-300"
              >
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Día</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="w-12 h-12 text-slate-300 mb-2" />
                    <p>No se encontraron horarios</p>
                    <p className="text-sm text-slate-400">
                      {searchTerm || filterDia !== "todos" 
                        ? "Intenta con otros términos de búsqueda" 
                        : "Comienza creando un nuevo horario"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">#{schedule.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="bg-teal-500 text-white h-8 w-8">
                        <AvatarFallback className="bg-teal-500 text-white text-xs">
                          <User className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">ID: {schedule.employee_id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{schedule.nombre_horario}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 text-slate-700">
                      {getDiaNombre(schedule.dia_semana)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {formatTimeForInput(schedule.hora_inicio_patron)} - {formatTimeForInput(schedule.hora_fin_patron)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.es_actual ? (
                      <Badge className="bg-emerald-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-300 text-slate-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                        className="hover:text-teal-600 hover:bg-teal-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(schedule)}
                        className="hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmar eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el horario "{scheduleToDelete?.nombre_horario}" 
              del empleado ID: {scheduleToDelete?.employee_id}.
              <br />
              <span className="text-red-500 font-medium">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}