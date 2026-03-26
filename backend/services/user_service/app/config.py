# user_service/app/config.py
# ─────────────────────────────────────────────────────────────
# Solo responsabilidad: leer y exponer la configuración.
# Nada de engine, nada de SessionLocal — eso va en db.py
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
    DB_NAME: str = "lila_users"

    # ── Entorno ──────────────────────────────────────────────
    DEBUG: bool = True
    ENV: str = "development"

    # ── CORS ─────────────────────────────────────────────────
    # En el .env: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

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