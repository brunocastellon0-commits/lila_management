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

        {/* Ruta catch-all: redirige a welcome */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;