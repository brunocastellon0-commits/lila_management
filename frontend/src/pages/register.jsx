import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          password: password.trim(), // <- CORRECCIÓN
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
              Crea tu cuenta
            </h1>
            <p className="text-white/90 leading-relaxed">
              Regístrate en LILA Management para empezar a gestionar tus sucursales de La Bourbonería desde un solo lugar.
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
              <h2 className="text-3xl text-[#2d3748] font-semibold mb-2">Registro</h2>
              <p className="text-[#718096] text-base">Crea tu cuenta ingresando los datos a continuación</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputConIcono id="nombre" type="text" placeholder="Nombre" icono="fas fa-user" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <InputConIcono id="apellido" type="text" placeholder="Apellido" icono="fas fa-user" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              <InputConIcono id="email" type="email" placeholder="Correo Electrónico" icono="fas fa-envelope" value={email} onChange={(e) => setEmail(e.target.value)} />
              <InputConIcono id="password" type="password" placeholder="Contraseña" icono="fas fa-lock" value={password} onChange={(e) => setPassword(e.target.value)} />

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#4b6cb7] to-[#182848] text-white rounded-xl font-semibold shadow-lg hover:-translate-y-1 transition-all" disabled={cargando}>
                {cargando ? "Registrando..." : "Registrarse"}
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
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-[#4b6cb7] font-semibold hover:underline">
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
