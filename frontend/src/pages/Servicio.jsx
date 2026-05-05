import { useState, useEffect, useCallback } from 'react';
import { TableMap } from '../assets/components/servicio/ServicioTableMap';
import { OrderPanel } from '../assets/components/servicio/OrderPanel';
import servicioApi from '../services/servicioApi';

const IMG_DEFAULT = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=80';

const mapMesaState = (estadoDB) => {
    const s = estadoDB?.toLowerCase() || 'libre';
    if (s === 'libre') return 'available';
    if (s === 'ocupado') return 'occupied';
    if (s === 'reservado') return 'available';
    if (s === 'atencion') return 'attention';
    return 'available';
};

export default function Servicio() {
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState({});
    const [tick, setTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sesionId, setSesionId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [mesasData, pedidosActivos] = await Promise.all([
                servicioApi.getMesas(),
                servicioApi.getPedidosKds(),
            ]);

            const mappedTables = mesasData.map(m => ({
                id: m.id,
                number: m.numero,
                shape: m.forma,
                chairs: m.capacidad,
                state: mapMesaState(m.estado_actual),
                zone: m.zona,
                server: m.nombre_mesero || null,
                startTs: m.timestamp_ocupacion ? new Date(m.timestamp_ocupacion).getTime() : null,
            }));
            setTables(mappedTables);

            const mappedOrders = {};
            pedidosActivos.forEach(pedido => {
                if (pedido.id_mesa) {
                    mappedOrders[pedido.id_mesa] = {
                        id: pedido.id,
                        tableId: pedido.id_mesa,
                        stage: pedido.estado_pedido?.toLowerCase().replace(' ', '-') || 'pendiente',
                        paymentMethod: 'cash',
                        items: pedido.detalles.map(d => ({
                            id: d.id,
                            id_producto: d.id_producto,
                            name: d.nombre_producto || `Producto #${d.id_producto}`,
                            category: d.estacion_cocina || 'Fuegos',
                            price: parseFloat(d.precio_unitario),
                            qty: parseFloat(d.cantidad),
                            image: IMG_DEFAULT,
                            notes: d.notas ? [d.notas] : [],
                        }))
                    };
                }
            });
            setOrders(mappedOrders);

            setSelectedTableId(prev => prev ?? (mappedTables[0]?.id ?? null));
        } catch (err) {
            console.error('Error cargando salón:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener sesión activa al montar
    useEffect(() => {
        servicioApi.getSesionActiva(1)
            .then(s => setSesionId(s.id))
            .catch(() => setSesionId(1)); // fallback al seed
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    // ── Callbacks para OrderPanel ──────────────────────────────────────────

    const handleAbrirMesa = useCallback(async (mesaId, meseroId) => {
        try {
            await servicioApi.cambiarEstadoMesa(mesaId, {
                estado_actual: 'Ocupado',
                id_mesero_asignado: meseroId || null,
            });
            await fetchData();
        } catch (err) {
            console.error('Error abriendo mesa:', err);
            alert('No se pudo abrir la mesa. Revisa la conexión.');
        }
    }, [fetchData]);

    const handleEnviarCocina = useCallback(async (mesaId, items, cubiertos) => {
        if (!sesionId) { alert('No hay sesión de caja activa.'); return; }
        try {
            const payload = {
                id_sesion: sesionId,
                id_mesa: mesaId,
                cubiertos: cubiertos || 1,
                detalles: items.map(i => ({
                    id_producto: i.id_producto,
                    cantidad: i.qty,
                    notas: i.notes?.[0] || null,
                    estacion_cocina: i.category || 'Fuegos',
                })),
            };
            await servicioApi.crearPedido(payload);
            // Marcar mesa como ocupada
            await servicioApi.cambiarEstadoMesa(mesaId, { estado_actual: 'Ocupado' });
            await fetchData();
        } catch (err) {
            console.error('Error enviando a cocina:', err);
            alert(`Error: ${err.response?.data?.detail || 'No se pudo crear el pedido.'}`);
        }
    }, [sesionId, fetchData]);

    const handleCobrar = useCallback(async (mesaId, orderId, total, metodoPago) => {
        const metodosMap = { cash: 'Efectivo', card: 'Tarjeta', qr: 'QR' };
        const metodo = metodosMap[metodoPago] || 'Efectivo';
        try {
            await servicioApi.pagarPedido(orderId, [{ metodo_pago: metodo, monto: total }]);
            await servicioApi.cambiarEstadoMesa(mesaId, { estado_actual: 'Libre' });
            await fetchData();
        } catch (err) {
            console.error('Error cobrando:', err);
            alert(`Error al cobrar: ${err.response?.data?.detail || err.message}`);
        }
    }, [fetchData]);

    const handleMovimientoCaja = useCallback(async (tipo, monto, concepto) => {
        if (!sesionId) { alert('No hay sesión activa.'); return; }
        try {
            await servicioApi.crearMovimiento({
                id_sesion: sesionId,
                tipo_movimiento: tipo === 'entrada' ? 'Ingreso' : 'Egreso',
                concepto: concepto || (tipo === 'entrada' ? 'Ingreso manual' : 'Egreso manual'),
                metodo_pago: 'Efectivo',
                monto: parseFloat(monto),
            });
        } catch (err) {
            console.error('Error movimiento caja:', err);
            alert(`Error: ${err.response?.data?.detail || err.message}`);
        }
    }, [sesionId]);

    const handleUpdateQty = useCallback((itemId, qty) => {
        setOrders(prev => {
            const order = prev[selectedTableId];
            if (!order) return prev;
            return {
                ...prev,
                [selectedTableId]: {
                    ...order,
                    items: qty <= 0
                        ? order.items.filter(i => i.id !== itemId)
                        : order.items.map(i => i.id === itemId ? { ...i, qty } : i),
                },
            };
        });
    }, [selectedTableId]);

    const handleSetPayment = useCallback((method) => {
        setOrders(prev => {
            const order = prev[selectedTableId];
            if (!order) return prev;
            return { ...prev, [selectedTableId]: { ...order, paymentMethod: method } };
        });
    }, [selectedTableId]);

    const selectedTable = tables.find(t => t.id === selectedTableId) ?? tables[0] ?? null;
    const selectedOrder = selectedTableId ? orders[selectedTableId] : null;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#12121E', color: '#8B8B99', fontFamily: "'Inter', sans-serif" }}>
                Cargando salón...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#12121E', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                    <TableMap
                        tables={tables}
                        selectedId={selectedTableId}
                        onSelect={setSelectedTableId}
                        tick={tick}
                    />
                    <OrderPanel
                        table={selectedTable}
                        order={selectedOrder}
                        onUpdateQty={handleUpdateQty}
                        onSetPayment={handleSetPayment}
                        onAbrirMesa={handleAbrirMesa}
                        onEnviarCocina={handleEnviarCocina}
                        onCobrar={handleCobrar}
                        onMovimientoCaja={handleMovimientoCaja}
                    />
                </div>
            </div>
        </div>
    );
}