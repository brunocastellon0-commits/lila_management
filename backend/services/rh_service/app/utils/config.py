# rh_service/app/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class Settings(BaseSettings):
    """
    Configuración de la aplicación RH, cargando variables automáticamente
    desde el archivo .env gracias a Pydantic.
    """
    # ----------------------------------------------------
    # Configuración de la Base de Datos (MySQL)
    # ----------------------------------------------------
    DB_USER: str = "root"      # Valor por defecto si no está en .env
    DB_PASSWORD: str = "root"  # Valor por defecto si no está en .env
    DB_HOST: str = "localhost" # Recuerda cambiar a 'db' si usas Docker Compose
    DB_PORT: int = 3306        # Pydantic maneja la conversión a entero
    DB_NAME: str = "lila_rh"   # Asegúrate que el nombre de DB sea para RH

    # ----------------------------------------------------
    # Configuración de la Seguridad (JWT)
    # ----------------------------------------------------
    JWT_SECRET: str = "supersecrethr"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # ----------------------------------------------------
    # Configuración General
    # ----------------------------------------------------
    DEBUG: bool = True
    ENV: str = "development"

    # ----------------------------------------------------
    # Configuración de Pydantic v2 (Clave)
    # ----------------------------------------------------
    # Indica a Pydantic que cargue las variables del archivo .env
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    
    # Propiedad calculada: Cadena de conexión para SQLAlchemy
    @property
    def DATABASE_URL(self) -> str:
        """Genera la cadena de conexión usando PyMySQL como driver."""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

# Instancia global de configuración. Pydantic carga el .env aquí.
settings = Settings()

# ----------------------------------------------------
# Inicialización de la Base de Datos
# ----------------------------------------------------

# Crear motor de base de datos
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Muestra las consultas SQL si DEBUG es True
    pool_pre_ping=True
)

# Crear sesión (que se usará en las dependencias de FastAPI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)