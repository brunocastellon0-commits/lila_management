# user_service/models/user.py

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

# Base de SQLAlchemy
Base = declarative_base()

class User(Base):
    """
    Modelo de usuario para Lila Management.
    Representa la tabla 'users' en la base de datos.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="employee")  # futuro: admin, gerente, etc.

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email}, role={self.role})>"
