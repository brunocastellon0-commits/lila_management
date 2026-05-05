from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── Base de datos ────────────────────────────────────────
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "lila_servicio"

    # ── URLs de microservicios externos ─────────────────────
    # Usado para validar empleados (mesero/cajero) antes de persistir
    RH_SERVICE_URL: str = "http://localhost:8001"
    # Usado para obtener precio y disponibilidad de productos
    PRODUCTION_SERVICE_URL: str = "http://localhost:8002"

    # ── Entorno ──────────────────────────────────────────────
    DEBUG: bool = True
    ENV: str = "development"

    # ── CORS ─────────────────────────────────────────────────
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
