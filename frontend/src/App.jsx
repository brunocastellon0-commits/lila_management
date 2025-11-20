// src/App.jsx

import React from 'react';
// Asegúrate de que react-router-dom esté instalado: npm install react-router-dom
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa tus componentes de página
// Asumimos que están en la carpeta 'src/pages'
import Login from './pages/login.jsx'; 
import Register from './pages/register.jsx';
import Rh from './pages/rh.jsx';
import Welcome from './pages/welcome.jsx';
import DashboardHome from './pages/pagina_principal.jsx';
import Produccion  from './pages/Produccion.jsx';
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio, lleva a Login */}
        <Route path="/" element={<Login />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rh/*" element={<Rh />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/produccion" element={<Produccion />} />
      </Routes>
    </Router>
  );
}

export default App;