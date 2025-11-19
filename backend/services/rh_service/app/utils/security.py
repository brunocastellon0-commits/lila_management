# rh_service/app/utils/security.py

from passlib.context import CryptContext

# 1. Configurar el contexto de hashing
# Usamos bcrypt, que es el estándar de la industria
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para una contraseña.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña plana contra un hash existente.
    (La usarás para el login)
    """
    return pwd_context.verify(plain_password, hashed_password)