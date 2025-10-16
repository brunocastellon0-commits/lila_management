# user_service/app/config.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings  # <- CORRECCIÓN para Pydantic 2.x

# Cargar variables desde .env
load_dotenv()

class Settings(BaseSettings):
    #  JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    #  Base de datos
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "root")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "lila_users")

    #  Entorno
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENV: str = os.getenv("ENV", "development")

    #  Propiedad generada dinámicamente
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# Instancia global de configuración
settings = Settings()

#  Crear motor de base de datos
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True
)

#  Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
