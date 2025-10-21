# user_service/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.user_service import create_user, get_user_by_email, get_user_by_username
from app.services.auth_service import login_user, refresh_token
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

routes = APIRouter(tags=["Authentication"])


# -----------------------------
# REGISTRO DE USUARIO
# -----------------------------
@routes.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar un nuevo usuario.
    
    - **username**: Nombre de usuario único
    - **email**: Correo electrónico único
    - **password**: Contraseña (será hasheada)
    """
    logger.info(f"Intento de registro para usuario: {user.username}, email: {user.email}")
    
    try:
        # Verificar si el email ya existe
        if get_user_by_email(db, user.email):
            logger.warning(f"Email ya registrado: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado"
            )
        
        # Verificar si el username ya existe
        if get_user_by_username(db, user.username):
            logger.warning(f"Username ya registrado: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )
        
        # Crear el usuario
        new_user = create_user(db, user)
        logger.info(f"Usuario creado exitosamente: {new_user.username} (ID: {new_user.id})")
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al registrar usuario: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )
# Agregar después del endpoint de register normal
@routes.post("/register-employee", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_employee_user(user_data: dict, db: Session = Depends(get_db)):
    """
    Endpoint específico para crear usuario de empleado.
    Se usa desde el gateway cuando se crea un nuevo empleado.
    """
    logger.info(f"Creando usuario para empleado: {user_data.get('email')}")
    
    try:
        # Verificar si el email ya existe
        if get_user_by_email(db, user_data.get("email")):
            logger.warning(f"Email ya registrado: {user_data.get('email')}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado"
            )
        
        # Verificar si el username ya existe
        if get_user_by_username(db, user_data.get("username")):
            # Si el username existe, generar uno alternativo
            base_username = user_data.get("username")
            counter = 1
            new_username = f"{base_username}{counter}"
            
            while get_user_by_username(db, new_username):
                counter += 1
                new_username = f"{base_username}{counter}"
            
            user_data["username"] = new_username
            logger.info(f"Username cambiado a: {new_username}")
        
        # Crear el usuario usando el schema existente
        user_create = UserCreate(
            username=user_data.get("username"),
            email=user_data.get("email"),
            password=user_data.get("password"),
            role=user_data.get("role", "employee"),
            is_active=True
        )
        
        new_user = create_user(db, user_create)
        logger.info(f"Usuario de empleado creado exitosamente: {new_user.username} (ID: {new_user.id})")
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear usuario de empleado: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

# -----------------------------
# LOGIN DE USUARIO
# -----------------------------
@routes.post("/login")
async def login(credentials: dict, db: Session = Depends(get_db)):
    """
    Endpoint para iniciar sesión.
    
    - **username** o **email**: Nombre de usuario o correo
    - **password**: Contraseña
    
    Retorna un token JWT y datos del usuario.
    """
    identifier = credentials.get("username") or credentials.get("email")
    logger.info(f"Intento de login para: {identifier}")
    
    try:
        if not identifier or not credentials.get("password"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Se requiere username/email y password."
            )
        
        result = login_user(db, credentials)  # <-- usar login_user
        logger.info(f"Login exitoso para usuario: {result['user']['username']}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


# -----------------------------
# REFRESCAR TOKEN
# -----------------------------
@routes.post("/refresh")
async def refresh_token_endpoint(token_data: dict, db: Session = Depends(get_db)):
    """
    Endpoint para refrescar un token JWT.
    
    - **token**: Token actual
    """
    try:
        old_token = token_data.get("token")
        if not old_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token no proporcionado"
            )
        
        new_token = refresh_token(db, old_token)
        return new_token

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al refrescar token: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )
