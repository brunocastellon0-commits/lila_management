import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  Navigation, 
  MoreVertical, 
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
// Importamos Select para evitar el error de DropdownMenu
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../ui/select"; 

// --- MOCK DATA ---
const activeShipments = [
  {
    id: "DSP-8821",
    destination: "Sucursal Norte",
    address: "Av. Banzer 4to Anillo",
    status: "on-route", // prep, on-route, delivered, issue
    progress: 65,
    items: 145,
    driver: "Carlos Mendoza",
    vehicle: "Furgón 04 (Nissan)",
    eta: "14 min",
    departure: "10:30 AM"
  },
  {
    id: "DSP-8822",
    destination: "Sucursal Centro",
    address: "Calle Ayacucho #22",
    status: "prep",
    progress: 20,
    items: 80,
    driver: "Pendiente",
    vehicle: "--",
    eta: "--",
    departure: "Programado 14:00"
  },
  {
    id: "DSP-8820",
    destination: "Sucursal Sur (Ventura)",
    address: "Doble Vía La Guardia",
    status: "issue",
    progress: 45,
    items: 210,
    driver: "Jorge Ruiz",
    vehicle: "Camión 02 (Volvo)",
    eta: "Retrasado",
    departure: "09:15 AM"
  },
  {
    id: "DSP-8819",
    destination: "Sucursal Equipetrol",
    address: "Av. San Martín",
    status: "delivered",
    progress: 100,
    items: 50,
    driver: "Ana Torrez",
    vehicle: "Moto Cargo 01",
    eta: "Completado",
    departure: "08:00 AM"
  }
];

export default function Dispatch() {
  const [searchTerm, setSearchTerm] = useState("");

  // Helper para colores de estado
  const getStatusColor = (status) => {
    switch(status) {
        case "on-route": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
        case "delivered": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "issue": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        default: return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
        case "on-route": return "En Ruta";
        case "delivered": return "Entregado";
        case "issue": return "Incidencia";
        default: return "Preparación";
    }
  };

  const getProgressColor = (status) => {
    switch(status) {
        case "on-route": return "bg-blue-500 shadow-[0_0_10px_#3B82F6]";
        case "delivered": return "bg-emerald-500 shadow-[0_0_10px_#10B981]";
        case "issue": return "bg-rose-500 shadow-[0_0_10px_#F43F5E]";
        default: return "bg-amber-500 shadow-[0_0_10px_#F59E0B]";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER: FLEET OVERVIEW --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-['Outfit']">Centro de Despacho</h2>
            <p className="text-gray-400 mt-1">Monitoreo de flota y distribución multi-sucursal.</p>
        </div>
        <Button className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] text-white border-0 rounded-xl px-6 h-12 transition-all font-medium">
            <Truck className="w-5 h-5 mr-2" />
            Nuevo Envío
        </Button>
      </div>

      {/* --- MAPA VISUAL SIMULADO (BACKGROUND) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Lista de Envíos */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                    placeholder="Buscar por ID, conductor o destino..." 
                    className="pl-12 h-14 rounded-2xl bg-[#13161C] border-white/10 text-white focus:ring-[#2A9D8F] focus:border-[#2A9D8F] text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Shipment Cards */}
            <div className="space-y-4">
                {activeShipments.map((shipment) => (
                    <Card key={shipment.id} className="group border border-white/10 bg-[#13161C] hover:border-[#2A9D8F]/50 transition-all duration-300 p-0 overflow-hidden rounded-[1.5rem] shadow-lg">
                        <div className="flex flex-col md:flex-row">
                            
                            {/* Left: Status Indicator Strip */}
                            <div className={`w-full md:w-2 h-2 md:h-auto ${shipment.status === 'on-route' ? 'bg-blue-500' : shipment.status === 'delivered' ? 'bg-emerald-500' : shipment.status === 'issue' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                            
                            {/* Main Content */}
                            <div className="p-6 flex-1 flex flex-col gap-4">
                                {/* Top Row: ID & Destination */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-white">{shipment.destination}</h3>
                                                <Badge variant="outline" className={`border rounded-md ${getStatusColor(shipment.status)}`}>
                                                    {getStatusLabel(shipment.status)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {shipment.address}
                                                <span className="text-gray-700">•</span>
                                                <span className="font-mono text-gray-400">{shipment.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Menu (Select) */}
                                    <Select>
                                        <SelectTrigger className="w-8 h-8 p-0 border-none bg-transparent hover:bg-white/10 rounded-full flex items-center justify-center ring-0 focus:ring-0">
                                            <MoreVertical className="w-5 h-5 text-gray-500 hover:text-white" />
                                        </SelectTrigger>
                                        <SelectContent align="end" className="bg-[#1A1D24] border-white/10 text-gray-300 rounded-xl">
                                            <SelectGroup>
                                                <SelectItem value="view">Ver Detalles</SelectItem>
                                                <SelectItem value="track">Rastrear GPS</SelectItem>
                                                <SelectItem value="contact">Contactar Conductor</SelectItem>
                                                {shipment.status !== 'delivered' && <SelectItem value="cancel" className="text-rose-400">Cancelar Envío</SelectItem>}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Middle: Progress & Info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Progreso del envío</span>
                                        <span className="text-white font-mono">{shipment.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${getProgressColor(shipment.status)}`} 
                                            style={{ width: `${shipment.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Bottom: Driver & ETA */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs text-white border border-white/10">
                                            DR
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{shipment.driver}</p>
                                            <p className="text-xs text-gray-500">{shipment.vehicle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end text-sm font-bold text-white">
                                            <Clock className="w-4 h-4 text-[#2A9D8F]" />
                                            {shipment.eta}
                                        </div>
                                        <p className="text-xs text-gray-500">Salida: {shipment.departure}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Columna Derecha: Live Map Widget (Visual Only) & Stats */}
        <div className="space-y-6">
            
            {/* Visual Map Placeholder */}
            <Card className="h-80 bg-[#0c0e12] border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="w-full h-full bg-[radial-gradient(#2A9D8F_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
                    {/* Simulated Paths */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path d="M 50 150 Q 150 50 250 150 T 450 150" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse opacity-50"/>
                        <circle cx="50" cy="150" r="4" fill="#2A9D8F" />
                        <circle cx="250" cy="150" r="4" fill="#2A9D8F" />
                        <circle cx="450" cy="150" r="4" fill="#2A9D8F" />
                    </svg>
                </div>
                
                {/* Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#13161C]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Flota Activa</p>
                            <p className="text-lg font-bold text-white">3 Vehículos</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]"></div>
                    </div>
                </div>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-[#13161C] border border-white/10 rounded-[2rem] p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#2A9D8F]" />
                    Métricas de Hoy
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-gray-300 text-sm">Entregados</span>
                        </div>
                        <span className="text-white font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Truck className="w-4 h-4" />
                            </div>
                            <span className="text-gray-300 text-sm">En Ruta</span>
                        </div>
                        <span className="text-white font-bold">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-gray-300 text-sm">Retrasos</span>
                        </div>
                        <span className="text-white font-bold">1</span>
                    </div>
                </div>
            </Card>

            {/* Driver Contact Quick List */}
            <Card className="bg-[#13161C] border border-white/10 rounded-[2rem] p-6">
                <h3 className="text-white font-bold mb-4">Contactos Rápidos</h3>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">CM</div>
                    <div className="flex-1">
                        <p className="text-sm text-white">Carlos Mendoza</p>
                        <p className="text-xs text-gray-500">En ruta a Norte</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#2A9D8F] hover:bg-[#2A9D8F]/10 rounded-full">
                        <Phone className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
}