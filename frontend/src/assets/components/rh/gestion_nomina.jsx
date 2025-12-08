import { useState, useEffect } from "react";
import { RegistrarEmpleadoForm } from "./registrar_Empleado_form";
import GestionHorariosContent from "./schedule_employee";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert_dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX, 
  Loader2,
  Clock,
  ShieldAlert
} from "lucide-react";
import { Toaster } from "../ui/sonner";
import employeeService from "../../../api/employee_Service";
import { canAccessRH, canManageEmployees, ROLES } from '../../../utils/roles';

export default function GestionNominaContent() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPuesto, setFilterPuesto] = useState("todos");
  const [filterSucursal, setFilterSucursal] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 🔹 NUEVO ESTADO para gestionar horarios
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState(null);

  // 🔐 NUEVO: Estado para permisos del usuario
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});

  // Cargar empleados y permisos del usuario
  useEffect(() => {
    loadUserPermissions();
    loadEmployees();
  }, [refreshTrigger]);

  const loadUserPermissions = () => {
    try {
      // ✅ NUEVO: Busca directamente en localStorage
      const userRole = localStorage.getItem('role') || localStorage.getItem('userRole');
      const roleId = userRole === 'admin' ? ROLES.ADMINISTRADOR : ROLES.MESERO;
      
      console.log('🔍 Debug GestionNomina - Role detectado:', userRole, 'Role ID:', roleId);
      
      setUserRole(roleId);
      setUserPermissions({
        canAccessRH: canAccessRH(roleId),
        canManageEmployees: canManageEmployees(roleId)
      });
    } catch (error) {
      console.error("Error cargando permisos:", error);
      setUserRole(ROLES.MESERO);
      setUserPermissions({
        canAccessRH: false,
        canManageEmployees: false
      });
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      toast.error("Error al cargar los empleados", {
        description: error.message || "No se pudo conectar con el servidor"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empleados
  const filteredEmployees = employees.filter((emp) => {
    const nombreCompleto = `${emp.nombre} ${emp.apellido}`.toLowerCase();
    const matchesSearch =
      nombreCompleto.includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPuesto = filterPuesto === "todos" || emp.puesto?.toLowerCase() === filterPuesto.toLowerCase();
    const matchesSucursal = filterSucursal === "todos" || emp.sucursal?.nombre_sucursal === filterSucursal;
    const matchesEstado = filterEstado === "todos" || 
      (filterEstado === "activo" ? emp.is_active : !emp.is_active);

    return matchesSearch && matchesPuesto && matchesSucursal && matchesEstado;
  });

  const activeCount = employees.filter((emp) => emp.is_active).length;
  const inactiveCount = employees.filter((emp) => !emp.is_active).length;

  // Obtener listas únicas para los filtros
  const uniquePuestos = [...new Set(employees.map(emp => emp.puesto).filter(Boolean))];
  const uniqueSucursales = [...new Set(employees.map(emp => emp.sucursal?.nombre_sucursal).filter(Boolean))];

  const handleNewEmployee = () => {
    if (!userPermissions.canManageEmployees) {
      toast.error("No tienes permisos para crear empleados");
      return;
    }
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    if (!userPermissions.canManageEmployees) {
      toast.error("No tienes permisos para editar empleados");
      return;
    }
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleOpenSchedule = (employee) => {
    setSelectedEmployeeForSchedule(employee);
    setIsScheduleModalOpen(true);
  };

  const handleSaveEmployee = async (data) => {
    try {
      if (selectedEmployee) {
        await employeeService.updateEmployee(selectedEmployee.id, data);
        toast.success("Empleado actualizado correctamente");
      } else {
        await employeeService.createEmployee(data);
        toast.success("Empleado registrado correctamente");
      }
      setIsModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error guardando empleado:', error);
      toast.error("Error al guardar el empleado", {
        description: error.message
      });
    }
  };

  const handleDeleteClick = (employee) => {
    if (!userPermissions.canManageEmployees) {
      toast.error("No tienes permisos para eliminar empleados");
      return;
    }
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await employeeService.deleteEmployee(employeeToDelete.id);
        toast.success("Empleado eliminado correctamente");
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error eliminando empleado:', error);
        toast.error("Error al eliminar el empleado", {
          description: error.message
        });
      }
    }
  };

  const handleViewEmployee = (employee) => {
    toast.info(`Ver detalles de ${employee.nombre} ${employee.apellido}`);
  };

  if (!userPermissions.canAccessRH) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#0c0e12]">
        <div className="text-center max-w-md">
          <div className="bg-[#13161C] rounded-[2rem] border border-red-900/50 p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/20 mb-6 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-['Outfit']">Acceso Restringido</h2>
            <p className="text-gray-400 mb-4 font-light">
              No tienes permisos para acceder al módulo de Recursos Humanos.
            </p>
            <div className="bg-[#0c0e12] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-500 font-medium">
                Si necesitas acceso, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0c0e12] min-h-screen text-gray-200 font-sans">
      
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit']">
              Gestión de Empleados
            </h1>
            <p className="text-gray-400 font-light">
              Administra la información del personal de tu restaurante
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={`border font-semibold ${
                  userRole === ROLES.ADMINISTRADOR 
                    ? "border-[#2A9D8F]/30 bg-[#2A9D8F]/10 text-[#2A9D8F]" 
                    : "border-gray-700 bg-gray-800 text-gray-400"
                }`}
              >
                {userRole === ROLES.ADMINISTRADOR ? "Administrador" : "Mesero"}
              </Badge>
              {userRole === ROLES.ADMINISTRADOR && (
                <span className="text-xs text-[#2A9D8F] font-medium">✓ Acceso completo</span>
              )}
            </div>
          </div>
          
          {userPermissions.canManageEmployees ? (
            <Button 
              onClick={handleNewEmployee} 
              className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:from-[#2A9D8F] hover:to-[#1B4F55] text-white shadow-lg shadow-[#2A9D8F]/20 hover:shadow-[#2A9D8F]/40 transition-all duration-300 font-bold px-6 py-6 rounded-xl border border-white/10"
            >
              <Plus className="w-5 h-5 mr-2" /> 
              Nuevo Empleado
            </Button>
          ) : (
            <Button 
              disabled
              className="bg-[#13161C] text-gray-500 cursor-not-allowed font-semibold px-6 py-6 rounded-xl border border-white/10"
            >
              <Plus className="w-5 h-5 mr-2" /> 
              Nuevo Empleado
            </Button>
          )}
        </div>
        
        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-[#13161C] rounded-[2rem] border border-white/10 p-6 shadow-lg shadow-black/20 hover:shadow-[0_0_20px_rgba(42,157,143,0.15)] hover:border-[#2A9D8F]/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/5 rounded-xl group-hover:bg-[#2A9D8F]/20 transition-all duration-300 border border-white/10">
                <Users className="w-7 h-7 text-gray-400 group-hover:text-[#2A9D8F] transition-colors duration-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Empleados</p>
                <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : employees.length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-[#13161C] rounded-[2rem] border border-white/10 p-6 shadow-lg shadow-black/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-all duration-300 border border-emerald-500/20">
                <UserCheck className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Activos</p>
                <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : activeCount}</p>
              </div>
            </div>
          </div>

          <div className="group bg-[#13161C] rounded-[2rem] border border-white/10 p-6 shadow-lg shadow-black/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-all duration-300 border border-rose-500/20">
                <UserX className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inactivos</p>
                <p className="text-3xl font-bold text-white font-['Outfit']">{loading ? "-" : inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#13161C] rounded-[2rem] border border-white/10 p-6 shadow-lg shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0c0e12] border-white/10 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] transition-all duration-200 rounded-xl h-11 font-medium text-white placeholder:text-gray-600"
              />
            </div>

            {/* 🔥 CORRECCIÓN SELECTOR 1: PUESTO */}
            <Select value={filterPuesto} onValueChange={setFilterPuesto}>
              <SelectTrigger className="bg-[#13161C] border-white/10 text-white focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] transition-all duration-200 rounded-xl h-11 font-medium">
                <SelectValue placeholder="Puesto" />
              </SelectTrigger>
              <SelectContent className="bg-[#13161C] border-white/10 text-gray-200 shadow-xl z-50">
                <SelectItem value="todos" className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">Todos los puestos</SelectItem>
                {uniquePuestos.map((puesto) => (
                  <SelectItem key={puesto} value={puesto} className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">{puesto}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 🔥 CORRECCIÓN SELECTOR 2: SUCURSAL */}
            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger className="bg-[#13161C] border-white/10 text-white focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] transition-all duration-200 rounded-xl h-11 font-medium">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent className="bg-[#13161C] border-white/10 text-gray-200 shadow-xl z-50">
                <SelectItem value="todos" className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">Todas las sucursales</SelectItem>
                {uniqueSucursales.map((sucursal) => (
                  <SelectItem key={sucursal} value={sucursal} className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">{sucursal}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 🔥 CORRECCIÓN SELECTOR 3: ESTADO */}
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="bg-[#13161C] border-white/10 text-white focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] transition-all duration-200 rounded-xl h-11 font-medium">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#13161C] border-white/10 text-gray-200 shadow-xl z-50">
                <SelectItem value="todos" className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">Todos los estados</SelectItem>
                <SelectItem value="activo" className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">Activo</SelectItem>
                <SelectItem value="inactivo" className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer hover:bg-white/5 hover:text-white">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#13161C] rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 overflow-hidden min-h-[400px]">
        <Table>
          {/* 🔥 CORRECCIÓN HEADER: Fondo oscuro fijo */}
          <TableHeader className="bg-[#13161C]">
            <TableRow className="bg-[#13161C] hover:bg-[#13161C] border-b border-white/10">
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider py-5 pl-4">Foto</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Nombre Completo</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Puesto</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Rol</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Sucursal</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Fecha de Ingreso</TableHead>
              <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right font-bold text-gray-400 text-xs uppercase tracking-wider pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow className="hover:bg-transparent">
                 <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <Loader2 className="h-10 w-10 text-[#2A9D8F] animate-spin" />
                       <p className="text-gray-500 text-sm font-medium">Sincronizando empleados...</p>
                    </div>
                 </TableCell>
               </TableRow>
            ) : filteredEmployees.length === 0 ? (
               <TableRow className="hover:bg-transparent">
                 <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <Users className="w-8 h-8 text-gray-600" />
                       </div>
                       <p className="text-gray-400 font-medium">No se encontraron empleados</p>
                    </div>
                 </TableCell>
               </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                // 🔥 CORRECCIÓN FILA: Se eliminó el fondo blanco predeterminado. Ahora es transparente/gris oscuro
                <TableRow key={employee.id} className="bg-transparent hover:bg-white/5 border-b border-white/5 transition-colors duration-150">
                  <TableCell className="py-4 pl-4">
                    <Avatar className="w-11 h-11 border-2 border-[#2A9D8F]/50 shadow-sm">
                      <AvatarImage src={employee.foto} alt={`${employee.nombre} ${employee.apellido}`} />
                      <AvatarFallback className="bg-[#1B4F55] text-[#2A9D8F] font-bold text-sm">
                        {employee.nombre?.[0]}{employee.apellido?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <p className="font-bold text-white">{employee.nombre} {employee.apellido}</p>
                      <p className="text-sm text-gray-500 font-medium">{employee.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-300 py-4">{employee.puesto}</TableCell>
                  <TableCell className="font-medium text-gray-300 py-4">
                    {employee.role?.rol || employee.rol?.rol}
                  </TableCell>
                  <TableCell className="font-medium text-gray-300 py-4">
                    {employee.sucursal?.nombre_sucursal}
                  </TableCell>
                  <TableCell className="font-medium text-gray-300 py-4">
                    {employee.fecha_ingreso &&
                      new Date(employee.fecha_ingreso).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={employee.is_active ? "default" : "secondary"}
                      className={
                        employee.is_active
                          ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-3 py-1.5 rounded-lg shadow-sm"
                          : "bg-gray-700/50 text-gray-400 font-bold border border-gray-600 px-3 py-1.5 rounded-lg shadow-sm"
                      }
                    >
                      {employee.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenSchedule(employee)}
                        className="hover:bg-[#2A9D8F]/20 hover:text-[#2A9D8F] text-gray-400 transition-all duration-200 rounded-lg"
                        title="Gestionar horarios"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewEmployee(employee)}
                        className="hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 transition-all duration-200 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {userPermissions.canManageEmployees ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEmployee(employee)}
                            className="hover:bg-amber-500/20 hover:text-amber-400 text-gray-400 transition-all duration-200 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(employee)}
                            className="hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all duration-200 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            className="text-gray-700 cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            className="text-gray-700 cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 flex items-center justify-between bg-[#0c0e12]/50">
            <p className="text-sm font-semibold text-gray-500">
              Mostrando <span className="text-[#2A9D8F]">{filteredEmployees.length}</span> de <span className="text-[#2A9D8F]">{employees.length}</span> empleados
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="text-gray-600 border-white/10 bg-transparent rounded-lg font-semibold cursor-not-allowed">
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-[#2A9D8F] text-white border-[#2A9D8F] font-bold rounded-lg shadow-sm hover:bg-[#1B4F55] transition-all duration-200">
                1
              </Button>
              <Button variant="outline" size="sm" disabled className="text-gray-600 border-white/10 bg-transparent rounded-lg font-semibold cursor-not-allowed">
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales y Dialogs (Se mantienen igual, solo fondo ajustado en contenedor si era necesario) */}
      {isModalOpen && userPermissions.canManageEmployees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-[#13161C] rounded-[2rem] shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden border border-white/10">
            <button
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-[#0c0e12] rounded-xl p-2 shadow-lg border border-white/10 transition-all duration-200"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto max-h-[90vh]">
              <RegistrarEmpleadoForm 
                onSuccess={handleSaveEmployee}
                onCancel={() => setIsModalOpen(false)}
                employee={selectedEmployee}
              />
            </div>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsScheduleModalOpen(false)}
          ></div>

          <div className="relative bg-[#13161C] rounded-[2rem] shadow-2xl w-full max-w-7xl transform transition-all duration-300 scale-100 max-h-[95vh] overflow-hidden border border-white/10">
            <button
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-[#0c0e12] rounded-xl p-2 shadow-lg border border-white/10 transition-all duration-200"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto max-h-[95vh]">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2 font-['Outfit']">
                  Horarios de {selectedEmployeeForSchedule?.nombre} {selectedEmployeeForSchedule?.apellido}
                </h2>
                <p className="text-gray-400 mb-6 font-light">
                  Gestiona los turnos y horarios del empleado
                </p>
                <GestionHorariosContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && userPermissions.canManageEmployees && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-[2rem] border-white/10 bg-[#13161C] shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-white font-['Outfit']">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-400 font-light">
                Esta acción no se puede deshacer. El empleado{" "}
                <span className="font-bold text-white">
                  {employeeToDelete?.nombre} {employeeToDelete?.apellido}
                </span>{" "}
                será eliminado permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl bg-transparent">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 font-bold shadow-lg shadow-red-600/20 rounded-xl border border-white/10"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Toaster />
    </div>
  );
}