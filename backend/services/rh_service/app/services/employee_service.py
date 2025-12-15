# rh_service/app/services/employee_service.py

from sqlalchemy.orm import Session,joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List
import httpx
import os

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
        
        # Si se está actualizando el email, verificar que no esté en uso por otro empleado
        if 'email' in update_data and update_data['email'] != db_employee.email:
            existing_employee = db.query(Employee).filter(
                Employee.email == update_data['email'],
                Employee.id != employee_id
            ).first()
            if existing_employee:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo electrónico ya está en uso por otro empleado."
                )
        
        # Copia los datos actualizados al objeto ORM
        for key, value in update_data.items():
            setattr(db_employee, key, value)
            
        try:
            db.add(db_employee)
            db.commit()
            db.refresh(db_employee)
            return db_employee
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Error de integridad: {str(e)}"
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Error al actualizar empleado: {str(e)}"
            )


    def delete_employee(self, db: Session, employee_id: int) -> dict:
        """
        Elimina un empleado de la base de datos.
        """
        db_employee = self.get_employee_by_id(db, employee_id)
        
        try:
            db.delete(db_employee)
            db.commit()
            return {"message": f"Empleado con ID {employee_id} eliminado exitosamente."}
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar empleado: {str(e)}"
            )



    def create_employee_with_user(self, db: Session, employee_data: EmployeeWithUserCreate) -> Employee:
            """
            1. Separa los datos (Usuario vs Empleado).
            2. Crea el usuario en el User Service mediante HTTP.
            3. Si el usuario se crea exitosamente, crea el Empleado en la BD local.
            4. Si algo falla, rollback apropiado.
            """
            # 1. Convertimos a diccionario
            full_data = employee_data.model_dump()
            
            # 2. Extraemos y quitamos los campos que NO son de la tabla Employee
            username = full_data.pop("username")  
            password = full_data.pop("password")
            
            # full_data ahora solo tiene: nombre, apellido, email, sucursal_id, etc.

            # 3. URL del User Service (desde variable de entorno o default)
            user_service_url = os.getenv("USER_SERVICE_URL", "http://localhost:8000")
            
            # 4. Preparar payload para crear usuario
            user_payload = {
                "username": username,
                "password": password,
                "email": full_data.get("email"),  # Usamos el mismo email del empleado
                "role": "employee",  # Por defecto es empleado
                "is_active": True
            }

            # 5. Intentar crear el usuario en el User Service
            try:
                with httpx.Client(timeout=10.0) as client:
                    user_response = client.post(
                        f"{user_service_url}/users/register",
                        json=user_payload
                    )
                    
                    # Si el servicio de usuarios devuelve un error
                    if user_response.status_code != 200:
                        error_detail = user_response.json().get("detail", "Error desconocido")
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Error al crear usuario: {error_detail}"
                        )
                    
                    user_data = user_response.json()
                    print(f"✅ Usuario creado exitosamente: {user_data.get('username')} (ID: {user_data.get('id')})")
                    
            except httpx.ConnectError:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="No se pudo conectar con el servicio de usuarios. Asegúrate de que esté ejecutándose."
                )
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Tiempo de espera agotado al conectar con el servicio de usuarios."
                )
            except HTTPException:
                # Re-lanzar las HTTPException que ya hemos definido
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error inesperado al crear usuario: {str(e)}"
                )

            # 6. Si llegamos aquí, el usuario fue creado exitosamente
            # Ahora creamos el empleado
            db_employee = Employee(**full_data)

            try:
                db.add(db_employee)
                db.commit()
                db.refresh(db_employee)
                
                print(f"✅ Empleado creado exitosamente: {db_employee.nombre} {db_employee.apellido} (ID: {db_employee.id})")
                print(f"🔗 Usuario asociado: {username}")
                
                return db_employee

            except IntegrityError:
                db.rollback()
                # Si falla la creación del empleado, idealmente deberíamos eliminar el usuario creado
                # Esto se puede mejorar en el futuro con una transacción distribuida
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="El correo electrónico ya está registrado como empleado."
                )
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    detail=f"Error al crear empleado: {str(e)}"
                )
