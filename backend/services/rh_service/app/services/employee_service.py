# rh_service/app/services/employee_service.py

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List

# Importa el modelo ORM (tabla) y los schemas Pydantic
from app.models.employee import Employee
from app.schemas.schema_employee import EmployeeCreate, EmployeeUpdate

class EmployeeService:
    """
    Contiene la lógica de negocio para las operaciones CRUD 
    sobre el modelo Employee.
    """

    def get_employee_by_id(self, db: Session, employee_id: int) -> Employee:
        """
        Obtiene un empleado por su ID.
        Lanza 404 si no se encuentra.
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Empleado con ID {employee_id} no encontrado.")
        return employee

    def get_all_employees(self, db: Session, skip: int = 0, limit: int = 100) -> List[Employee]:
        """
        Obtiene una lista paginada de todos los empleados.
        """
        return db.query(Employee).offset(skip).limit(limit).all()

    def create_employee(self, db: Session, employee: EmployeeCreate) -> Employee:
        """
        Crea un nuevo registro de empleado en la base de datos.
        Maneja errores de duplicación de email (IntegrityError).
        """
        db_employee = Employee(
            nombre=employee.nombre,
            apellido=employee.apellido,
            email=employee.email,
            puesto=employee.puesto,
            fecha_ingreso=employee.fecha_ingreso,
            # Campos de nómina
            tarifa_hora=employee.tarifa_hora,
            es_salario_fijo=employee.es_salario_fijo
        )
        
        try:
            db.add(db_employee)
            db.commit()
            db.refresh(db_employee)
            return db_employee
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="El correo electrónico ya está registrado.")
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Error desconocido al crear empleado.")


    def update_employee(self, db: Session, employee_id: int, employee_update: EmployeeUpdate) -> Employee:
        """
        Actualiza los campos de un empleado existente.
        """
        db_employee = self.get_employee_by_id(db, employee_id)

        # Convierte el schema de Pydantic a un diccionario, excluyendo campos no establecidos
        update_data = employee_update.model_dump(exclude_unset=True)
        
        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_employee, key, value)
            
        try:
            db.add(db_employee)
            db.commit()
            db.refresh(db_employee)
            return db_employee
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="El correo electrónico actualizado ya está en uso.")
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Error desconocido al actualizar empleado.")


    def delete_employee(self, db: Session, employee_id: int) -> dict:
        """
        Elimina un empleado de la base de datos.
        """
        db_employee = self.get_employee_by_id(db, employee_id)
        
        db.delete(db_employee)
        db.commit()
        return {"message": f"Empleado con ID {employee_id} eliminado exitosamente."}
