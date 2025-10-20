from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schema_sucursal import SucursalCreate,SucursalResponse,SucursalUpdate
from app.services.sucursal_service import SucursalService

router= APIRouter()


@router.post("/", response_model=SucursalResponse, status_code=status.HTTP_201_CREATED,summary="crea una nueva sucursal")
def create_sucursal_route(sucursal_in:SucursalCreate,db:Session=Depends(get_db)):
    try:
        service=SucursalService()
        db_sucursal=service.create_sucursal(db=db,sucursal=sucursal_in)
        return db_sucursal
    except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La sucursal ya existe"
            )
@router.get("/", response_model=List[SucursalResponse], summary="Obtener los datos de las sucursales ")
def read_all_sucursales(
    skip:int= 0 ,
    limit:int = 100, 
    db: Session=Depends(get_db)
):
    #lsita todas las sucursales 
    service=SucursalService()
    sucursal=service.get_all_sucursales(db,skip=skip,limit=limit)
    return sucursal
@router.get("/{sucursal_id}", response_model=SucursalResponse,summary="Obtener sucrusal por id ")
def read_sucursal_route(sucursal_id:int, db:Session=Depends(get_db)):
    service=SucursalService()
    db_sucursal= service.get_sucursales_by_id(db,sucursal_id=sucursal_id)
    if db_sucursal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada")
    return db_sucursal

@router.put("/{sucursal_id}", response_model=SucursalResponse, summary="Actualizar sucursal")
def update_sucursal_route(sucursal_id: int , sucursal_in:SucursalUpdate, db:Session=Depends(get_db)):
    service=SucursalService()
    db_sucursal=service.get_sucursales_by_id(db,sucursal_id=sucursal_id)
    if db_sucursal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )
    try:
        update_sucursal= service.update_sucursal(
            db=db,
            db_sucursal=db_sucursal,
            sucursal_update=sucursal_in
        )
        return update_sucursal
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Datos repetidos con las sucursales "
        )
@router.delete("/{sucursal_id}", status_code=status.HTTP_204_NO_CONTENT,summary="Elimina una sucursal")
def delete_sucursal_router(sucursal_id: int , db:Session=Depends(get_db)):
    #elimina una sucursal con su id
    service=SucursalService()
    db_sucursal=service.get_sucursales_by_id(db,sucursal_id=sucursal_id)
    if db_sucursal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada"
        )
    service.delete_role(db=db, db_sucursal=db_sucursal)
    return{"ok":True}
    