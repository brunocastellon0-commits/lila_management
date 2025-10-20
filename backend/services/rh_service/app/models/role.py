from sqlalchemy import Column, Integer, String, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base 

class Role(Base): 
    """
    Define el rol de cada empleado 
    """
    __tablename__="roles"
    id = Column(Integer, primary_key=True, index=True)

    rol= Column(String(50),nullable=False, unique=True )
    descripcion=Column(String(100), nullable=False)
    employee = relationship("Employee", back_populates="role")
    