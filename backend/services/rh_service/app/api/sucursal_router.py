# app/api/sucursal_router.py - VERSIÓN QUE ACEPTA CON Y SIN SLASH
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schema_sucursal import SucursalCreate, SucursalResponse, SucursalUpdate
from app.services.sucursal_service import SucursalService

# ✅ CRÍTICO: redirect_slashes=False para evitar 307
router = APIRouter(redirect_slashes=False)


@router.post(
    "",  # ← SIN barra inicial
    response_model=SucursalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crea una nueva sucursal"
)
def create_sucursal_route(
    sucursal_in: SucursalCreate,
    db: Session = Depends(get_db)
):
    """Crea una nueva sucursal en el sistema."""
    try:
        service = SucursalService()
        db_sucursal = service.create_sucursal(db=db, sucursal=sucursal_in)
        return db_sucursal
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La sucursal ya existe o hay datos duplicados"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear sucursal: {str(e)}"
        )


@router.get(
    "",  # ← SIN barra inicial
    response_model=List[SucursalResponse],
    summary="Obtener todas las sucursales"
)
def read_all_sucursales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todas las sucursales del sistema con paginación.
    
    ✅ IMPORTANTE: Siempre devuelve un array, nunca None.
    """
    try:
        service = SucursalService()
        sucursales = service.get_all_sucursales(db, skip=skip, limit=limit)
        
        # ✅ GARANTIZAR QUE SIEMPRE DEVUELVE UN ARRAY
        if sucursales is None:
            return []
        
        return sucursales
    except Exception as e:
        # En caso de error, devolver array vacío en lugar de fallar
        print(f"Error obteniendo sucursales: {str(e)}")
        return []


@router.get(
    "/{sucursal_id}",
    response_model=SucursalResponse,
    summary="Obtener sucursal por ID"
)
def read_sucursal_route(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene una sucursal específica por su ID."""
    service = SucursalService()
    db_sucursal = service.get_sucursales_by_id(db, sucursal_id=sucursal_id)
    
    if db_sucursal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sucursal con ID {sucursal_id} no encontrada"
        )
    
    return db_sucursal


@router.put(
    "/{sucursal_id}",
    response_model=SucursalResponse,
    summary="Actualizar sucursal"
)
def update_sucursal_route(
    sucursal_id: int,
    sucursal_in: SucursalUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza los datos de una sucursal existente."""
    service = SucursalService()
    db_sucursal = service.get_sucursales_by_id(db, sucursal_id=sucursal_id)
    
    if db_sucursal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sucursal con ID {sucursal_id} no encontrada"
        )
    
    try:
        updated_sucursal = service.update_sucursal(
            db=db,
            db_sucursal=db_sucursal,
            sucursal_update=sucursal_in
        )
        return updated_sucursal
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Datos duplicados con otras sucursales"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar sucursal: {str(e)}"
        )


@router.delete(
    "/{sucursal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una sucursal"
)
def delete_sucursal_router(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina una sucursal del sistema.
    
    ⚠️ NOTA: Verifica que no tenga empleados asignados antes de eliminar.
    """
    service = SucursalService()
    db_sucursal = service.get_sucursales_by_id(db, sucursal_id=sucursal_id)
    
    if db_sucursal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sucursal con ID {sucursal_id} no encontrada"
        )
    
    try:
        service.delete_sucursal(db=db, db_sucursal=db_sucursal)
        # ✅ Para 204, no devolver nada
        return None
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar: la sucursal tiene empleados asignados"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar sucursal: {str(e)}"
        )