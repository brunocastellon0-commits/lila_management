import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Coffee, TrendingUp, Store, ShieldCheck, Loader2 } from "lucide-react";
import InputConIcono from "../assets/components/auth_components/input_con_icono.jsx";
import BotonSocial from "../assets/components/auth_components/boton_social.jsx";
import TarjetaCaracteristica from "../assets/components/auth_components/tarjeta_caracteristica.jsx";

const Register = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // URL del gateway
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setCargando(true);

    try {
      // Construimos username a partir de nombre + apellido
      const username = `${nombre.trim()} ${apellido.trim()}`;

      // Enviar password limpio y recortado de espacios invisibles
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: email.trim().toLowerCase(),
          password: password.trim(), 
        }),
      });

      const data = await res.json();
      setCargando(false);

      if (res.ok) {
        alert("Registro exitoso. Ahora puedes iniciar sesión");
        navigate("/login");
      } else {
        alert(data.detail || JSON.stringify(data) || "Error al registrar el usuario");
      }
    } catch (err) {
      setCargando(false);
      console.error("Error al conectar con el servidor:", err);
      alert("No se pudo conectar con el servidor. Verifica que el gateway esté levantado.");
    }
  };

  return (
    // CAMBIO: Fondo oscuro general (#0c0e12)
    <div className="flex justify-center items-center min-h-screen bg-[#0c0e12] p-5 relative overflow-hidden">
      
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1B4F55]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2A9D8F]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Tarjeta Principal Dark */}
      <div className="flex w-full max-w-[1000px] min-h-[600px] bg-[#13161C] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 animate-fadeIn relative z-10">
        
        {/* Lado Izquierdo - Branding Dark */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0c0e12] via-[#1B4F55] to-[#13161C] text-white p-10 flex-col justify-center relative overflow-hidden border-r border-white/5">
          {/* Patrón de fondo ajustado a baja opacidad */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'40\\' stroke=\\'white\\' stroke-width=\\'2\\' fill=\\'none\\'/></svg>')] bg-[length:200px]" />
          
          <div className="flex items-center mb-8 relative z-10">
            <div className="w-[50px] h-[50px] bg-[#13161C] border border-white/10 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-black/20">
              <Coffee className="w-6 h-6 text-[#2A9D8F]" />
            </div>
            <div className="text-2xl font-bold font-['Outfit'] tracking-wide">LILA Management</div>
          </div>

          <div className="welcome-text bg-black/20 backdrop-blur-sm border border-white/5 p-6 rounded-2xl relative z-10 mb-8">
            <h1 className="text-3xl mb-3 font-bold text-white">
              Crea tu cuenta
            </h1>
            <p className="text-gray-400 leading-relaxed font-light">
              Regístrate en LILA Management para gestionar tus sucursales de La Bourbonería desde un solo lugar.
            </p>
          </div>

          <div className="mt-4 relative z-10 space-y-4">
            <TarjetaCaracteristica Icon={TrendingUp} texto="Gestión integral de ventas" />
            <TarjetaCaracteristica Icon={Store} texto="Control multi-sucursal" />
            <TarjetaCaracteristica Icon={ShieldCheck} texto="Recursos Humanos AI" />
          </div>
        </div>

        {/* Lado Derecho - Formulario Dark */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-[#13161C]">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl text-white font-bold mb-2 font-['Outfit']">Registro</h2>
              <p className="text-gray-400 text-sm">Crea tu cuenta ingresando los datos a continuación</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputConIcono 
                id="nombre" 
                type="text" 
                placeholder="Nombre" 
                Icon={User} 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
              />
              <InputConIcono 
                id="apellido" 
                type="text" 
                placeholder="Apellido" 
                Icon={User} 
                value={apellido} 
                onChange={(e) => setApellido(e.target.value)} 
              />
              <InputConIcono 
                id="email" 
                type="email" 
                placeholder="Correo Electrónico" 
                Icon={Mail} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <InputConIcono 
                id="password" 
                type="password" 
                placeholder="Contraseña" 
                Icon={Lock} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:from-[#2A9D8F] hover:to-[#1B4F55] text-white rounded-2xl font-bold shadow-lg shadow-[#2A9D8F]/20 hover:shadow-[#2A9D8F]/40 hover:scale-[1.02] transition-all duration-300 border border-white/10" 
                disabled={cargando}
              >
                {cargando ? (
                   <span className="flex items-center justify-center gap-2">
                     <Loader2 className="w-5 h-5 animate-spin" /> Registrando...
                   </span>
                ) : "Registrarse"}
              </button>
            </form>

            <div className="flex items-center text-gray-500 my-8 text-sm">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-3 font-medium">O continúa con</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {/* Google SVG */}
              <BotonSocial>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </BotonSocial>
              
              {/* Microsoft SVG */}
              <BotonSocial>
                 <svg className="w-5 h-5" viewBox="0 0 23 23">
                   <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                   <path fill="#f35325" d="M1 1h10v10H1z"/>
                   <path fill="#81bc06" d="M12 1h10v10H12z"/>
                   <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                   <path fill="#ffba08" d="M12 12h10v10H12z"/>
                 </svg>
              </BotonSocial>
              
              {/* Apple SVG */}
              <BotonSocial>
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.04 4.36-.67c.69.11 1.83.5 2.65 1.51-3.7 2.19-2.9 7.79 1.91 9.39-.77 2-1.98 2.37-2.73 3.27-1.27 1.54-2.14 1.45-1.27.73zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </BotonSocial>
            </div>

            <div className="text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-[#2A9D8F] font-bold hover:text-white transition-colors ml-1">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;