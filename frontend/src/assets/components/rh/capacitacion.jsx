import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock, 
  Search, 
  MoreVertical, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Users
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Datos Mock para el diseño
const kpis = [
  { label: "Cursos Activos", value: "12", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "Certificaciones", value: "85", icon: Award, color: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]/10", border: "border-[#2A9D8F]/20" },
  { label: "Horas Formación", value: "320h", icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { label: "Tasa Finalización", value: "94%", icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

const activeCourses = [
  {
    id: 1,
    title: "Seguridad Alimentaria Básica",
    category: "Cumplimiento",
    progress: 75,
    totalModules: 8,
    completedModules: 6,
    image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80",
    dueDate: "15 Oct",
  },
  {
    id: 2,
    title: "Arte Latte & Barismo Avanzado",
    category: "Habilidades",
    progress: 30,
    totalModules: 12,
    completedModules: 4,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    dueDate: "20 Oct",
  },
  {
    id: 3,
    title: "Atención al Cliente Premium",
    category: "Servicio",
    progress: 0,
    totalModules: 5,
    completedModules: 0,
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80",
    dueDate: "30 Oct",
  }
];

const upcomingSessions = [
  { id: 1, title: "Taller de Cata de Café", date: "12 Oct", time: "15:00", trainer: "Carlos M.", attendees: 8 },
  { id: 2, title: "Protocolo de Seguridad", date: "14 Oct", time: "09:00", trainer: "Ana R.", attendees: 12 },
];

const certifications = [
  { id: 1, employee: "Juan Pérez", role: "Barista", cert: "Manipulación de Alimentos", status: "valid", expiry: "Dic 2025" },
  { id: 2, employee: "Maria Garcia", role: "Chef", cert: "Seguridad Industrial", status: "expiring", expiry: "Nov 2024" },
  { id: 3, employee: "Carlos Ruiz", role: "Mesero", cert: "Atención al Cliente", status: "valid", expiry: "Ene 2026" },
];

export default function CapacitacionContent() {
  const [activeTab, setActiveTab] = useState("mis-cursos"); // "mis-cursos" | "catalogo" | "gestion"

  return (
    <div className="p-8 bg-[#0c0e12] min-h-screen font-sans text-gray-200">
      
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit']">
            Centro de Capacitación
          </h1>
          <p className="text-gray-400 font-light">
            Desarrollo profesional y certificaciones del equipo
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#13161C] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
            <BookOpen className="w-4 h-4 mr-2" />
            Catálogo
          </Button>
          <Button className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white hover:from-[#2A9D8F] hover:to-[#1B4F55] border border-white/10 shadow-lg shadow-[#2A9D8F]/20">
            <GraduationCap className="w-4 h-4 mr-2" />
            Asignar Curso
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.border}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5`}>
                Mensual
              </span>
            </div>
            <p className="text-3xl font-bold text-white font-['Outfit'] mb-1">{kpi.value}</p>
            <p className="text-sm text-gray-400 font-medium">{kpi.label}</p>
            
            {/* Decoración Hover */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${kpi.bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Principal (Cursos) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Sección: Mis Cursos Activos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-['Outfit']">En Progreso</h2>
              <button className="text-sm text-[#2A9D8F] hover:text-white transition-colors">Ver todo</button>
            </div>
            
            <div className="space-y-4">
              {activeCourses.map((course) => (
                <div key={course.id} className="group bg-[#13161C] p-4 rounded-[1.5rem] border border-white/10 hover:border-[#2A9D8F]/30 hover:shadow-lg hover:shadow-[#2A9D8F]/10 transition-all duration-300 flex flex-col sm:flex-row gap-5">
                  {/* Thumbnail del curso */}
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-2 left-2">
                       <Badge className="bg-black/60 backdrop-blur border border-white/10 text-white text-[10px]">
                         {course.category}
                       </Badge>
                    </div>
                  </div>

                  {/* Info del curso */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#2A9D8F] transition-colors mb-1">{course.title}</h3>
                        <button className="text-gray-500 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Vence: {course.dueDate}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2 font-medium">
                        <span className="text-gray-300">{course.completedModules}/{course.totalModules} Módulos</span>
                        <span className="text-[#2A9D8F]">{course.progress}%</span>
                      </div>
                      {/* Barra de Progreso Custom */}
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] rounded-full transition-all duration-500 relative"
                          style={{ width: `${course.progress}%` }}
                        >
                           <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 blur-[2px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de Acción */}
                  <div className="flex items-center sm:self-center">
                     <Button size="icon" className="rounded-full w-12 h-12 bg-white/5 border border-white/10 text-white hover:bg-[#2A9D8F] hover:border-[#2A9D8F] transition-all group/btn">
                        <PlayCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección: Certificaciones de Equipo */}
          <div className="bg-[#13161C] rounded-[2rem] border border-white/10 overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
               <h2 className="text-lg font-bold text-white font-['Outfit']">Certificaciones del Equipo</h2>
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                 <Input className="pl-9 h-9 w-64 bg-[#0c0e12] border-white/10 text-sm" placeholder="Buscar empleado..." />
               </div>
            </div>
            <Table>
              <TableHeader className="bg-[#0c0e12]/50">
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-bold">Empleado</TableHead>
                  <TableHead className="text-gray-400 font-bold">Certificación</TableHead>
                  <TableHead className="text-gray-400 font-bold">Estado</TableHead>
                  <TableHead className="text-gray-400 font-bold text-right">Vencimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((cert) => (
                  <TableRow key={cert.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-white/10">
                          <AvatarFallback className="bg-[#1B4F55] text-[#2A9D8F] text-xs">{cert.employee.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{cert.employee}</p>
                          <p className="text-xs text-gray-500">{cert.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{cert.cert}</TableCell>
                    <TableCell>
                      {cert.status === 'valid' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Vigente</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">Por Vencer</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-gray-400 font-mono text-xs">{cert.expiry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </div>

        {/* Columna Lateral (Agenda y Accesos) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Próximas Sesiones */}
          <Card className="border-0 bg-transparent shadow-none p-0">
             <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-white font-['Outfit']">Agenda Semanal</h3>
                <Calendar className="w-5 h-5 text-[#2A9D8F]" />
             </div>
             <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-[#13161C] p-4 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#2A9D8F]/30 transition-all">
                     <div className="absolute top-0 left-0 w-1 h-full bg-[#2A9D8F]" />
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 px-2 py-1 rounded-md border border-[#2A9D8F]/20">
                           {session.date} • {session.time}
                        </span>
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#13161C]" />
                           ))}
                        </div>
                     </div>
                     <h4 className="font-bold text-white group-hover:text-[#2A9D8F] transition-colors">{session.title}</h4>
                     <p className="text-xs text-gray-500 mt-1">Instructor: {session.trainer}</p>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 py-6 rounded-2xl">
                   <Users className="w-4 h-4 mr-2" /> Agendar Nueva Sesión
                </Button>
             </div>
          </Card>

          {/* Accesos Rápidos */}
          <div className="bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-[2rem] p-6 text-white shadow-lg shadow-[#2A9D8F]/20 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-bold font-['Outfit'] mb-2">Biblioteca Digital</h3>
                <p className="text-teal-100 text-sm mb-6 opacity-90">Accede a manuales, recetas y videos de entrenamiento.</p>
                <Button className="w-full bg-white text-[#1B4F55] hover:bg-teal-50 font-bold border-0 shadow-lg">
                   Explorar Recursos
                </Button>
             </div>
             {/* Decoración fondo */}
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
             <BookOpen className="absolute bottom-4 right-4 w-16 h-16 text-white/20 rotate-[-15deg]" />
          </div>

        </div>
      </div>
    </div>
  );
}