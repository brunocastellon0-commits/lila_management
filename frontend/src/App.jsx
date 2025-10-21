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
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio, lleva a Login */}
        <Route path="/" element={<Login />} /> 
        
        {/* Rutas específicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Por lo general, el panel de RH debe estar protegido. 
            Aquí solo establecemos la ruta. */}
        <Route path="/rh/*" element={<Rh />} />
        <Route path="/welcome" element={<Welcome />} />
        
      </Routes>
    </Router>
  );
}

export default App;