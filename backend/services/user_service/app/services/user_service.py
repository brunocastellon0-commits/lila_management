from sqlalchemy.orm import Session
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.security import hash_password, verify_password
from typing import Optional, List
from fastapi import HTTPException, status


# -----------------------------
# CREAR USUARIO
# -----------------------------
def create_user(db: Session, user: UserCreate) -> User:
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario o correo ya están registrados."
        )

    if not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere una contraseña para registrar el usuario."
        )

    hashed_pw = hash_password(user.password)

    db_user = User(
        username=user.username.strip(),
        email=user.email.strip().lower(),
        hashed_password=hashed_pw,
        role=getattr(user, "role", "employee"),
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# -----------------------------
# AUTENTICAR USUARIO (login)
# -----------------------------
def authenticate_user(db: Session, identifier: str, password: str) -> Optional[User]:
    """
    Permite autenticar usando username o email.
    """
    user = (
        db.query(User)
        .filter((User.username == identifier) | (User.email == identifier))
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if not user.is_active:
        return None

    return user


# -----------------------------
# OBTENER USUARIOS
# -----------------------------
def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


def get_active_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return (
        db.query(User)
        .filter(User.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


# -----------------------------
# ACTUALIZAR USUARIO
# -----------------------------
def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    update_data = user_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field == "password" and value:
            setattr(user, "hashed_password", hash_password(value))
        elif field != "hashed_password":
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


# -----------------------------
# ACTIVAR / DESACTIVAR USUARIO
# -----------------------------
def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user_id: int) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


# -----------------------------
# ELIMINAR USUARIO
# -----------------------------
def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


# -----------------------------
# CAMBIAR CONTRASEÑA
# -----------------------------
def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user or not verify_password(old_password, user.hashed_password):
        return False
    user.hashed_password = hash_password(new_password)
    db.commit()
    return True


# -----------------------------
# ESTADÍSTICAS
# -----------------------------
def get_users_by_role(db: Session, role: str, skip: int = 0, limit: int = 100) -> List[User]:
    return (
        db.query(User)
        .filter(User.role == role)
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_users(db: Session) -> int:
    return db.query(User).count()


def count_active_users(db: Session) -> int:
    return db.query(User).filter(User.is_active == True).count()
