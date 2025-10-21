# rh_service/app/api/employee_router.py
# Rutas para la gestión de la entidad Employee.

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Importación de dependencias y servicios
from app.database import get_db
from app.services.employee_service import EmployeeService
from app.schemas.schema_employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

# ✅ SOLUCIÓN: Deshabilitar trailing slash redirect
router = APIRouter(redirect_slashes=False)

# ✅ CRÍTICO: Rutas SIN barra final
@router.post(
    "", 
    response_model=EmployeeResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crea un nuevo empleado"
)
def create_employee_route(
    employee_in: EmployeeCreate, 
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo empleado en la base de datos.
    
    Lanza HTTPException 409 (Conflict) si el correo electrónico ya existe.
    """
    try:
        service = EmployeeService()
        db_employee = service.create_employee(db=db, employee=employee_in)
        return db_employee
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo electrónico proporcionado ya está registrado."
        )

@router.get(
    "", 
    response_model=List[EmployeeResponse],
    summary="Obtiene todos los empleados"
)
def read_all_employees_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista paginada de todos los empleados activos e inactivos.
    """
    service = EmployeeService()
    employees = service.get_all_employees(db, skip=skip, limit=limit)
    return employees

@router.get(
    "/{employee_id}", 
    response_model=EmployeeResponse,
    summary="Obtiene un empleado por ID"
)
def read_employee_route(
    employee_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene los detalles de un empleado específico por su ID.
    
    Lanza HTTPException 404 (Not Found) si el empleado no existe.
    """
    service = EmployeeService()
    db_employee = service.get_employee_by_id(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Empleado no encontrado"
        )
    return db_employee

@router.put(
    "/{employee_id}", 
    response_model=EmployeeResponse,
    summary="Actualiza un empleado"
)
def update_employee_route(
    employee_id: int, 
    employee_in: EmployeeUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un empleado.
    
    Lanza HTTPException 404 si el empleado no existe.
    Lanza HTTPException 409 si el nuevo correo electrónico ya está en uso.
    """
    service = EmployeeService()
    
    # 1. Verificar existencia
    db_employee = service.get_employee_by_id(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Empleado no encontrado"
        )
        
    # 2. Intentar actualizar
    try:
        updated_employee = service.update_employee(
            db=db, 
            db_employee=db_employee, 
            employee_update=employee_in
        )
        return updated_employee
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nuevo correo electrónico ya está registrado por otro usuario."
        )

@router.delete(
    "/{employee_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un empleado"
)
def delete_employee_route(
    employee_id: int, 
    db: Session = Depends(get_db)
):
    """
    Elimina (baja lógica o física) un empleado por ID.
    
    Lanza HTTPException 404 si el empleado no existe.
    """
    service = EmployeeService()
    
    # 1. Verificar existencia
    db_employee = service.get_employee_by_id(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Empleado no encontrado para eliminar"
        )
        
    # 2. Eliminar
    service.delete_employee(db=db, db_employee=db_employee)
    # ✅ CORREGIDO: No devolver nada en 204
    return None