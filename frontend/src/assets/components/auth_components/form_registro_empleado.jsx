import React, { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Función de utilidad para combinar clases
const cn = (...classes) => classes.filter(Boolean).join(' ');

// 🚨 Define la URL base de tu API
const API_URL = "http://localhost:7000"; 

// ====================================================================
// COMPONENTES DE UI BÁSICOS (Se mantienen sin cambios)
// ====================================================================

const Button = ({ className, variant = "default", children, disabled, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-60 h-10 px-4 py-2";
    let variantClasses = "";

    switch (variant) {
        case "destructive": variantClasses = "bg-red-600 text-white hover:bg-red-700"; break;
        case "outline": variantClasses = "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"; break;
        case "default":
        default: variantClasses = "bg-blue-600 text-white hover:bg-blue-700"; break;
    }

    return (
        <button
            data-slot="button"
            className={cn(baseClasses, variantClasses, className)}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

const StatusMessage = ({ status, message, onClose }) => {
    if (!status) return null;

    const baseClasses = "p-4 rounded-lg flex items-center gap-3 shadow-md";
    let style = {};
    let Icon = AlertTriangle;

    switch (status) {
        case 'success':
            style = { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" };
            Icon = CheckCircle;
            break;
        case 'error':
            style = { bg: "bg-red-100", border: "border-red-400", text: "text-red-700" };
            Icon = XCircle;
            break;
        case 'loading':
        default:
            style = { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" };
            Icon = Loader2;
            break;
    }

    return (
        <div className={cn(baseClasses, style.bg, style.border, style.text, "border mt-4")}>
            {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onClose && status !== 'loading' && (
                <button onClick={onClose} className="text-current hover:opacity-80">
                    <XCircle className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};


// ====================================================================
// COMPONENTE PRINCIPAL: AHORA SINCRONIZADO CON employee_service.py
// ====================================================================

export function RegistrarEmpleadoForm() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        // Mantenemos cargo_id para la selección en el frontend, pero enviaremos el nombre como 'puesto'
        cargo_id: "",      
        sucursal_id: "",   // Se mantiene para la UI, pero se ignora en el envío por el servicio actual
        fechaIngreso: "",  // YYYY-MM-DD
        fechaSalida: "",   // YYYY-MM-DD o vacío/null (campo opcional)
        email: "",
        // Campos de Nómina requeridos por el servicio:
        tarifa_hora: "0.00",
        es_salario_fijo: false, // Por defecto, no es fijo (tarifa horaria)
    });

    const [errors, setErrors] = useState({});
    const [cargos, setCargos] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [status, setStatus] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);


    // 🚨 Función para hacer fetch con autenticación (Se mantiene igual)
    const authenticatedFetch = useCallback(async (path, options = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No se encontró token de autenticación. Inicie sesión.");
        }
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers, 
        };

        return await fetch(`${API_URL}${path}`, {
            ...options,
            headers: headers,
        });
    }, []);


    // 1. Carga de dependencias (Cargos y Sucursales) (Se mantiene igual)
    useEffect(() => {
        async function fetchData() {
            try {
                const [cargosRes, sucursalesRes] = await Promise.all([
                    authenticatedFetch("/rh/cargos"),
                    authenticatedFetch("/rh/sucursales")
                ]);

                if (!cargosRes.ok) throw new Error("Error al cargar cargos.");
                if (!sucursalesRes.ok) throw new Error("Error al cargar sucursales.");

                const cargosData = await cargosRes.json();
                const sucursalesData = await sucursalesRes.json();

                setCargos(cargosData);
                setSucursales(sucursalesData);

            } catch (err) {
                console.error("Error cargando dependencias:", err);
                setStatus({ status: 'error', message: err.message || "Error al cargar listas de cargos/sucursales." });
            }
        }
        fetchData();
    }, [authenticatedFetch]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value
        });
        setErrors({}); 
        setStatus(null); 
    };

    // 🚨 2. Función de Envío (POST /rh/empleados/): Se actualiza el Payload
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ status: 'loading', message: "Registrando empleado..." });

        const newErrors = {};
        // Campos requeridos ahora incluyen tarifa_hora y excluyen telefono
        const requiredFields = ["nombre", "apellido", "email", "cargo_id", "fechaIngreso", "tarifa_hora"]; 
        requiredFields.forEach((key) => {
            if (!formData[key] && formData[key] !== false) newErrors[key] = "Campo obligatorio";
        });
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setStatus({ status: 'error', message: "Complete todos los campos obligatorios." });
            setIsSubmitting(false);
            return;
        }

        try {
            // Buscamos el nombre del cargo seleccionado para enviarlo como 'puesto'
            const selectedCargo = cargos.find(c => c.id.toString() === formData.cargo_id);
            const puestoNombre = selectedCargo ? selectedCargo.nombre : "Sin Puesto";
            
            // PAYLOAD ACTUALIZADO para coincidir con employee_service.py
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                // Campo clave: Usamos el nombre del cargo como 'puesto' (String)
                puesto: puestoNombre, 
                fecha_ingreso: formData.fechaIngreso,
                fecha_salida: formData.fechaSalida || null, 
                
                // Campos de Nómina requeridos por el servicio
                tarifa_hora: parseFloat(formData.tarifa_hora),
                es_salario_fijo: formData.es_salario_fijo,
            };

            const response = await authenticatedFetch("/rh/empleados/", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ 
                    status: 'success', 
                    message: `¡Registro exitoso! Contraseña inicial: ${result.contrasena_inicial || 'Generada'}` 
                });
                
                // Limpiar el formulario
                setFormData(prev => ({ 
                    ...prev, 
                    nombre: "", apellido: "", cargo_id: "", sucursal_id: "", fechaIngreso: "", fechaSalida: "", email: "", tarifa_hora: "0.00", es_salario_fijo: false
                }));
                
            } else {
                const errorMessage = result.detail ? 
                    (typeof result.detail === 'string' ? result.detail : "Error de validación de datos.") : 
                    "Error desconocido al registrar.";
                
                setStatus({ status: 'error', message: `Error: ${errorMessage}` });
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            setStatus({ status: 'error', message: "Error al conectar con el servidor. Revise la consola." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm";
    const errorClass = "border-red-500 ring-red-200";

    return (
        <div className="bg-gray-50 p-6 flex justify-center min-h-[calc(100vh-50px)]">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Nuevo Registro
                </h2>
                <p className="text-gray-500 mb-6">Complete la información del nuevo colaborador.</p>

                <StatusMessage 
                    status={status?.status} 
                    message={status?.message} 
                    onClose={() => setStatus(null)} 
                />

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
                    
                    {/* Sección: Datos Personales y Contacto */}
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                        <legend className="text-lg font-semibold text-blue-700 mb-3 w-full border-b-2 border-blue-100 pb-1">Datos Básicos</legend>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre *</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                                className={cn(inputClass, errors.nombre && errorClass)} placeholder="Ej. Juan" />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Apellido *</label>
                            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                                className={cn(inputClass, errors.apellido && errorClass)} placeholder="Ej. Pérez" />
                            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Correo electrónico *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className={cn(inputClass, errors.email && errorClass)} placeholder="ejemplo@correo.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </fieldset>
                    
                    {/* Sección: Datos Laborales */}
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                        <legend className="text-lg font-semibold text-blue-700 mb-3 w-full border-b-2 border-blue-100 pb-1">Asignación y Fechas</legend>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Cargo (Se enviará como Puesto) *</label>
                            <select name="cargo_id" value={formData.cargo_id} onChange={handleChange}
                                className={cn(inputClass, errors.cargo_id && errorClass)} disabled={cargos.length === 0}>
                                <option value="">{cargos.length === 0 ? "Cargando..." : "Seleccione cargo"}</option>
                                {cargos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            {errors.cargo_id && <p className="text-red-500 text-xs mt-1">{errors.cargo_id}</p>}
                        </div>

                        {/* Sucursal: Se mantiene en la UI, pero no se envía en el payload actual por el service.py */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Sucursal (No se almacena en el servicio actual)</label>
                            <select name="sucursal_id" value={formData.sucursal_id} onChange={handleChange}
                                className={inputClass} disabled={sucursales.length === 0}>
                                <option value="">{sucursales.length === 0 ? "Cargando..." : "Seleccione sucursal"}</option>
                                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha de ingreso *</label>
                            <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange}
                                className={cn(inputClass, errors.fechaIngreso && errorClass)} />
                            {errors.fechaIngreso && <p className="text-red-500 text-xs mt-1">{errors.fechaIngreso}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha de salida (opcional)</label>
                            <input type="date" name="fechaSalida" value={formData.fechaSalida} onChange={handleChange}
                                className={inputClass} />
                        </div>
                    </fieldset>

                    {/* Sección: Datos de Nómina (Nuevos campos requeridos por el servicio) */}
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                        <legend className="text-lg font-semibold text-blue-700 mb-3 w-full border-b-2 border-blue-100 pb-1">Datos de Nómina</legend>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Tarifa por Hora *</label>
                            <input type="number" step="0.01" name="tarifa_hora" value={formData.tarifa_hora} onChange={handleChange}
                                className={cn(inputClass, errors.tarifa_hora && errorClass)} placeholder="0.00" />
                            {errors.tarifa_hora && <p className="text-red-500 text-xs mt-1">{errors.tarifa_hora}</p>}
                        </div>

                        <div className="flex items-center pt-6">
                            <input 
                                id="es_salario_fijo"
                                type="checkbox" 
                                name="es_salario_fijo" 
                                checked={formData.es_salario_fijo} 
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="es_salario_fijo" className="ml-2 text-sm font-medium text-gray-700">
                                ¿Tiene salario fijo?
                            </label>
                        </div>
                    </fieldset>

                    {/* Botón submit */}
                    <Button type="submit" className="mt-2" disabled={isSubmitting || cargos.length === 0}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Registrar Nuevo Empleado"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default RegistrarEmpleadoForm;
