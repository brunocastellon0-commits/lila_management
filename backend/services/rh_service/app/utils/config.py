# rh_service/app/utils/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── Base de datos ────────────────────────────────────────
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "lila_rh"

    # ── JWT ──────────────────────────────────────────────────
    JWT_SECRET: str = "supersecrethr"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Entorno ──────────────────────────────────────────────
    DEBUG: bool = True
    ENV: str = "development"

    # ── CORS ─────────────────────────────────────────────────
    # En el .env: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:7000
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:7000",
    ]

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