# user_service/schemas/user_schema.py

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional


class UserCreate(BaseModel):
    """Schema para crear un nuevo usuario"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "employee"  # Por defecto 'employee' según tu modelo
    is_active: Optional[bool] = True
    
    @validator('username')
    def username_alphanumeric(cls, v):
        """Valida que el username no esté vacío después de eliminar espacios"""
        if not v.strip():
            raise ValueError('El nombre de usuario no puede estar vacío')
        return v.strip()
    
    @validator('email')
    def email_lowercase(cls, v):
        """Convierte el email a minúsculas"""
        return v.lower()
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "Juan Pérez",
                "email": "juan@example.com",
                "password": "securePassword123",
                "role": "employee"
            }
        }


class UserUpdate(BaseModel):
    """Schema para actualizar un usuario existente"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "Juan Pérez Actualizado",
                "email": "nuevoemail@example.com"
            }
        }


class UserResponse(BaseModel):
    """Schema para la respuesta de usuario (sin password)"""
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True  # Permite crear desde objetos ORM
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "Juan Pérez",
                "email": "juan@example.com",
                "role": "employee",
                "is_active": True
            }
        }


class UserLogin(BaseModel):
    """Schema para login"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    
    @validator('username', 'email')
    def check_username_or_email(cls, v, values):
        """Valida que al menos uno de username o email esté presente"""
        if 'username' in values and not values.get('username') and not v:
            raise ValueError('Debes proporcionar username o email')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "Juan Pérez",
                "password": "securePassword123"
            }
        }


class Token(BaseModel):
    """Schema para respuesta de token"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": 1,
                    "username": "Juan Pérez",
                    "email": "juan@example.com",
                    "role": "employee",
                    "is_active": True
                }
            }
        }