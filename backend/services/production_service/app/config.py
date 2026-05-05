# app/config.py
# ─────────────────────────────────────────────────────────────
# pydantic-settings lee automáticamente el .env y las variables
# de entorno del sistema. No necesitas os.getenv() en ningún campo.
#
# Orden de prioridad (de mayor a menor):
#   1. Variable de entorno del sistema  (ej: export DB_HOST=mi-servidor)
#   2. Valor en el archivo .env
#   3. El default definido en el campo  (ej: "localhost")
# ─────────────────────────────────────────────────────────────

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── JWT ──────────────────────────────────────────────────
    JWT_SECRET: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Base de datos ────────────────────────────────────────
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_HOST: str = "localhost"      
    DB_PORT: str = "3306"
    DB_NAME: str = "lila_produccion"      

    # ── Entorno ──────────────────────────────────────────────
    DEBUG: bool = True
    ENV: str = "development"

    # ── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # ── Configuración del .env ───────────────────────────────
    # env_file: qué archivo leer
    # env_file_encoding: evita problemas con caracteres especiales en contraseñas
    # extra="ignore": si el .env tiene variables que no están en Settings, las ignora
    #                 sin lanzar un error (útil cuando varios servicios comparten .env)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()