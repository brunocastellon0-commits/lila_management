import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputConIcono from "../assets/components/auth_components/input_con_icono.jsx";
import BotonSocial from "../assets/components/auth_components/boton_social.jsx";
import TarjetaCaracteristica from "../assets/components/auth_components/tarjeta_caracteristica.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [identifier, setIdentifier] = useState(""); // puede ser email o username
  const [password, setPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(),
          email: identifier.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      setCargando(false);

      if (res.ok && data.user) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("usuario_id", data.user.id);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("role", data.user.role);

        navigate("/rh");
      } else {
        alert(data.detail || "Credenciales incorrectas");
      }
    } catch (err) {
      setCargando(false);
      console.error("Error al conectar con el servidor:", err);
      alert("No se pudo conectar con el servidor. Verifica que el gateway esté levantado.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] p-5">
      <div className="flex w-full max-w-[1000px] min-h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
        {/* Lado Izquierdo */}
        <div className="flex-1 bg-gradient-to-br from-[#4b6cb7] to-[#182848] text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\' width=\\'100\\' height=\\'100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'40\\' stroke=\\'white\\' stroke-width=\\'2\\' fill=\\'none\\'/></svg>')] bg-[length:200px]" />
          <div className="flex items-center mb-8 relative z-10">
            <div className="w-[50px] h-[50px] bg-white rounded-xl flex items-center justify-center mr-4">
              <i className="fas fa-coffee text-2xl text-[#4b6cb7]" />
            </div>
            <div className="text-2xl font-bold">LILA Management</div>
          </div>

          <div className="welcome-text bg-[#182748] p-5 rounded-xl relative z-10">
            <h1 className="text-3xl mb-3 font-bold bg-gradient-to-r from-[#077171] to-[#02f1b9] bg-clip-text text-transparent">
              Bienvenido de nuevo
            </h1>
            <p className="text-white/90 leading-relaxed">
              Accede a tu cuenta de LILA Management para gestionar todas las
              sucursales de La Bourbonería desde un solo lugar.
            </p>
          </div>

          <div className="mt-8 relative z-10 space-y-5">
            <TarjetaCaracteristica claseIcono="fas fa-chart-line" texto="Gestión integral de ventas e inventarios" />
            <TarjetaCaracteristica claseIcono="fas fa-store" texto="Control multi-sucursal en tiempo real" />
            <TarjetaCaracteristica claseIcono="fas fa-shield-alt" texto="Gestión de Recursos Humanos" />
          </div>
        </div>

        {/* Lado Derecho */}
        <div className="flex-1 p-10 flex flex-col justify-center bg-white animate-fadeIn">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl text-[#2d3748] font-semibold mb-2">Iniciar Sesión</h2>
              <p className="text-[#718096] text-base">
                Ingresa tu usuario o correo y contraseña
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputConIcono
                id="identifier"
                type="text"
                placeholder="Usuario o Correo Electrónico"
                icono="fas fa-user"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <InputConIcono
                id="password"
                type="password"
                placeholder="Contraseña"
                icono="fas fa-lock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex justify-between items-center text-sm text-[#2d3748] mb-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-[#4b6cb7]" />
                  <span>Recordarme</span>
                </label>
                <a href="#" className="text-[#4b6cb7] font-medium hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#4b6cb7] to-[#182848] text-white rounded-xl font-semibold shadow-lg hover:-translate-y-1 transition-all"
                disabled={cargando}
              >
                {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="flex items-center text-gray-400 my-8 text-sm">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3">O continúa con</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <BotonSocial claseIcono="fab fa-google" color="#DB4437" />
              <BotonSocial claseIcono="fab fa-microsoft" color="#0078D7" />
              <BotonSocial claseIcono="fab fa-apple" color="#000000" />
            </div>

            <div className="text-center text-sm text-[#718096]">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-[#4b6cb7] font-semibold hover:underline">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
