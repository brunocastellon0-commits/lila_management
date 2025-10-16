from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from app.services.user_service import authenticate_user, get_user_by_username
from app.utils.jwt_handler import create_token_for_user, get_token_data


# -----------------------------
# LOGIN (autenticación principal)
# -----------------------------
def login_user(db: Session, credentials: dict) -> dict:
    """
    Autentica un usuario y devuelve un JWT válido.
    Permite login con username o email.
    """
    identifier = credentials.get("username") or credentials.get("email")
    password = credentials.get("password")

    if not identifier or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere username/email y password."
        )

    user = authenticate_user(db, identifier, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = create_token_for_user(
        username=user.username,
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": token_data["access_token"],
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        },
    }


# -----------------------------
# VERIFICAR TOKEN
# -----------------------------
def verify_token(token: str) -> Optional[dict]:
    """
    Verifica la validez de un token JWT y retorna su payload.
    Retorna None si es inválido o expiró.
    """
    try:
        return get_token_data(token)
    except Exception:
        return None


# -----------------------------
# REFRESCAR TOKEN
# -----------------------------
def refresh_token(db: Session, old_token: str) -> dict:
    """
    Genera un nuevo token si el actual sigue siendo válido.
    """
    token_data = verify_token(old_token)

    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
        )

    user = get_user_by_username(db, token_data.get("username"))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo.",
        )

    new_token = create_token_for_user(
        username=user.username,
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": new_token["access_token"],
        "token_type": "bearer",
    }
