import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "../ui/dialog";
import { Button } from "../ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

export function NewDocumentDialog({ open, onOpenChange, onDocumentCreated }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    tipo: "",
    url_archivo: "",
    fecha_vencimiento: "",
    aprobado_admin: true
  });

  // Cargar empleados al abrir el modal
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rh/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentData = {
        tipo: formData.tipo,
        url_archivo: formData.url_archivo,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        aprobado_admin: formData.aprobado_admin
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/rh/documents/employees/${formData.employee_id}/documents`,
        documentData
      );

      console.log("✅ Documento creado:", response.data);
      
      // Resetear formulario
      setFormData({
        employee_id: "",
        tipo: "",
        url_archivo: "",
        fecha_vencimiento: "",
        aprobado_admin: true
      });

      // Cerrar modal y notificar al padre
      onOpenChange(false);
      if (onDocumentCreated) {
        onDocumentCreated(response.data);
      }
    } catch (error) {
      console.error("❌ Error creating document:", error);
      alert("Error al crear el documento: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13161C] border border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white font-['Outfit']">
            📄 Nuevo Documento Legal
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Registra una nueva licencia o permiso asociado a un empleado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Empleado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Empleado Responsable *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0c0e12] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2A9D8F] transition-colors"
            >
              <option value="">Selecciona un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido_paterno}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de documento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Documento *
            </label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              placeholder="Ej: Licencia de Funcionamiento, Certificado Sanitario"
              className="w-full px-4 py-3 bg-[#0c0e12] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2A9D8F] transition-colors"
            />
          </div>

          {/* URL del archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL del Archivo *
            </label>
            <input
              type="url"
              name="url_archivo"
              value={formData.url_archivo}
              onChange={handleChange}
              required
              placeholder="https://example.com/documentos/licencia.pdf"
              className="w-full px-4 py-3 bg-[#0c0e12] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2A9D8F] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 URL donde está almacenado el documento (Google Drive, Dropbox, etc.)
            </p>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Vencimiento (Opcional)
            </label>
            <input
              type="date"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0c0e12] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2A9D8F] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío si el documento no tiene vencimiento
            </p>
          </div>

          {/* Aprobado */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <input
              type="checkbox"
              name="aprobado_admin"
              id="aprobado_admin"
              checked={formData.aprobado_admin}
              onChange={handleChange}
              className="w-5 h-5 rounded border-white/20 bg-[#0c0e12] text-[#2A9D8F] focus:ring-[#2A9D8F] focus:ring-offset-0"
            />
            <label htmlFor="aprobado_admin" className="text-sm text-gray-300 cursor-pointer">
              ✅ Marcar como aprobado por administrador
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white hover:from-[#2A9D8F] hover:to-[#1B4F55]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Documento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
