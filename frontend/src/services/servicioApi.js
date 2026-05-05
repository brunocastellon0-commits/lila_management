import api from './api';

const servicioApi = {
  // ─── Analytics ────────────────────────────────────────────────────────
  getDashboardResumen: async () => {
    const { data } = await api.get('/servicio/analytics/resumen');
    return data;
  },
  getIngresosHoy: async () => {
    const { data } = await api.get('/servicio/analytics/ingresos-hoy');
    return data;
  },
  getIngresosSemana: async () => {
    const { data } = await api.get('/servicio/analytics/ingresos-semana');
    return data;
  },

  // ─── Mesas ─────────────────────────────────────────────────────────────
  getMesas: async (params = {}) => {
    const { data } = await api.get('/servicio/mesas', { params });
    return data;
  },
  cambiarEstadoMesa: async (id, payload) => {
    const { data } = await api.patch(`/servicio/mesas/${id}/estado`, payload);
    return data;
  },

  // ─── Pedidos ────────────────────────────────────────────────────────────
  getPedidosKds: async (estacion = null) => {
    const params = estacion ? { estacion } : {};
    const { data } = await api.get('/servicio/pedidos/kds', { params });
    return data;
  },
  getHistorialPedidos: async (params = {}) => {
    const { data } = await api.get('/servicio/pedidos/historial', { params });
    return data;
  },
  crearPedido: async (payload) => {
    const { data } = await api.post('/servicio/pedidos', payload);
    return data;
  },
  actualizarPedido: async (id, payload) => {
    const { data } = await api.patch(`/servicio/pedidos/${id}`, payload);
    return data;
  },
  pagarPedido: async (id, pagos) => {
    // pagos: [{metodo_pago: "Efectivo", monto: 100}]
    const { data } = await api.post(`/servicio/pedidos/${id}/pagar`, pagos);
    return data;
  },
  anularPedido: async (id) => {
    const { data } = await api.post(`/servicio/pedidos/${id}/anular`);
    return data;
  },

  // ─── Detalles de Pedido ─────────────────────────────────────────────────
  actualizarEstadoDetalle: async (id, estado_preparacion) => {
    const { data } = await api.patch(`/servicio/detalles/${id}`, { estado_preparacion });
    return data;
  },

  // ─── Inventario ────────────────────────────────────────────────────────
  getInventario: async (params = {}) => {
    const { data } = await api.get('/servicio/inventario', { params });
    return data;
  },
  registrarRecepcion: async (payload) => {
    const { data } = await api.post('/servicio/inventario/recepcion', payload);
    return data;
  },

  // ─── Sesiones de Caja ──────────────────────────────────────────────────
  getSesionActiva: async (cajaId = 1) => {
    const { data } = await api.get(`/servicio/sesiones/caja/${cajaId}/activa`);
    return data;
  },

  // ─── Movimientos de Caja ───────────────────────────────────────────────
  crearMovimiento: async (payload) => {
    // payload: { id_sesion, tipo_movimiento, concepto, metodo_pago, monto }
    const { data } = await api.post('/servicio/movimientos', payload);
    return data;
  },

  // ─── Producción (catálogo de productos para el menú) ───────────────────
  getProductos: async () => {
    const { data } = await api.get('/produccion/products');
    return data;
  },

  // ─── Recursos Humanos ──────────────────────────────────────────────────
  getEmpleadosActivos: async () => {
    const { data } = await api.get('/rh/employees', { params: { is_active: true } });
    return data;
  },
};

export default servicioApi;
