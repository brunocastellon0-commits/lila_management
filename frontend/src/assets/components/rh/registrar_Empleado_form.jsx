import React, { useState, useEffect } from "react";

export function RegistrarEmpleadoForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cargo_id: "",       
    sucursal_id: "",    
    fechaIngreso: "",
    fechaSalida: "",
    email: "",
    telefono: "",
  });

  const [errors, setErrors] = useState({});
  const [cargos, setCargos] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const cargosRes = await fetch("http://127.0.0.1:5000/api/cargos");
        const cargosData = await cargosRes.json();
        setCargos(cargosData);

        const sucursalesRes = await fetch("http://127.0.0.1:5000/api/sucursales");
        const sucursalesData = await sucursalesRes.json();
        setSucursales(sucursalesData);
      } catch (err) {
        console.error("Error cargando cargos o sucursales:", err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ["nombre","apellido","email","telefono","cargo_id","sucursal_id","fechaIngreso"].forEach((key) => {
      if (!formData[key]) newErrors[key] = "Campo obligatorio";
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cargo_id: parseInt(formData.cargo_id),
        sucursal_id: parseInt(formData.sucursal_id),
        email: formData.email,
        telefono: formData.telefono,
        fecha_ingreso: formData.fechaIngreso,
        fecha_salida: formData.fechaSalida || null,
      };

      const response = await fetch("http://127.0.0.1:5000/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Empleado registrado con éxito. Contraseña inicial: ${result.empleado.contrasena_inicial}`);
        setFormData({
          nombre: "",
          apellido: "",
          cargo_id: "",
          sucursal_id: "",
          fechaIngreso: "",
          fechaSalida: "",
          email: "",
          telefono: "",
        });
      } else {
        alert("Error al registrar empleado: " + (result.error || ""));
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700";
  const errorClass = "border-red-500";

  return (
    <div className="bg-gray-100 p-6 flex justify-center min-h-[80vh]">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Registrar Empleado
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="text-gray-600 mb-1 block">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
              className={`${inputClass} ${errors.nombre ? errorClass : ""}`} placeholder="Ingrese nombre" />
          </div>

          {/* Apellido */}
          <div>
            <label className="text-gray-600 mb-1 block">Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange}
              className={`${inputClass} ${errors.apellido ? errorClass : ""}`} placeholder="Ingrese apellido" />
          </div>

          {/* Cargo */}
          <div>
            <label className="text-gray-600 mb-1 block">Cargo</label>
            <select name="cargo_id" value={formData.cargo_id} onChange={handleChange}
              className={`${inputClass} ${errors.cargo_id ? errorClass : ""}`}>
              <option value="">Seleccione cargo</option>
              {cargos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Sucursal */}
          <div>
            <label className="text-gray-600 mb-1 block">Sucursal</label>
            <select name="sucursal_id" value={formData.sucursal_id} onChange={handleChange}
              className={`${inputClass} ${errors.sucursal_id ? errorClass : ""}`}>
              <option value="">Seleccione sucursal</option>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Fecha de ingreso */}
          <div>
            <label className="text-gray-600 mb-1 block">Fecha de ingreso</label>
            <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange}
              className={`${inputClass} ${errors.fechaIngreso ? errorClass : ""}`} />
          </div>

          {/* Fecha de salida */}
          <div>
            <label className="text-gray-600 mb-1 block">Fecha de salida (opcional)</label>
            <input type="date" name="fechaSalida" value={formData.fechaSalida} onChange={handleChange}
              className={inputClass} />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-600 mb-1 block">Correo electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className={`${inputClass} ${errors.email ? errorClass : ""}`} placeholder="ejemplo@correo.com" />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-gray-600 mb-1 block">Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
              className={`${inputClass} ${errors.telefono ? errorClass : ""}`} placeholder="Ingrese teléfono" />
          </div>

          {/* Botón submit */}
          <button type="submit" className="mt-4 bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
