import React, { useState, useEffect } from "react";
import employeeService from "../../../api/employee_Service";

export function RegistrarEmpleadoForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    puesto: "",
    cargo_id: "",
    sucursal_id: "",
    fecha_ingreso: "",
    tarifa_hora: "",
    es_salario_fijo: false,
  });

  const [errors, setErrors] = useState({});
  const [cargos, setCargos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [cargosData, sucursalesData] = await Promise.all([
        employeeService.getCargos(),
        employeeService.getSucursales()
      ]);
      setCargos(cargosData);
      setSucursales(sucursalesData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      alert("Error al cargar los datos iniciales: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["nombre", "apellido", "email", "puesto", "fecha_ingreso"];
    
    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo obligatorio";
      }
    });

    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar tarifa si no es salario fijo
    if (!formData.es_salario_fijo && !formData.tarifa_hora) {
      newErrors.tarifa_hora = "Tarifa por hora requerida";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        puesto: formData.puesto,
        fecha_ingreso: formData.fecha_ingreso,
        tarifa_hora: formData.tarifa_hora ? parseFloat(formData.tarifa_hora) : null,
        es_salario_fijo: formData.es_salario_fijo,
      };

      const result = await employeeService.createEmployee(payload);

      alert(`Empleado registrado con éxito. ID: ${result.id}`);
      
      // Resetear formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        puesto: "",
        cargo_id: "",
        sucursal_id: "",
        fecha_ingreso: "",
        tarifa_hora: "",
        es_salario_fijo: false,
      });

      // Callback de éxito si existe
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Error al registrar empleado: " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-purple-700 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const errorClass = "border-red-500";

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 w-full max-w-lg flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Registrar Empleado
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nombre */}
        <div>
          <label className="text-gray-600 mb-1 block">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`${inputClass} ${errors.nombre ? errorClass : ""}`}
            placeholder="Ingrese nombre"
            disabled={submitLoading}
          />
          {errors.nombre && <span className="text-red-500 text-xs mt-1 block">{errors.nombre}</span>}
        </div>

        {/* Apellido */}
        <div>
          <label className="text-gray-600 mb-1 block">Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`${inputClass} ${errors.apellido ? errorClass : ""}`}
            placeholder="Ingrese apellido"
            disabled={submitLoading}
          />
          {errors.apellido && <span className="text-red-500 text-xs mt-1 block">{errors.apellido}</span>}
        </div>

        {/* Email */}
        <div>
          <label className="text-gray-600 mb-1 block">Correo electrónico *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputClass} ${errors.email ? errorClass : ""}`}
            placeholder="ejemplo@correo.com"
            disabled={submitLoading}
          />
          {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
        </div>

        {/* Puesto */}
        <div>
          <label className="text-gray-600 mb-1 block">Puesto *</label>
          <input
            type="text"
            name="puesto"
            value={formData.puesto}
            onChange={handleChange}
            className={`${inputClass} ${errors.puesto ? errorClass : ""}`}
            placeholder="Ej: Mesero, Cocinero, Gerente"
            disabled={submitLoading}
          />
          {errors.puesto && <span className="text-red-500 text-xs mt-1 block">{errors.puesto}</span>}
        </div>

        {/* Cargo (opcional) */}
        {cargos.length > 0 && (
          <div>
            <label className="text-gray-600 mb-1 block">Cargo (opcional)</label>
            <select
              name="cargo_id"
              value={formData.cargo_id}
              onChange={handleChange}
              className={inputClass}
              disabled={submitLoading}
            >
              <option value="">Seleccione cargo</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sucursal (opcional) */}
        {sucursales.length > 0 && (
          <div>
            <label className="text-gray-600 mb-1 block">Sucursal (opcional)</label>
            <select
              name="sucursal_id"
              value={formData.sucursal_id}
              onChange={handleChange}
              className={inputClass}
              disabled={submitLoading}
            >
              <option value="">Seleccione sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Fecha de ingreso */}
        <div>
          <label className="text-gray-600 mb-1 block">Fecha de ingreso *</label>
          <input
            type="date"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            className={`${inputClass} ${errors.fecha_ingreso ? errorClass : ""}`}
            disabled={submitLoading}
          />
          {errors.fecha_ingreso && <span className="text-red-500 text-xs mt-1 block">{errors.fecha_ingreso}</span>}
        </div>

        {/* Tipo de salario */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="es_salario_fijo"
            checked={formData.es_salario_fijo}
            onChange={handleChange}
            className="h-4 w-4 text-purple-700 focus:ring-purple-700 border-gray-300 rounded"
            disabled={submitLoading}
          />
          <label className="text-gray-600">¿Es salario fijo?</label>
        </div>

        {/* Tarifa por hora (solo si no es salario fijo) */}
        {!formData.es_salario_fijo && (
          <div>
            <label className="text-gray-600 mb-1 block">Tarifa por hora *</label>
            <input
              type="number"
              step="0.01"
              name="tarifa_hora"
              value={formData.tarifa_hora}
              onChange={handleChange}
              className={`${inputClass} ${errors.tarifa_hora ? errorClass : ""}`}
              placeholder="Ej: 15.50"
              disabled={submitLoading}
            />
            {errors.tarifa_hora && <span className="text-red-500 text-xs mt-1 block">{errors.tarifa_hora}</span>}
          </div>
        )}

        {/* Botón submit */}
        <button 
          type="submit" 
          disabled={submitLoading}
          className="mt-4 bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitLoading ? 'Guardando...' : 'Guardar Empleado'}
        </button>
      </form>
    </div>
  );
}
    