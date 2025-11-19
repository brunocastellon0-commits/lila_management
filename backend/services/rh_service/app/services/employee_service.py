# rh_service/app/services/employee_service.py

from sqlalchemy.orm import Session,joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List

# Importa el modelo ORM (tabla) y los schemas Pydantic
from app.models.employee import Employee
from app.schemas.schema_employee import EmployeeCreate, EmployeeUpdate,EmployeeResponse,EmployeeWithUserCreate

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
        return db.query(Employee)\
            .options(
                joinedload(Employee.rol),
                joinedload(Employee.sucursal)
            )\
            .offset(skip)\
            .limit(limit)\
            .all()
    def create_employee(self, db: Session, employee: EmployeeCreate) -> Employee:
         """
         Crea un nuevo registro de empleado en la base de datos.
         Maneja errores de duplicación de email (IntegrityError).
         """
         # FIX: Se cambiaron 'role' y 'sucursal' por los nombres de las columnas de clave foránea
         # ('rol_id' y 'sucursal_id') para evitar el TypeError de SQLAlchemy.
         db_employee = Employee(
            nombre=employee.nombre,
            apellido=employee.apellido,
            email=employee.email,
            puesto=employee.puesto,
            fecha_ingreso=employee.fecha_ingreso,
            # Campos de nómina
            tarifa_hora=employee.tarifa_hora,
            es_salario_fijo=employee.es_salario_fijo,
    
            # --- CAMBIOS APLICADOS ---
            rol_id=employee.rol_id,
            sucursal_id=employee.sucursal_id
    
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
         except Exception as e:
            db.rollback()
            # MODIFICACIÓN CLAVE: Incluir el mensaje de error de la base de datos (e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail=f"Error interno al crear empleado (BD): {e}")

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



    def create_employee_with_user(self, db: Session, employee_data: EmployeeWithUserCreate) -> Employee:
            """
            1. Separa los datos (Usuario vs Empleado).
            2. Guarda el Empleado en la BD local.
            3. (Opcional) Aquí podrías llamar al User Service para crear el usuario.
            """
            # 1. Convertimos a diccionario
            full_data = employee_data.model_dump()
            
            # 2. Extraemos y quitamos los campos que NO son de la tabla Employee
            username = full_data.pop("username")  
            password = full_data.pop("password")
            
            # full_data ahora solo tiene: nombre, apellido, email, sucursal_id, etc.

            # 3. Creamos la instancia del modelo Employee
            db_employee = Employee(**full_data)

            try:
                db.add(db_employee)
                db.commit()
                db.refresh(db_employee)
                
                # --- IMPORTANTE ---
                # Aquí ya tienes el empleado creado (db_employee.id).
                # En un futuro, aquí agregarás la llamada HTTP a tu User Service 
                # enviando el username, password y el db_employee.id.
                print(f"DEBUG: Empleado creado ID {db_employee.id}. Usuario '{username}' pendiente de registro en Auth Service.")
                
                return db_employee

            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="El correo electrónico ya está registrado."
                )
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    detail=f"Error al crear empleado con usuario: {str(e)}"
                )