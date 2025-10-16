# user_service/utils/security.py

from passlib.context import CryptContext

# Configuración del algoritmo argon2
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """
    Genera un hash seguro a partir de una contraseña en texto plano.
    Argon2 no tiene límite de 72 caracteres.
    """
    if not password:
        raise ValueError("La contraseña no puede estar vacía")
    
    cleaned_password = str(password).strip()  # elimina espacios invisibles
    return pwd_context.hash(cleaned_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que una contraseña ingresada coincida con el hash almacenado.
    """
    if not plain_password:
        return False
    return pwd_context.verify(str(plain_password).strip(), hashed_password)
