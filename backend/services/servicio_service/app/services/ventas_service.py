import os
import httpx
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from typing import List

from app.models.ventas_model import DetallePedido
from app.schemas.ventas_schema import DetallePedidoCreate, DetallePedidoUpdate


# URL base del microservicio de producción/inventario
PRODUCTION_SERVICE_URL = os.getenv("PRODUCTION_SERVICE_URL", "http://localhost:8002")


class DetallePedidoService:
    """
    Lógica de negocio para las líneas de detalle de un pedido.

    Responsabilidad clave:
        - Consultar al production_service el precio actual del producto.
        - Congelar ese precio como snapshot en precio_unitario.
        - Calcular el subtotal de cada línea.

    La actualización del total del Pedido padre es responsabilidad
    de PedidoService (que llama a este service de forma orquestada).
    """

    # ------------------------------------------------------------------
    # Comunicación con production_service
    # ------------------------------------------------------------------

    def _fetch_producto(self, id_producto: int) -> dict:
        """
        Consulta el production_service para obtener datos del producto.

        Retorna el dict JSON con al menos: id, name, costo, activo.
        Lanza HTTPException si el producto no existe o el servicio no responde.
        """
        url = f"{PRODUCTION_SERVICE_URL}/products/{id_producto}"
        try:
            with httpx.Client(timeout=8.0) as client:
                response = client.get(url)

            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {id_producto} no existe en el catálogo."
                )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"El servicio de producción devolvió un error inesperado "
                           f"(HTTP {response.status_code}) para el producto {id_producto}."
                )

            producto = response.json()

            if not producto.get("activo", True):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El producto '{producto.get('name')}' (ID: {id_producto}) "
                           "está inactivo y no puede agregarse a un pedido."
                )

            return producto

        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No se pudo conectar con el servicio de producción/inventario."
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Tiempo de espera agotado al consultar el servicio de producción."
            )
        except HTTPException:
            raise  # Re-lanzar las ya formateadas

    # ------------------------------------------------------------------
    # Creación de una línea de detalle
    # ------------------------------------------------------------------

    def crear_detalle(
        self, db: Session, id_pedido: int, data: DetallePedidoCreate
    ) -> DetallePedido:
        """
        Crea una línea de detalle para el pedido indicado.

        1. Obtiene el precio actual desde el production_service.
        2. Congela el precio como snapshot (precio_unitario).
        3. Calcula el subtotal = cantidad × precio_unitario.
        4. Persiste el registro.

        El llamador (PedidoService) es responsable de recalcular
        el total del pedido tras llamar a este método.
        """
        producto = self._fetch_producto(data.id_producto)
        precio_unitario = Decimal(str(producto["costo"]))
        subtotal = data.cantidad * precio_unitario

        detalle = DetallePedido(
            id_pedido=id_pedido,
            id_producto=data.id_producto,
            nombre_producto=producto.get("name", f"Producto #{data.id_producto}"),
            cantidad=data.cantidad,
            precio_unitario=precio_unitario,
            subtotal=subtotal,
            notas=data.notas,
            estacion_cocina=data.estacion_cocina.value if data.estacion_cocina else "Fuegos",
            estado_preparacion="Pendiente",
        )
        try:
            db.add(detalle)
            db.flush()  # Obtiene el ID sin hacer commit (el Pedido padre hace el commit)
            return detalle
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al agregar la línea de detalle: {e}"
            )

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def get_by_id(self, db: Session, detalle_id: int) -> DetallePedido:
        detalle = db.query(DetallePedido).filter(DetallePedido.id == detalle_id).first()
        if not detalle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Detalle de pedido con ID {detalle_id} no encontrado."
            )
        return detalle

    def get_by_pedido(self, db: Session, id_pedido: int) -> List[DetallePedido]:
        """Lista todos los detalles de un pedido."""
        return db.query(DetallePedido).filter(DetallePedido.id_pedido == id_pedido).all()

    # ------------------------------------------------------------------
    # Actualización (correcciones antes de ir a cocina)
    # ------------------------------------------------------------------

    def update(
        self, db: Session, detalle_id: int, data: DetallePedidoUpdate
    ) -> DetallePedido:
        """
        Permite corregir cantidad, notas o estado de preparación de una línea.
        Si se cambia la cantidad, recalcula el subtotal automáticamente.

        Restricción: no se puede modificar una línea si ya está en estado 'Entregado'.
        """
        detalle = self.get_by_id(db, detalle_id)

        if detalle.estado_preparacion == "Entregado":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede modificar una línea de detalle que ya fue entregada."
            )

        update_data = data.model_dump(exclude_unset=True)

        # Recalcular subtotal si cambia la cantidad
        if "cantidad" in update_data:
            update_data["subtotal"] = update_data["cantidad"] * detalle.precio_unitario

        if "estado_preparacion" in update_data and update_data["estado_preparacion"] is not None:
            update_data["estado_preparacion"] = update_data["estado_preparacion"].value

        for key, value in update_data.items():
            setattr(detalle, key, value)

        try:
            db.commit()
            db.refresh(detalle)
            return detalle
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar el detalle: {e}"
            )
