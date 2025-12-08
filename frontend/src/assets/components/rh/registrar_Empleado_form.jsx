import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import employeeService from "../../../api/employee_Service.js";

export function RegistrarEmpleadoForm({ onSuccess, onCancel, employee }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    puesto: "",
    rol_id: "",
    sucursal_id: "",
    fecha_ingreso: "",
    tarifa_hora: "",
    es_salario_fijo: false,
    desempeño_score: 50,
    password: "", // ← NUEVO CAMPO
    confirmPassword: "" // ← NUEVO CAMPO
  });

  // Cargar datos del empleado si estamos editando
  useEffect(() => {
    if (employee) {
      setFormData({
        nombre: employee.nombre || "",
        apellido: employee.apellido || "",
        email: employee.email || "",
        puesto: employee.puesto || "",
        rol_id: employee.rol_id || "",
        sucursal_id: employee.sucursal_id || "",
        fecha_ingreso: employee.fecha_ingreso || "",
        tarifa_hora: employee.tarifa_hora || "",
        es_salario_fijo: employee.es_salario_fijo || false,
        desempeño_score: employee.desempeño_score || 50,
        password: "", // No cargar contraseña en edición
        confirmPassword: "" // No cargar confirmación en edición
      });
    }
  }, [employee])

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
    const requiredFields = ["nombre", "apellido", "email", "puesto", "rol_id", "sucursal_id", "fecha_ingreso", "password"]; // ← Agregar password
    
    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo obligatorio";
      }
    });

    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar contraseña
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar tarifa si no es salario fijo
    if (!formData.es_salario_fijo && !formData.tarifa_hora) {
      newErrors.tarifa_hora = "Tarifa por hora requerida";
    }

    // Validar desempeño score (debe estar entre 1 y 100)
    if (formData.desempeño_score && (formData.desempeño_score < 1 || formData.desempeño_score > 100)) {
      newErrors.desempeño_score = "Debe estar entre 1 y 100";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Por favor, complete todos los campos obligatorios.", {
        position: "top-center"
      });
      return;
    }

    setSubmitLoading(true);
    try {
      // Función para mapear rol_id a role
      const getRoleFromRolId = (rol_id) => {
        const roleMap = {
          "1": "employee",    // Mesero
          "2": "admin",       // Administrador
          "3": "manager",     // Gerente
          "4": "supervisor"   // Supervisor
        };
        return roleMap[rol_id] || "employee";
      };

      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        puesto: formData.puesto,
        rol_id: parseInt(formData.rol_id),
        sucursal_id: parseInt(formData.sucursal_id),
        fecha_ingreso: formData.fecha_ingreso,
        tarifa_hora: formData.tarifa_hora ? parseFloat(formData.tarifa_hora) : null,
        es_salario_fijo: formData.es_salario_fijo,
        desempeño_score: parseInt(formData.desempeño_score) || 50,
        password: formData.password,
        // ¡AGREGAR ESTOS CAMPOS PARA EL USUARIO!
        username: `${formData.nombre.toLowerCase()}.${formData.apellido.toLowerCase()}`,
        role: getRoleFromRolId(formData.rol_id)  // ← ESTE ES EL CAMPO CLAVE
      };

      console.log("Enviando payload:", payload); // Para debug

      const result = await employeeService.createEmployeeWithUser(payload);

      toast.success(`Empleado ${result.nombre || payload.nombre} registrado con éxito.`, {
          description: `ID: ${result.id} | Usuario: ${result.user?.email || formData.email} | Rol: ${payload.role}`
      });
      
      // Resetear formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        puesto: "",
        rol_id: "",
        sucursal_id: "",
        fecha_ingreso: "",
        tarifa_hora: "",
        es_salario_fijo: false,
        desempeño_score: 50,
        password: "",
        confirmPassword: ""
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al registrar el empleado.", {
          description: error.message || "Ocurrió un error desconocido en el servidor."
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ESTILOS DARK MODE
  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0c0e12] focus:outline-none focus:ring-1 focus:ring-[#2A9D8F] focus:border-[#2A9D8F] disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-200 text-white font-medium placeholder:text-gray-600";
  const errorClass = "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500 bg-rose-500/5";
  const labelClass = "text-gray-300 mb-2 block font-bold text-sm tracking-wide";

  if (loading) {
    return (
      <div className="bg-[#13161C] rounded-[2rem] p-8 w-full max-w-2xl flex justify-center items-center min-h-[500px] border border-white/10">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#2A9D8F] absolute"></div>
          </div>
          <p className="text-white font-semibold text-lg font-['Outfit']">Cargando datos iniciales...</p>
          <p className="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  return (
    // CONTENEDOR MODAL DARK
    <div className="bg-[#13161C] rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
      
      {/* Header del modal */}
      <div className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] px-8 py-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight font-['Outfit']">
          Registrar Nuevo Empleado
        </h2>
        <p className="text-teal-100 text-sm mt-1 font-medium opacity-90">Complete la información del nuevo miembro del equipo</p>
      </div>

      {/* Body del modal con scroll */}
      <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Grid para nombre y apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div>
              <label className={labelClass}>
                Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`${inputClass} ${errors.nombre ? errorClass : ""}`}
                placeholder="Ej: Juan"
                maxLength={50}
                disabled={submitLoading}
              />
              {errors.nombre && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombre}
                </span>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className={labelClass}>
                Apellido <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`${inputClass} ${errors.apellido ? errorClass : ""}`}
                placeholder="Ej: Pérez"
                maxLength={50}
                disabled={submitLoading}
              />
              {errors.apellido && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.apellido}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>
              Correo electrónico <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputClass} ${errors.email ? errorClass : ""}`}
              placeholder="ejemplo@correo.com"
              maxLength={100}
              disabled={submitLoading}
            />
            {errors.email && (
              <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </span>
            )}
          </div>

          {/* Contraseña y Confirmación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} ${errors.password ? errorClass : ""}`}
                placeholder="Mínimo 6 caracteres"
                disabled={submitLoading}
              />
              {errors.password && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </span>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Confirmar Contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${inputClass} ${errors.confirmPassword ? errorClass : ""}`}
                placeholder="Repite la contraseña"
                disabled={submitLoading}
              />
              {errors.confirmPassword && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          {/* Grid para puesto y rol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Puesto */}
            <div>
              <label className={labelClass}>
                Puesto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="puesto"
                value={formData.puesto}
                onChange={handleChange}
                className={`${inputClass} ${errors.puesto ? errorClass : ""}`}
                placeholder="Ej: Mesero, Cocinero"
                maxLength={50}
                disabled={submitLoading}
              />
              {errors.puesto && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.puesto}
                </span>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className={labelClass}>
                Rol <span className="text-rose-500">*</span>
              </label>
              <select
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                className={`${inputClass} ${errors.rol_id ? errorClass : ""}`}
                disabled={submitLoading}
              >
                <option value="">Seleccione un rol</option>
                <option value="1">Mesero</option>
                <option value="2">Administrador</option>
                <option value="3">Gerente</option>
                <option value="4">Supervisor</option>
              </select>
              {errors.rol_id && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.rol_id}
                </span>
              )}
            </div>
          </div>

          {/* Sucursal */}
          <div>
            <label className={labelClass}>
              Sucursal <span className="text-rose-500">*</span>
            </label>
            <select
              name="sucursal_id"
              value={formData.sucursal_id}
              onChange={handleChange}
              className={`${inputClass} ${errors.sucursal_id ? errorClass : ""}`}
              disabled={submitLoading}
            >
              <option value="">Seleccione una sucursal</option>
              <option value="1">Centro</option>
              <option value="2">Zona Norte</option>
              <option value="3">Zona Sur</option>
              <option value="4">Zona Este</option>
            </select>
            {errors.sucursal_id && (
              <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.sucursal_id}
              </span>
            )}
          </div>

          {/* Grid para fecha y desempeño */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Fecha de ingreso */}
            <div>
              <label className={labelClass}>
                Fecha de ingreso <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
                className={`${inputClass} ${errors.fecha_ingreso ? errorClass : ""} [color-scheme:dark]`}
                disabled={submitLoading}
              />
              {errors.fecha_ingreso && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.fecha_ingreso}
                </span>
              )}
            </div>

            {/* Desempeño score */}
            <div>
              <label className={labelClass}>
                Puntuación de desempeño inicial
              </label>
              <input
                type="number"
                name="desempeño_score"
                value={formData.desempeño_score}
                onChange={handleChange}
                className={`${inputClass} ${errors.desempeño_score ? errorClass : ""}`}
                placeholder="50"
                min="1"
                max="100"
                disabled={submitLoading}
              />
              <p className="text-xs text-gray-500 mt-1.5 font-medium">Valor entre 1 y 100 (predeterminado: 50)</p>
              {errors.desempeño_score && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.desempeño_score}
                </span>
              )}
            </div>
          </div>

          {/* Divisor visual */}
          <div className="border-t border-white/10 pt-2"></div>

          {/* Tipo de salario con mejor diseño */}
          <div className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="es_salario_fijo"
                name="es_salario_fijo"
                checked={formData.es_salario_fijo}
                onChange={handleChange}
                className="h-5 w-5 text-[#2A9D8F] bg-[#0c0e12] border-gray-600 rounded cursor-pointer accent-[#2A9D8F]"
                disabled={submitLoading}
              />
              <label htmlFor="es_salario_fijo" className="text-white font-bold select-none cursor-pointer">
                ¿El empleado tiene salario fijo?
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-8 font-medium">
              Marque esta opción si el empleado tiene un salario mensual fijo en lugar de tarifa por hora
            </p>
          </div>

          {/* Tarifa por hora (solo si no es salario fijo) */}
          {!formData.es_salario_fijo && (
            <div className="bg-[#0c0e12] border border-white/10 rounded-xl p-5">
              <label className={labelClass}>
                Tarifa por hora <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  name="tarifa_hora"
                  value={formData.tarifa_hora}
                  onChange={handleChange}
                  className={`${inputClass} pl-12 ${errors.tarifa_hora ? errorClass : ""}`}
                  placeholder="Ej: 15.50"
                  disabled={submitLoading}
                />
              </div>
              {errors.tarifa_hora && (
                <span className="text-rose-400 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.tarifa_hora}
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Footer con botones de acción */}
      <div className="bg-[#13161C] border-t border-white/10 px-8 py-5 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-bold text-gray-300 bg-transparent border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          onClick={handleSubmit}
          disabled={submitLoading}
          className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:from-[#2A9D8F] hover:to-[#1B4F55] transition-all duration-200 shadow-lg shadow-[#2A9D8F]/20 hover:shadow-[#2A9D8F]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
        >
          {submitLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Empleado
            </>
          )}
        </button>
      </div>
    </div>
  );
}