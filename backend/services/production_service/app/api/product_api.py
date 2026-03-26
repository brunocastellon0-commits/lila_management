from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import app.services.product_service as service
import app.schemas.producto_schema as schemas
from app.db import get_db

router = APIRouter()
# ============================================================
# CREACIÓN DEL ROUTER
# ============================================================
# APIRouter es como un "sub-aplicación" de FastAPI.
# - prefix:   todas las rutas aquí empiezan con /products
# - tags:     agrupa los endpoints en la documentación /docs
# ============================================================
"""ira en el base.py"""

# ============================================================
# GET /products
# Obtener lista de productos
# ============================================================
# @router.get(...)  →  declara que esta función responde a GET
# response_model    →  FastAPI serializa la respuesta usando este schema
#                      (filtra campos que no quieras exponer)
# ============================================================
@router.get("/", response_model=list[schemas.ProductResponse])
def read_products(
    skip: int = Query(default=0, ge=0, description="Cuántos registros saltar (paginación)"),
    limit: int = Query(default=100, ge=1, le=500, description="Máximo de registros a devolver"),
    solo_activos: bool = Query(default=True, description="Si True, solo devuelve productos activos"),
    db: Session = Depends(get_db),

):
    """Devuelve una lista paginada de productos."""
    products = service.get_products(db, skip=skip, limit=limit, solo_activos=solo_activos)
    return products


# ============================================================
# GET /products/{product_id}
# Obtener un producto por ID
# ============================================================
# {product_id} en la URL es un "path parameter".
# FastAPI lo convierte automáticamente al tipo declarado (int).
# ============================================================
@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Devuelve un producto específico. Lanza 404 si no existe."""
    db_product = service.get_product(db, product_id=product_id)

    if db_product is None:
        # HTTPException detiene la ejecución y devuelve un error HTTP
        # status.HTTP_404_NOT_FOUND  →  es simplemente el número 404,
        # pero usar la constante hace el código más legible y menos propenso a errores tipográficos
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )

    return db_product


# ============================================================
# POST /products
# Crear un nuevo producto
# ============================================================
# El parámetro valdia que el json venga como lo definimos en product schema
# Si la validación falla, FastAPI responde automáticamente con 422.
#
# status_code=201  →  HTTP 201 Created es la convención para recursos creados
# ============================================================
@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
):
    """Crea un nuevo producto y lo devuelve con su ID asignado."""
    return service.create_product(db=db, product=product)


# ============================================================
# PATCH /products/{product_id}
# Actualizar parcialmente un producto
# ============================================================
# Usamos PATCH  porque ProductUpdate tiene todos los campos
# opcionales (exclude_unset=True en el servicio).
# ============================================================
@router.patch("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza solo los campos enviados de un producto existente."""
    updated = service.update_product(db=db, product_id=product_id, product_update=product_update)

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )

    return updated


# ============================================================
# DELETE /products/{product_id}
# Soft delete: desactiva el producto (no lo borra físicamente)
# ============================================================
# Devolvemos el producto modificado (con activo=False) para que
# el cliente confirme qué fue desactivado.
# ============================================================
@router.delete("/{product_id}", response_model=schemas.ProductResponse)
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) un producto. No lo elimina de la base de datos."""
    deactivated = service.deactivate_product(db=db, product_id=product_id)

    if deactivated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )

    return deactivated


# ============================================================
# DELETE /products/{product_id}/permanent
# Hard delete: borra físicamente (usar con precaución)
# ============================================================
# Subrutas como /permanent evitan ambigüedad.
# HTTP 204 No Content es la convención cuando no hay body en la respuesta.
# response_model=None porque no devolvemos datos, solo confirmación.
# ============================================================
@router.delete("/{product_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_permanently(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Elimina permanentemente un producto. ¡Irreversible!"""
    deleted = service.delete_product_permanently(db=db, product_id=product_id)

    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {product_id} no encontrado",
        )
    # Sin return: HTTP 204 no envía body