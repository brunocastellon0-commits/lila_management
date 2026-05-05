// src/App.jsx

import React from 'react';
// Asegúrate de que react-router-dom esté instalado: npm install react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa el componente de rutas protegidas
import { ProtectedRoute } from './components/ProtectedRoute';

// Importa tus componentes de página
// Asumimos que están en la carpeta 'src/pages'
import Login from './pages/login.jsx'; 
import Register from './pages/register.jsx';
import Rh from './pages/rh.jsx';
import Welcome from './pages/welcome.jsx';
import DashboardHome from './pages/pagina_principal.jsx';
import Produccion from './pages/Produccion.jsx';
import Servicio from './pages/Servicio.jsx';
import { Layout as ServicioLayout } from './assets/components/servicio/Layout.jsx';
import { Dashboard as ServicioDashboard } from './assets/components/servicio/Dashboard.jsx';
import { KitchenMonitor } from './assets/components/servicio/ServicioKitchenMonitor.jsx';
import { Inventory as ServicioInventory } from './assets/components/servicio/ServicioInventory.jsx';
import { OrdersHistory as ServicioOrders } from './assets/components/servicio/ServicioOrderHistory.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== RUTAS PÚBLICAS ===== */}
        {/* Ruta de inicio, lleva a Welcome (página pública) */}
        <Route path="/" element={<Welcome />} /> 
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ===== RUTAS PROTEGIDAS (RequIEREN AUTENTICACIÓN) ===== */}
        <Route 
          path="/rh/*" 
          element={
            <ProtectedRoute>
              <Rh />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/produccion" 
          element={
            <ProtectedRoute>
              <Produccion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/servicio" 
          element={
            <ProtectedRoute>
              <ServicioLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<ServicioDashboard />} />
          <Route path="salon" element={<Servicio />} />
          <Route path="cocina" element={<KitchenMonitor />} />
          <Route path="inventario" element={<ServicioInventory />} />
          <Route path="pedidos" element={<ServicioOrders />} />
        </Route>

        {/* Ruta catch-all: redirige a welcome */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;