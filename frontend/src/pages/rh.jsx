import React, { useState } from "react";

import { Sidebar } from "../componentes/Rrhh/SideBar/Sidebar.jsx";
import { Header } from "../componentes/Rrhh/Header/HeaderRrhh.jsx";
import { DashboardMain } from "../componentes/Rrhh/DashboardMain/DashboardMain.jsx";
import AlertsPanel from "../componentes/Rrhh/AlertsPanel/AlertsPanel.jsx";
import { QuickStats } from "../componentes/Rrhh/QuickStats/QuickStats.jsx";
import { RegistrarEmpleadoForm } from "../componentes/Rrhh/GestionEmpleado/RegistrarEmpleadoForm.jsx";

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 border-r border-gray-200`}
      >
        <Sidebar onModuleSelect={handleModuleSelect} activeModule={selectedModule} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header
          pageTitle="La bourboneria"
          pageSubtitle="Resumen general de RRHH"
          onMenuClick={handleMenuClick}
        />

        <main className="flex-1 flex flex-col gap-6 p-6 min-h-0 overflow-y-auto">
          <div className="flex flex-row flex-wrap gap-4">
            <QuickStats />
          </div>
          <div className="flex flex-row flex-wrap gap-4">
            <DashboardMain onModuleSelect={handleModuleSelect} />
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AlertsPanel />
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Registrar Empleado con animación y scroll */}
      {showRegistrarEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay oscuro con fade */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeRegistrarEmpleado}
          ></div>

          {/* Contenedor del modal */}
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6 transform transition-all duration-300 scale-95 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeRegistrarEmpleado}
            >
              ✕
            </button>
            <RegistrarEmpleadoForm />
          </div>
        </div>
      )}
    </div>
  );
}
