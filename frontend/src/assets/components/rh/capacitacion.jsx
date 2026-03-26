import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  GraduationCap, BookOpen, Award, Clock, Search, MoreVertical, 
  PlayCircle, CheckCircle2, AlertCircle, Calendar, Users, X, Loader2,
  UtensilsCrossed, ShieldCheck, HeartHandshake, Zap
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"; // Si tienes este componente, úsalo, si no, usaré HTML nativo estilizado

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000"; 

// 🎨 PRESETS DE DISEÑO (Para que se vea bonito y no muerto)
const COURSE_THEMES = [
  {
    id: "seguridad",
    label: "Seguridad & Higiene",
    icon: ShieldCheck,
    color: "text-rose-400",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cocina",
    label: "Técnicas Culinarias",
    icon: UtensilsCrossed,
    color: "text-orange-400",
    image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "servicio",
    label: "Atención al Cliente",
    icon: HeartHandshake,
    color: "text-emerald-400",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "barismo",
    label: "Barismo & Café",
    icon: Zap,
    color: "text-amber-400",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "general",
    label: "Formación General",
    icon: BookOpen,
    color: "text-blue-400",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
  }
];

// ==========================================
// CACHÉ A NIVEL MÓDULO PARA EVITAR RECARGAS
// ==========================================
let capacitacionCache = {
  trainings: null,
  employees: null,
  lastFetchTrainings: 0,
  lastFetchEmployees: 0,
};
const CACHE_TTL = 5 * 60 * 1000;

