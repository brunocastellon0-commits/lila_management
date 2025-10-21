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
  Clock 
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
    // 🔐 VERIFICAR PERMISO
    if (!userPermissions.canManageEmployees) {
      toast.error("No tienes permisos para crear empleados");
      return;
    }
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    // 🔐 VERIFICAR PERMISO
    if (!userPermissions.canManageEmployees) {
      toast.error("No tienes permisos para editar empleados");
      return;
    }
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // 🔹 NUEVA FUNCIÓN para abrir horarios
  const handleOpenSchedule = (employee) => {
    setSelectedEmployeeForSchedule(employee);
    setIsScheduleModalOpen(true);
  };

  const handleSaveEmployee = async (data) => {
    try {
      if (selectedEmployee) {
        // Actualizar empleado existente
        await employeeService.updateEmployee(selectedEmployee.id, data);
        toast.success("Empleado actualizado correctamente");
      } else {
        // Crear nuevo empleado
        await employeeService.createEmployee(data);
        toast.success("Empleado registrado correctamente");
      }
      
      setIsModalOpen(false);
      setRefreshTrigger(prev => prev + 1); // Recargar la lista
    } catch (error) {
      console.error('Error guardando empleado:', error);
      toast.error("Error al guardar el empleado", {
        description: error.message
      });
    }
  };

  const handleDeleteClick = (employee) => {
    // 🔐 VERIFICAR PERMISO
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
        setRefreshTrigger(prev => prev + 1); // Recargar la lista
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

  // 🔐 PANTALLA DE ACCESO DENEGADO
  if (!userPermissions.canAccessRH) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl border border-rose-200/60 p-8 shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
              <div className="text-rose-500 text-2xl">🚫</div>
            </div>
            <h2 className="text-2xl font-bold text-rose-700 mb-3">Acceso Restringido</h2>
            <p className="text-rose-600 mb-4 font-medium">
              No tienes permisos para acceder al módulo de Recursos Humanos.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Este módulo está disponible solo para administradores del sistema.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 font-medium">
                Si necesitas acceso, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-teal-500 absolute"></div>
          </div>
          <p className="text-slate-600 font-semibold text-xl">Cargando empleados...</p>
          <p className="text-slate-400 text-sm mt-2">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Gestión de Empleados
            </h1>
            <p className="text-slate-600 font-medium">
              Administra la información del personal de tu restaurante
            </p>
            {/* 🔐 INDICADOR DE ROL */}
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={`border font-semibold ${
                  userRole === ROLES.ADMINISTRADOR 
                    ? "border-teal-200 bg-teal-50 text-teal-700" 
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {userRole === ROLES.ADMINISTRADOR ? "Administrador" : "Mesero"}
              </Badge>
              {userRole === ROLES.ADMINISTRADOR && (
                <span className="text-xs text-teal-600 font-medium">✓ Acceso completo</span>
              )}
            </div>
          </div>
          
          {/* 🔐 BOTÓN CONDICIONAL */}
          {userPermissions.canManageEmployees ? (
            <Button 
              onClick={handleNewEmployee} 
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 font-semibold px-6 py-2.5 rounded-xl border border-teal-400/20"
            >
              <Plus className="w-4 h-4 mr-2" /> 
              Nuevo Empleado
            </Button>
          ) : (
            <Button 
              disabled
              className="bg-slate-300 text-slate-500 cursor-not-allowed font-semibold px-6 py-2.5 rounded-xl border border-slate-200"
            >
              <Plus className="w-4 h-4 mr-2" /> 
              Nuevo Empleado
            </Button>
          )}
        </div>
        
        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl group-hover:from-teal-50 group-hover:to-teal-100/50 transition-all duration-300 border border-slate-200/50">
                <Users className="w-7 h-7 text-slate-700 group-hover:text-teal-600 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Empleados</p>
                <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl group-hover:shadow-md group-hover:shadow-emerald-200/50 transition-all duration-300 border border-emerald-200/50">
                <UserCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Activos</p>
                <p className="text-3xl font-bold text-slate-900">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl group-hover:shadow-md group-hover:shadow-rose-200/50 transition-all duration-300 border border-rose-200/50">
                <UserX className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Inactivos</p>
                <p className="text-3xl font-bold text-slate-900">{inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50/50 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200 rounded-xl h-11 font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <Select value={filterPuesto} onValueChange={setFilterPuesto}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200 rounded-xl h-11 font-medium text-slate-700">
                <SelectValue placeholder="Puesto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los puestos</SelectItem>
                {uniquePuestos.map((puesto) => (
                  <SelectItem key={puesto} value={puesto}>{puesto}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200 rounded-xl h-11 font-medium text-slate-700">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las sucursales</SelectItem>
                {uniqueSucursales.map((sucursal) => (
                  <SelectItem key={sucursal} value={sucursal}>{sucursal}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200 rounded-xl h-11 font-medium text-slate-700">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-teal-50/30 hover:from-slate-50 hover:to-teal-50/30 border-b border-slate-200">
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Foto</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Nombre Completo</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Puesto</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Rol</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Sucursal</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Fecha de Ingreso</TableHead>
              <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-right font-bold text-slate-800 text-xs uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-teal-50/30 border-slate-100 transition-colors duration-150">
                <TableCell className="py-4">
                  <Avatar className="w-11 h-11 border-2 border-teal-100 shadow-sm">
                    <AvatarImage src={employee.foto} alt={`${employee.nombre} ${employee.apellido}`} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 font-bold text-sm">
                      {employee.nombre?.[0]}{employee.apellido?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <p className="font-bold text-slate-900">{employee.nombre} {employee.apellido}</p>
                    <p className="text-sm text-slate-500 font-medium">{employee.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-slate-700 py-4">{employee.puesto}</TableCell>
                <TableCell className="font-semibold text-slate-700 py-4">
                  {employee.role?.rol || employee.rol?.rol}
                </TableCell>
                <TableCell className="font-semibold text-slate-700 py-4">
                  {employee.sucursal?.nombre_sucursal}
                </TableCell>
                <TableCell className="font-semibold text-slate-700 py-4">
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
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
                    }
                  >
                    {employee.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-end gap-2">
                    {/* 🔹 BOTÓN PARA HORARIOS (SIEMPRE DISPONIBLE) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenSchedule(employee)}
                      className="hover:bg-purple-50 hover:text-purple-700 text-slate-500 transition-all duration-200 rounded-lg"
                      title="Gestionar horarios"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewEmployee(employee)}
                      className="hover:bg-teal-50 hover:text-teal-700 text-slate-500 transition-all duration-200 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {/* 🔐 BOTONES CONDICIONALES */}
                    {userPermissions.canManageEmployees ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                          className="hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-all duration-200 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(employee)}
                          className="hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-all duration-200 rounded-lg"
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
                          className="text-slate-300 cursor-not-allowed"
                          title="Sin permisos para editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="text-slate-300 cursor-not-allowed"
                          title="Sin permisos para eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-700 mb-1">No se encontraron empleados</p>
            <p className="text-sm text-slate-500 font-medium">
              {employees.length === 0 
                ? "Comienza agregando tu primer empleado"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        )}

        {/* Paginación */}
        {filteredEmployees.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">
              Mostrando <span className="text-teal-600">{filteredEmployees.length}</span> de <span className="text-teal-600">{employees.length}</span> empleados
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="text-slate-500 border-slate-200 rounded-lg font-semibold">
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-teal-600 to-teal-500 text-white border-teal-500 font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                1
              </Button>
              <Button variant="outline" size="sm" disabled className="text-slate-500 border-slate-200 rounded-lg font-semibold">
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de empleado - 🔐 SOLO SI TIENE PERMISOS */}
      {isModalOpen && userPermissions.canManageEmployees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden border border-slate-200">
            <button
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 bg-white rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar"
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

      {/* 🔹 MODAL PARA HORARIOS (SIEMPRE DISPONIBLE) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsScheduleModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl transform transition-all duration-300 scale-100 max-h-[95vh] overflow-hidden border border-slate-200">
            <button
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 bg-white rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200"
              onClick={() => setIsScheduleModalOpen(false)}
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto max-h-[95vh]">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Horarios de {selectedEmployeeForSchedule?.nombre} {selectedEmployeeForSchedule?.apellido}
                </h2>
                <p className="text-slate-600 mb-6">
                  Gestiona los turnos y horarios del empleado
                </p>
                <GestionHorariosContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de eliminación - 🔐 SOLO SI TIENE PERMISOS */}
      {deleteDialogOpen && userPermissions.canManageEmployees && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600 font-medium">
                Esta acción no se puede deshacer. El empleado{" "}
                <span className="font-bold text-slate-900">
                  {employeeToDelete?.nombre} {employeeToDelete?.apellido}
                </span>{" "}
                será eliminado permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 font-bold shadow-lg shadow-rose-500/30 rounded-xl"
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