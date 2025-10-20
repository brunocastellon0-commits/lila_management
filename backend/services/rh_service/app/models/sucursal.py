from sqlalchemy import Column, Integer, Numeric, ForeignKey, Date,String
from sqlalchemy.orm import relationship
from app.database import Base 

class Sucursal(Base):
    #Tabla de sucursales
    __tablename__="sucursal"
    id=Column(Integer, primary_key=True, index=True)
    nombre_sucursal= Column(String(50), nullable=False)
    fecha_inauguracion= Column(Date , nullable=False)
    ubicacion=Column(String(200), nullable=False)
    telefono= Column(Integer, nullable= True)
    employee= relationship("Employee", back_populates="sucursal")
    