export default function CapacitacionContent() {
  const [trainings, setTrainings] = useState(capacitacionCache.trainings || []);
  const [employees, setEmployees] = useState(capacitacionCache.employees || []);
  const [loading, setLoading] = useState(!capacitacionCache.trainings);
  const [loadingEmployees, setLoadingEmployees] = useState(!capacitacionCache.employees);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Estados para el formulario
  const [selectedTheme, setSelectedTheme] = useState(COURSE_THEMES[4]); // Default: General
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Empleado seleccionado
  const [newTraining, setNewTraining] = useState({
    employee_id: "",
    nombre_capacitacion: "",
    fecha_asignacion: new Date().toISOString().split('T')[0],
    fecha_limite: "",
  });

  const fetchTrainings = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && capacitacionCache.trainings && (Date.now() - capacitacionCache.lastFetchTrainings < CACHE_TTL)) {
        setTrainings(capacitacionCache.trainings);
        setLoading(false);
        return;
      }
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/rh/training`);
      setTrainings(response.data);
      capacitacionCache.trainings = response.data;
      capacitacionCache.lastFetchTrainings = Date.now();
    } catch (error) {
      console.error("Error al cargar capacitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && capacitacionCache.employees && (Date.now() - capacitacionCache.lastFetchEmployees < CACHE_TTL)) {
        setEmployees(capacitacionCache.employees);
        setLoadingEmployees(false);
        return;
      }
      setLoadingEmployees(true);
      const response = await axios.get(`${API_URL}/api/rh/employees`);
      setEmployees(response.data);
      capacitacionCache.employees = response.data;
      capacitacionCache.lastFetchEmployees = Date.now();
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
    fetchEmployees();
  }, []);

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert("Por favor selecciona un empleado");
      return;
    }
    
    try {
      // Inyectamos la URL de la imagen del tema seleccionado como "certificado_url" o un campo meta si tuvieramos
      // Nota: Como tu backend espera 'certificado_url', podemos usar ese campo para guardar la imagen del curso por ahora
      // O simplemente deducir la imagen en el frontend basado en el nombre, pero guardarla es más seguro.
      
      const payload = {
        employee_id: selectedEmployee.id,
        nombre_capacitacion: newTraining.nombre_capacitacion,
        fecha_asignacion: newTraining.fecha_asignacion,
        fecha_limite: newTraining.fecha_limite || null,
        completado: false,
        certificado_url: selectedTheme.id // Truco: Guardamos el ID del tema en este campo opcional para recuperar la foto luego
      };

      await axios.post(`${API_URL}/api/rh/training`, payload);
      
      setIsModalOpen(false);
      setNewTraining({ ...newTraining, nombre_capacitacion: "", employee_id: "" });
      setSelectedEmployee(null); // Reset empleado seleccionado
      setSelectedTheme(COURSE_THEMES[4]); // Reset
      capacitacionCache.trainings = null; // Invalidate cache
      fetchTrainings(true); // Force API to refresh
    } catch (error) {
      alert("Error al asignar el curso. Verifica los datos.");
      console.error(error);
    }
  };

  // Helper para recuperar el tema visual basado en lo guardado (o default)
  const getTheme = (training) => {
    // Si guardamos el ID del tema en certificado_url, lo buscamos
    const found = COURSE_THEMES.find(t => t.id === training.certificado_url);
    if (found) return found;
    
    // Fallback: Si no hay dato, asignamos aleatorio determinista por ID
    return COURSE_THEMES[training.id % COURSE_THEMES.length];
  };

  const stats = {
    total: trainings.length,
    completados: trainings.filter(t => t.completado).length,
    pendientes: trainings.filter(t => !t.completado).length,
    tasa: trainings.length > 0 
      ? Math.round((trainings.filter(t => t.completado).length / trainings.length) * 100) 
      : 0
  };

  return (
    <div className="p-8 bg-[#0c0e12] min-h-screen font-sans text-gray-200">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit']">
            Centro de Capacitación
          </h1>
          <p className="text-gray-400 font-light">
            Planifica, asigna y monitorea el desarrollo de tu equipo.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchTrainings} className="bg-[#13161C] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Actualizar
          </Button>

          {/* --- MODAL DE CREACIÓN --- */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white hover:from-[#2A9D8F] hover:to-[#1B4F55] border border-white/10 shadow-lg shadow-[#2A9D8F]/20">
                <GraduationCap className="w-4 h-4 mr-2" />
                Crear Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#13161C] border-white/10 text-white sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-['Outfit']">Asignar Capacitación</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateTraining} className="space-y-5 mt-2">
                
                {/* Selector Visual de Tema */}
                <div>
                  <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Categoría Visual</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {COURSE_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                          selectedTheme.id === theme.id 
                            ? "bg-[#2A9D8F]/20 border-[#2A9D8F] text-[#2A9D8F]" 
                            : "bg-black/20 border-white/5 text-gray-500 hover:bg-white/5"
                        }`}
                        title={theme.label}
                      >
                        <theme.icon className="w-5 h-5 mb-1" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#2A9D8F] mt-2 text-center font-medium">{selectedTheme.label}</p>
                </div>

                <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="space-y-2">
                    <Label>Título del Curso</Label>
                    <Input 
                        className="bg-black/40 border-white/10 text-white focus:border-[#2A9D8F]"
                        placeholder="Ej: Manipulación Higiénica de Alimentos"
                        value={newTraining.nombre_capacitacion}
                        onChange={(e) => setNewTraining({...newTraining, nombre_capacitacion: e.target.value})}
                        required
                    />
                    </div>


                    <div className="space-y-2">
                      <Label>Empleado (Asignado a)</Label>
                      <Select 
                        value={selectedEmployee?.id?.toString() || ""} 
                        onValueChange={(value) => {
                          const emp = employees.find(e => e.id === parseInt(value));
                          setSelectedEmployee(emp || null);
                        }}
                      >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white focus:border-[#2A9D8F]">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="Selecciona un empleado..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#13161C] border-white/10 text-white max-h-64">
                          {loadingEmployees ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="animate-spin text-[#2A9D8F] w-5 h-5" />
                            </div>
                          ) : employees.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 text-sm">
                              No hay empleados disponibles
                            </div>
                          ) : (
                            employees.map((emp) => (
                              <SelectItem 
                                key={emp.id} 
                                value={emp.id.toString()}
                                className="hover:bg-white/5 focus:bg-white/10 cursor-pointer"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] text-white text-xs font-bold">
                                      {emp.nombre[0]}{emp.apellido[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {emp.nombre} {emp.apellido}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {emp.puesto}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input 
                      type="date"
                      className="bg-black/20 border-white/10 text-white"
                      value={newTraining.fecha_asignacion}
                      onChange={(e) => setNewTraining({...newTraining, fecha_asignacion: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Límite (Opcional)</Label>
                    <Input 
                      type="date"
                      className="bg-black/20 border-white/10 text-white"
                      value={newTraining.fecha_limite}
                      onChange={(e) => setNewTraining({...newTraining, fecha_limite: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-white/5">Cancelar</Button>
                  <Button type="submit" className="bg-[#2A9D8F] text-white hover:bg-[#2A9D8F]/80">Confirmar Asignación</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- KPIS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard label="Total Asignados" value={stats.total} icon={BookOpen} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        <KPICard label="Completados" value={stats.completados} icon={Award} color="text-[#2A9D8F]" bg="bg-[#2A9D8F]/10" border="border-[#2A9D8F]/20" />
        <KPICard label="Pendientes" value={stats.pendientes} icon={Clock} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
        <KPICard label="Tasa Finalización" value={`${stats.tasa}%`} icon={GraduationCap} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- MAIN CONTENT (GRID DE CURSOS) --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Capacitaciones en Curso</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2A9D8F] w-8 h-8" /></div>
          ) : trainings.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-500 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
               <BookOpen className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-lg font-medium">No hay capacitaciones activas</p>
               <p className="text-sm opacity-60">Asigna un nuevo curso para comenzar.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {trainings.map((course) => {
                const theme = getTheme(course);
                const Icon = theme.icon;
                const progress = course.completado ? 100 : 0; // Simple lógica: 0 o 100 por ahora

                return (
                  <div key={course.id} className="group bg-[#13161C] p-4 rounded-[1.5rem] border border-white/10 hover:border-[#2A9D8F]/30 hover:shadow-lg hover:shadow-[#2A9D8F]/10 transition-all duration-300 flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                    
                    {/* Barra lateral de estado colorida */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${course.completado ? 'bg-[#2A9D8F]' : 'bg-amber-500'}`} />

                    {/* IMAGEN DEL CURSO */}
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden relative shrink-0 shadow-lg">
                      <img src={theme.image} alt="Cover" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                        <Icon className={`w-3 h-3 ${theme.color}`} />
                        <span>{theme.label}</span>
                      </div>
                    </div>

                    {/* INFO PRINCIPAL */}
                    <div className="flex-1 flex flex-col justify-between py-1 z-10">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-[#2A9D8F] transition-colors line-clamp-1">
                            {course.nombre_capacitacion}
                          </h3>
                          {course.completado && <CheckCircle2 className="w-5 h-5 text-[#2A9D8F]" />}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                <Users className="w-3.5 h-3.5" />
                                <span>
                                  {(() => {
                                    const employee = employees.find(emp => emp.id === course.employee_id);
                                    return employee 
                                      ? <span className="text-gray-200 font-medium">{employee.nombre} {employee.apellido}</span>
                                      : <span className="text-gray-200 font-mono">ID: {course.employee_id}</span>;
                                  })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{course.fecha_limite ? `Vence: ${course.fecha_limite}` : 'Sin límite'}</span>
                            </div>
                        </div>
                      </div>

                      {/* ESTADO Y BARRA DE PROGRESO */}
                      <div>
                        <div className="flex justify-between text-xs mb-2 font-medium">
                          <span className={course.completado ? "text-[#2A9D8F]" : "text-amber-500"}>
                             {course.completado ? "Certificado Emitido" : "Pendiente de Finalización"}
                          </span>
                          <span className="text-white/60">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 relative ${course.completado ? 'bg-[#2A9D8F]' : 'bg-amber-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- SIDEBAR (HISTORIAL COMPACTO) --- */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#13161C] rounded-[2rem] border border-white/10 overflow-hidden shadow-lg shadow-black/20">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white font-['Outfit']">Últimos Movimientos</h2>
              </div>
              <Table>
                <TableBody>
                  {trainings.slice(0, 6).map((t) => (
                    <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/5 group">
                      <TableCell className="font-medium text-white py-4">
                          <div className="flex flex-col">
                              <span className="text-sm group-hover:text-[#2A9D8F] transition-colors">{t.nombre_capacitacion}</span>
                              <span className="text-xs text-gray-500">Asignado el {t.fecha_asignacion}</span>
                          </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`w-2 h-2 rounded-full ml-auto ${t.completado ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {trainings.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={2} className="text-center text-gray-500 py-8 text-xs">Sin actividad reciente</TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Banner Decorativo */}
            <div className="bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-[2rem] p-6 text-white shadow-lg shadow-[#2A9D8F]/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold font-['Outfit'] mb-2">Biblioteca Digital</h3>
                <p className="text-teal-100 text-sm mb-6 opacity-90 pr-8">
                    Accede a manuales de procedimiento y guías PDF para tus cursos.
                </p>
                <Button className="w-full bg-white text-[#1B4F55] hover:bg-teal-50 font-bold border-0 shadow-lg translate-y-0 group-hover:-translate-y-1 transition-transform">
                    Explorar Recursos
                </Button>
              </div>
              <BookOpen className="absolute bottom-4 right-4 w-20 h-20 text-white/10 rotate-[-15deg] group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente pequeño de KPI
function KPICard({ label, value, icon: Icon, color, bg, border }) {
  return (
    <div className={`bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-colors`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${border}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white font-['Outfit'] mb-1">{value}</p>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
    </div>
  );
}