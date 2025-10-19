// src/pages/rh.jsx
import React, { useState } from "react";


import { Sidebar } from "../assets/components/rh/sidebar.jsx";
import { Header } from "../assets/components/rh/header.jsx";
import { DashboardMain } from "../assets/components/rh/dashboard.jsx";
import AlertsPanel from "../assets/components/rh/alerts_panel.jsx";
import { QuickStats } from "../assets/components/rh/quick_stats.jsx";
import { RegistrarEmpleadoForm } from "../assets/components/rh/registrar_Empleado_form.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000";


export default function Rrhh() {
  const [selectedModule, setSelectedModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRegistrarEmpleado, setShowRegistrarEmpleado] = useState(false);

  const handleModuleSelect = (moduleId) => {
    if (moduleId === "registrarEmpleado") {
      setShowRegistrarEmpleado(true);
    } else {
      setSelectedModule(moduleId);
      setSidebarOpen(false);
      console.log(`Navegando a módulo: ${moduleId}`);
    }
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeRegistrarEmpleado = () => setShowRegistrarEmpleado(false);

  // Callback cuando se registra un empleado exitosamente
  const handleEmployeeRegistered = (newEmployee) => {
    console.log('Empleado registrado:', newEmployee);
    closeRegistrarEmpleado();
    // Aquí podrías recargar los datos o mostrar una notificación
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 border-r border-gray-200`}
      >
        <Sidebar 
          onModuleSelect={handleModuleSelect} 
          activeModule={selectedModule} 
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header
          pageTitle="La Bourboneria"
          pageSubtitle="Resumen general de RRHH"
          onMenuClick={handleMenuClick}
          notifications={[]} // Puedes conectar esto a alertas reales
        />

        <main className="flex-1 flex flex-col gap-6 p-6 min-h-0 overflow-y-auto">
          {/* QuickStats - Estadísticas rápidas */}
          <div className="flex flex-row flex-wrap gap-4">
            <QuickStats />
          </div>
          
          {/* DashboardMain - Módulos principales */}
          <div className="flex flex-row flex-wrap gap-4">
            <DashboardMain onModuleSelect={handleModuleSelect} />
          </div>
          
          {/* AlertsPanel - Panel de alertas */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AlertsPanel />
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Registrar Empleado */}
      {showRegistrarEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay oscuro */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeRegistrarEmpleado}
          ></div>

          {/* Contenedor del modal */}
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg transform transition-all duration-300 scale-95 animate-fadeIn overflow-y-auto max-h-[90vh]">
            {/* Botón cerrar */}
            <button
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 bg-white rounded-full p-1 shadow-sm hover:shadow-md transition"
              onClick={closeRegistrarEmpleado}
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Formulario */}
            <RegistrarEmpleadoForm onSuccess={handleEmployeeRegistered} />
          </div>
        </div>
      )}
    </div>
  );
}