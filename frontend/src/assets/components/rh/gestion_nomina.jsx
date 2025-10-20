import { useState, useEffect } from "react";
import { RegistrarEmpleadoForm } from "../rh/registrar_Empleado_form";
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
import { Search, Plus, Edit, Eye, Trash2, Users, UserCheck, UserX } from "lucide-react";
import { Toaster } from "../ui/sonner";


export default function GestionNominaContent() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCargo, setFilterCargo] = useState("todos");
  const [filterSucursal, setFilterSucursal] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // TODO: Integrar con backend para obtener empleados
  useEffect(() => {
    // Datos de ejemplo para pruebas
    const mockEmployees = [
      {
        id: 1,
        nombre: "Juan",
        apellido: "Pérez",
        nombreCompleto: "Juan Pérez",
        ci: "12345678",
        cargo: "Chef",
        sucursal: "Centro",
        fechaIngreso: "2024-01-15",
        estado: "activo",
        foto: null,
      },
      {
        id: 2,
        nombre: "María",
        apellido: "García",
        nombreCompleto: "María García",
        ci: "87654321",
        cargo: "Mesero",
        sucursal: "Zona Norte",
        fechaIngreso: "2024-02-20",
        estado: "activo",
        foto: null,
      },
      {
        id: 3,
        nombre: "Carlos",
        apellido: "López",
        nombreCompleto: "Carlos López",
        ci: "45678912",
        cargo: "Cajero",
        sucursal: "Centro",
        fechaIngreso: "2023-11-10",
        estado: "inactivo",
        foto: null,
      },
    ];
    
    setEmployees(mockEmployees);

    // Descomentar cuando tengas el backend
    // fetch("/api/empleados")
    //   .then(res => res.json())
    //   .then(data => setEmployees(data))
    //   .catch(err => console.error(err));
  }, []);

  // Filtrar empleados
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.ci?.includes(searchTerm);
    const matchesCargo = filterCargo === "todos" || emp.cargo?.toLowerCase() === filterCargo;
    const matchesSucursal = filterSucursal === "todos" || emp.sucursal === filterSucursal;
    const matchesEstado = filterEstado === "todos" || emp.estado === filterEstado;

    return matchesSearch && matchesCargo && matchesSucursal && matchesEstado;
  });

  const activeCount = employees.filter((emp) => emp.estado === "activo").length;
  const inactiveCount = employees.filter((emp) => emp.estado === "inactivo").length;

  const handleNewEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (data) => {
    // El formulario ya maneja el guardado con el backend
    // Solo necesitamos agregar a la lista local si tiene éxito
    const newEmployee = {
      id: employees.length + 1,
      nombre: data.nombre,
      apellido: data.apellido,
      nombreCompleto: `${data.nombre} ${data.apellido}`,
      ci: data.ci || "N/A",
      cargo: data.puesto,
      sucursal: data.sucursal_id || "N/A",
      fechaIngreso: data.fecha_ingreso,
      estado: "activo",
      foto: null,
    };
    setEmployees([...employees, newEmployee]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Integrar con backend DELETE
    if (employeeToDelete) {
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete));
      toast.success("Empleado eliminado correctamente");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleViewEmployee = (employee) => {
    toast.info(`Ver detalles de ${employee.nombreCompleto}`);
  };

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
            <p className="text-gray-600">Administra la información del personal de tu restaurante</p>
          </div>
          <Button onClick={handleNewEmployee} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> Nuevo empleado
          </Button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCargo} onValueChange={setFilterCargo}>
              <SelectTrigger>
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los cargos</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
                <SelectItem value="cocinero">Cocinero</SelectItem>
                <SelectItem value="mesero">Mesero</SelectItem>
                <SelectItem value="cajero">Cajero</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSucursal} onValueChange={setFilterSucursal}>
              <SelectTrigger>
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las sucursales</SelectItem>
                <SelectItem value="Centro">Centro</SelectItem>
                <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                <SelectItem value="Centro Comercial">Centro Comercial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Foto</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-gray-50">
                <TableCell>
                  <Avatar>
                    <AvatarImage src={employee.foto} alt={employee.nombreCompleto} />
                    <AvatarFallback>
                      {employee.nombre?.[0]}{employee.apellido?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.nombreCompleto}</p>
                    <p className="text-sm text-gray-500">CI: {employee.ci}</p>
                  </div>
                </TableCell>
                <TableCell>{employee.cargo}</TableCell>
                <TableCell>{employee.sucursal}</TableCell>
                <TableCell>
                  {employee.fechaIngreso &&
                    new Date(employee.fechaIngreso).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={employee.estado === "activo" ? "default" : "secondary"}
                    className={
                      employee.estado === "activo"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }
                  >
                    {employee.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewEmployee(employee)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEmployee(employee)}
                      className="hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(employee.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron empleados</p>
            <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Registrar Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay oscuro */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Contenedor del modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden">
            {/* Botón cerrar */}
            <button
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 bg-white rounded-full p-1 shadow-sm hover:shadow-md transition"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Formulario con scroll interno */}
            <div className="overflow-y-auto max-h-[90vh]">
              <RegistrarEmpleadoForm 
                onSuccess={handleSaveEmployee}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialog de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}