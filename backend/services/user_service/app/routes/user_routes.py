# user_service/routes/user_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, UserResponse
from app.db import get_db
from app.services.user_service import (
    create_user, 
    get_all_users, 
    get_user_by_username,
    get_user_by_email  # Asegúrate de tener esta función
)


routes = APIRouter(tags=["Usuarios"])





# Crear usuario
@routes.post("/", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    return create_user(db, user)


# Registrar usuario
@routes.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario validando que no existan duplicados
    por username o email
    """
    # Verificar username duplicado
    existing_username = get_user_by_username(db, user.username)
    if existing_username:
        raise HTTPException(
            status_code=400, 
            detail="El nombre de usuario ya está en uso"
        )

    # Verificar email duplicado (usando la función correcta)
    existing_email = get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(
            status_code=400, 
            detail="El correo ya está registrado"
        )

    # Crear usuario
    new_user = create_user(db, user)
    return new_user


# Listar todos los usuarios
@routes.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """Obtiene todos los usuarios registrados"""
    return get_all_users(db)


# Obtener usuario por username
@routes.get("/{username}", response_model=UserResponse)
def get_user(username: str, db: Session = Depends(get_db)):
    """Obtiene un usuario específico por su username"""
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="Usuario no encontrado"
        )
    return user