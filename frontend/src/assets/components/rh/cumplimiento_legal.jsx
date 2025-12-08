import React, { useState } from "react";
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CalendarDays, 
  Download, 
  MoreVertical, 
  Scale, 
  CheckCircle2, 
  Clock,
  Siren,
  Building
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress"; // Asumiendo que tienes este componente, si no, usaré un div simple
import { Card } from "../ui/card";

// Datos Mock
const licenses = [
  {
    id: 1,
    title: "Licencia de Funcionamiento",
    entity: "Gobierno Municipal",
    status: "active",
    progress: 85, // % de tiempo restante
    daysLeft: 320,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80",
    color: "emerald"
  },
  {
    id: 2,
    title: "Certificado de Bomberos",
    entity: "Unidad de Bomberos",
    status: "warning",
    progress: 15,
    daysLeft: 45,
    image: "https://images.unsplash.com/photo-1599689018243-7bb664eb25b6?auto=format&fit=crop&w=500&q=80",
    color: "amber"
  },
  {
    id: 3,
    title: "Carnet Sanitario (Personal)",
    entity: "SEDES",
    status: "critical",
    progress: 5,
    daysLeft: 12,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80",
    color: "rose"
  },
  {
    id: 4,
    title: "Licencia de Expendio de Alcohol",
    entity: "Dirección de Ingresos",
    status: "active",
    progress: 60,
    daysLeft: 180,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80",
    color: "blue"
  }
];

const audits = [
  { id: 1, title: "Inspección Sanitaria", date: "15 Oct 2025", status: "Pendiente", auditor: "Dr. Mamani" },
  { id: 2, title: "Revisión Extintores", date: "01 Nov 2025", status: "Agendado", auditor: "Sgto. Pérez" },
];

export default function CumplimientoLegalContent() {
  return (
    <div className="p-8 bg-[#0c0e12] min-h-screen font-sans text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-['Outfit'] flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#2A9D8F]" />
            Cumplimiento Legal
          </h1>
          <p className="text-gray-400 font-light">
            Gestión de licencias, permisos y normativas sanitarias.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#13161C] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Reporte General
          </Button>
          <Button className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white hover:from-[#2A9D8F] hover:to-[#1B4F55] border border-white/10 shadow-lg shadow-[#2A9D8F]/20">
            <FileCheck className="w-4 h-4 mr-2" />
            Nueva Licencia
          </Button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Métricas y Auditorías (4 columnas) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Tarjeta de Riesgo General */}
          <div className="bg-[#13161C] rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden text-center group">
             {/* Fondo gradiente dinámico */}
             <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
             
             <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Nivel de Cumplimiento</h3>
                
                {/* Visualizador Circular (Score) */}
                <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="44" className="text-[#2A9D8F] drop-shadow-[0_0_10px_rgba(42,157,143,0.5)]" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white font-['Outfit']">90%</span>
                      <span className="text-xs text-emerald-400 font-bold uppercase">Seguro</span>
                   </div>
                </div>

                <p className="text-sm text-gray-400 px-4">
                   Tu restaurante cumple con la mayoría de las normativas vigentes.
                </p>
             </div>
          </div>

          {/* Próximas Auditorías */}
          <div className="bg-[#13161C] rounded-[2rem] border border-white/10 shadow-lg p-6">
             <div className="flex items-center gap-2 mb-6">
                <Siren className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-white font-['Outfit']">Próximas Inspecciones</h3>
             </div>
             
             <div className="space-y-4">
                {audits.map((audit) => (
                   <div key={audit.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all group">
                      <div className="flex flex-col items-center justify-center bg-[#0c0e12] border border-white/10 rounded-xl w-14 h-14 shrink-0 text-center">
                         <span className="text-xs text-amber-500 font-bold uppercase">{audit.date.split(' ')[1]}</span>
                         <span className="text-xl font-bold text-white">{audit.date.split(' ')[0]}</span>
                      </div>
                      <div>
                         <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">{audit.title}</h4>
                         <p className="text-xs text-gray-400 mt-1">Auditor: {audit.auditor}</p>
                         <Badge className="mt-2 bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] h-5">
                            {audit.status}
                         </Badge>
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Columna Derecha: Licencias y Permisos (8 columnas) */}
        <div className="lg:col-span-8">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white font-['Outfit']">Documentación Activa</h2>
              <div className="flex gap-2">
                 <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer">Vigentes (3)</Badge>
                 <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer">Vencidos (0)</Badge>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {licenses.map((license) => (
                 <div key={license.id} className="group relative bg-[#13161C] rounded-[2rem] border border-white/10 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Imagen de fondo sutil (simulando el documento) */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                       <img src={license.image} alt="" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] via-[#13161C]/80 to-[#13161C]/50" />
                    </div>

                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                       
                       {/* Header Card */}
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-xl bg-${license.color}-500/10 border border-${license.color}-500/20 text-${license.color}-400`}>
                             {license.color === 'emerald' && <CheckCircle2 className="w-6 h-6" />}
                             {license.color === 'amber' && <AlertTriangle className="w-6 h-6" />}
                             {license.color === 'rose' && <Siren className="w-6 h-6" />}
                             {license.color === 'blue' && <Building className="w-6 h-6" />}
                          </div>
                          <button className="text-gray-500 hover:text-white transition-colors">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>

                       {/* Content */}
                       <div className="mb-6">
                          <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-[#2A9D8F] transition-colors">
                             {license.title}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium flex items-center gap-1">
                             <Scale className="w-3 h-3" /> {license.entity}
                          </p>
                       </div>

                       {/* Footer / Status */}
                       <div className="space-y-3">
                          <div className="flex justify-between items-end">
                             <span className="text-xs text-gray-400">Vigencia</span>
                             <span className={`text-sm font-bold ${
                                license.daysLeft < 30 ? 'text-rose-400' : 
                                license.daysLeft < 60 ? 'text-amber-400' : 'text-white'
                             }`}>
                                {license.daysLeft} días restantes
                             </span>
                          </div>
                          
                          {/* Barra de Progreso Custom */}
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                   license.color === 'emerald' ? 'bg-emerald-500' :
                                   license.color === 'amber' ? 'bg-amber-500' :
                                   license.color === 'rose' ? 'bg-rose-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${license.progress}%` }}
                             />
                          </div>
                       </div>

                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}