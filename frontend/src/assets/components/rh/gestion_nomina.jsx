import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../../Ui/Card.jsx";
import { Button } from "../../Ui/Button.jsx";
import { Badge } from "../../Ui/Badge.jsx";

// --- Componente fila de empleado ---
const EmpleadoFila = ({ empleado, onEditar, onEliminar }) => {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-2">{empleado.nombre}</td>
      <td className="px-4 py-2">{empleado.apellido}</td>
      <td className="px-4 py-2">{empleado.cargo}</td>
      <td className="px-4 py-2">{empleado.sucursal}</td>
      <td className="px-4 py-2">{empleado.email}</td>
      <td className="px-4 py-2">{empleado.telefono}</td>
      <td className="px-4 py-2">
        <Badge className={`px-2 py-1 rounded-full text-xs ${
          empleado.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {empleado.estado}
        </Badge>
      </td>
      <td className="px-4 py-2 flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => onEditar(empleado)}>
          ✏️
        </Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800" onClick={() => onEliminar(empleado)}>
          🗑️
        </Button>
      </td>
    </tr>
  );
};

// --- Modal de agregar/editar empleado ---
const EmpleadoModal = ({ visible, onCerrar, onGuardar, empleadoSeleccionado }) => {
  const [empleado, setEmpleado] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cargo_id: "",
    sucursal_id: "",
    fecha_ingreso: "",
    fecha_salida: "",
    estado: "activo",
  });

  useEffect(() => {
    if (empleadoSeleccionado) setEmpleado(empleadoSeleccionado);
  }, [empleadoSeleccionado]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleado({ ...empleado, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onGuardar({
      ...empleado,
      cargo_id: parseInt(empleado.cargo_id),
      sucursal_id: parseInt(empleado.sucursal_id),
    });
    setEmpleado({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      cargo_id: "",
      sucursal_id: "",
      fecha_ingreso: "",
      fecha_salida: "",
      estado: "activo",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="relative w-full max-w-lg p-6 transform transition-all duration-300 scale-95">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onCerrar}
        >
          ✕
        </button>
        <CardTitle className="text-xl font-semibold mb-4">
          {empleadoSeleccionado ? "Editar Empleado" : "Agregar Empleado"}
        </CardTitle>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input name="nombre" value={empleado.nombre} onChange={handleChange} placeholder="Nombre" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="apellido" value={empleado.apellido} onChange={handleChange} placeholder="Apellido" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="email" value={empleado.email} onChange={handleChange} placeholder="Email" type="email" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="telefono" value={empleado.telefono} onChange={handleChange} placeholder="Teléfono" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" />
          <input name="cargo_id" value={empleado.cargo_id} onChange={handleChange} placeholder="Cargo ID" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="sucursal_id" value={empleado.sucursal_id} onChange={handleChange} placeholder="Sucursal ID" className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="fecha_ingreso" type="date" value={empleado.fecha_ingreso} onChange={handleChange} className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" required />
          <input name="fecha_salida" type="date" value={empleado.fecha_salida} onChange={handleChange} className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700" />
          <select name="estado" value={empleado.estado} onChange={handleChange} className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-700">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- Modal de confirmación ---
const ConfirmModal = ({ visible, mensaje, onConfirmar, onCancelar }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="relative w-full max-w-sm p-6">
        <p className="mb-4">{mensaje}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirmar}>Eliminar</Button>
        </div>
      </Card>
    </div>
  );
};

// --- Botón flotante ---
const BotonFlotante = ({ onClick }) => (
  <Button className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg text-2xl" onClick={onClick}>
    +
  </Button>
);

// --- Componente principal ---
const GestionNomina = () => {
  const [empleados, setEmpleados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [filtros, setFiltros] = useState({ busqueda: "" });

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/empleados");
        const data = await res.json();
        if (data.success) setEmpleados(data.empleados);
        else console.error("Error backend:", data.error);
      } catch (err) {
        console.error("Error al cargar empleados:", err);
      }
    };
    cargarEmpleados();
  }, []);

  const guardarEmpleado = async (empleado) => {
    try {
      const res = await fetch("http://localhost:5000/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empleado),
      });
      const data = await res.json();
      if (data.success) {
        setEmpleados((prev) => [...prev, { ...empleado, id: data.empleado.empleado_id }]);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    }
    setModalVisible(false);
    setEmpleadoSeleccionado(null);
  };

  const editarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalVisible(true);
  };

  const eliminarEmpleado = async () => {
    setEmpleados((prev) => prev.filter((e) => e.id !== empleadoAEliminar.id));
    setModalEliminarVisible(false);
    setEmpleadoAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalEliminarVisible(false);
    setEmpleadoAEliminar(null);
  };

  const empleadosFiltrados = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      <Card className="bg-white border border-gray-200 shadow-sm p-4">
        <CardTitle className="text-xl font-semibold mb-2">Gestión y Nómina</CardTitle>
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          className="border px-3 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-purple-700 w-full max-w-md"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Apellido</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Sucursal</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map((empleado, index) => (
                <EmpleadoFila
                  key={empleado.id || index}
                  empleado={empleado}
                  onEditar={editarEmpleado}
                  onEliminar={() => setEmpleadoAEliminar(empleado) || setModalEliminarVisible(true)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EmpleadoModal
        visible={modalVisible}
        onCerrar={() => setModalVisible(false)}
        onGuardar={guardarEmpleado}
        empleadoSeleccionado={empleadoSeleccionado}
      />

      <ConfirmModal
        visible={modalEliminarVisible}
        mensaje={`¿Desea eliminar a ${empleadoAEliminar?.nombre}?`}
        onConfirmar={eliminarEmpleado}
        onCancelar={cancelarEliminar}
      />

      <BotonFlotante onClick={() => setModalVisible(true)} />
    </div>
  );
};

export default GestionNomina;
