from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schema_role import RoleCreate, RoleResponse,RoleUpdate
from app.services.role_service import RoleService

router=APIRouter()

@router.post("/",
             response_model=RoleResponse, status_code=status.HTTP_201_CREATED,
             summary="Crea un nuevo rol")
def create_role_route(role_in:RoleCreate,db:Session=Depends(get_db)):
    #registro de un nuevo rol en la base de datos 
    try:
        service=RoleService()
        db_role=service.create_role(db=db,role=role_in)
        return db_role
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El rol ya existe."
        )
@router.get("/",
            response_model=List[RoleResponse],
            summary="Obtiene datos de roles "
            )
def read_all_roles_route(
    skip:int = 0 ,
    limit:int=100,
    db:Session=Depends(get_db)
):
    #lista de todos los empleados activos 
    service=RoleService()
    roles=service.get_all_roles(db,skip=skip,limit=limit)
    return roles 

@router.get("/{rol_id}", response_model=RoleResponse, sumarry="Rol por id")
def read_roles_route(
    role_id:int,
    db:Session=Depends(get_db)
):
    #obtiene detalles de un rol mediante su id 
    #si no se encuentra erro 404
    service=RoleService()
    db_role=service.get_role_by_id(db,role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Rol no encontrado ")
    return db_role
@router.put("/{role_id}"
            ,response_model=RoleResponse,
            summary="Actualizar rol")
def update_role_route(role_id:int,
                      role_in:RoleUpdate,
                      db:Session=Depends(get_db) 
):
    #actualiza la infomracion de un rol
    #404 si el rol no existe 
    #409 error de integridad 
    service=RoleService()
    db_role=service.get_role_by_id(db,role_id=role_id)
    if db_role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )
    try:
        update_role= service.update_role(
            db=db,
            db_role=db_role,
            role_update=role_in
        )
        return update_role
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Datos repetidos con otros roles"
        )
@router.delete("/{role_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Elimina un rol")
def delete_role_router(role_id:int , db:Session=Depends(get_db)):
    #elimina un rol por id 
    service=RoleService()
    db_role=service.get_role_by_id(db,role_id=role_id)
    if db_role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )
    service.delete_role(db=db, db_role=db_role)
    return{"ok":True}
    
    