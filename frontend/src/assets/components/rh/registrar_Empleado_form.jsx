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
    const requiredFields = ["nombre", "apellido", "email", "puesto", "rol_id", "sucursal_id", "fecha_ingreso"];
    
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
      };

      const result = await employeeService.createEmployee(payload);

      toast.success(`Empleado ${result.nombre || payload.nombre} registrado con éxito.`, {
          description: `ID: ${result.id}`
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-200 text-slate-700 font-medium placeholder:text-slate-400";
  const errorClass = "border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/50";
  const labelClass = "text-slate-700 mb-2 block font-bold text-sm tracking-wide";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-teal-500 absolute"></div>
          </div>
          <p className="text-slate-600 font-semibold text-lg">Cargando datos iniciales...</p>
          <p className="text-slate-400 text-sm mt-2">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-teal-50/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200/60">
      {/* Header del modal */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-6 border-b border-teal-400/20">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Registrar Nuevo Empleado
        </h2>
        <p className="text-teal-50 text-sm mt-1 font-medium">Complete la información del nuevo miembro del equipo</p>
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
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
              <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </span>
            )}
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
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
                <option value="1">Administrador</option>
                <option value="2">Empleado</option>
                <option value="3">Gerente</option>
                <option value="4">Supervisor</option>
              </select>
              {errors.rol_id && (
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
              <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
                className={`${inputClass} ${errors.fecha_ingreso ? errorClass : ""}`}
                disabled={submitLoading}
              />
              {errors.fecha_ingreso && (
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Valor entre 1 y 100 (predeterminado: 50)</p>
              {errors.desempeño_score && (
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.desempeño_score}
                </span>
              )}
            </div>
          </div>

          {/* Divisor visual */}
          <div className="border-t border-slate-200 pt-2"></div>

          {/* Tipo de salario con mejor diseño */}
          <div className="bg-teal-50/50 border border-teal-200/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="es_salario_fijo"
                name="es_salario_fijo"
                checked={formData.es_salario_fijo}
                onChange={handleChange}
                className="h-5 w-5 text-teal-600 focus:ring-teal-500 focus:ring-2 border-slate-300 rounded cursor-pointer"
                disabled={submitLoading}
              />
              <label htmlFor="es_salario_fijo" className="text-slate-700 font-bold select-none cursor-pointer">
                ¿El empleado tiene salario fijo?
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-8 font-medium">
              Marque esta opción si el empleado tiene un salario mensual fijo en lugar de tarifa por hora
            </p>
          </div>

          {/* Tarifa por hora (solo si no es salario fijo) */}
          {!formData.es_salario_fijo && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <label className={labelClass}>
                Tarifa por hora <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">Bs.</span>
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
                <span className="text-rose-600 text-xs mt-1.5 block font-semibold flex items-center gap-1">
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
      <div className="bg-slate-50/80 border-t border-slate-200 px-8 py-5 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          onClick={handleSubmit}
          disabled={submitLoading}
          className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:from-slate-400 disabled:to-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
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