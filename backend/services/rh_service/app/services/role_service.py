from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List
from app.models.role import Role
from app.schemas.schema_role import RoleCreate,RoleResponse,RoleUpdate

class RoleService:
    """
    logica de negocio para roles 
    """
    
    def get_role_by_id(self, db:Session, role_id : int)->Role:
        
        """Busca los roles por id"""
        role=db.query(Role).filter(Role.id==role_id).first()
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Id de rol no es valido {role_id}")
        return role 
    def get_all_roles(self,db:Session, skip: int =0, limit:int=100)->List[Role]:
        """
        obtiene lista de todos los roles
        """
        return db.query(Role).offset(skip).limit(limit).all()
    def create_role(self,db:Session,role:RoleCreate)->Role:
        """creamos roles para ser asignados a los empleados"""
        db_role=Role(
            rol=role.rol,
            descripcion=role.descripcion,
            
        )
        try:
            db.add(db_role)
            db.commit()
            db.refresh(db_role)
            return db_role
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Error al crear rol")
    def update_role(self,db:Session,role_id:int, role_update:RoleUpdate)->Role:
        """edicion de roles"""
        db_role=self.get_role_by_id(db,role_id)
        
        update_data= role_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_role,key,value)
            
        try:
            db.add(db_role)
            db.commit()
            db.refresh(db_role)
            return db_role
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Error desconocido al actualizar rol.")
            
    def delete_role(self, db:Session , role_id:int)->dict:
        """elimina un rol de la bd"""
        db_role=self.get_role_by_id(db,role_id)
        db.delete(db_role)
        db.commit()
        return{"message": f"El rol con id {role_id} fue eliminado exitosamente" }