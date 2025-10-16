


# ==========================================
# gateway/app/config.py
# ==========================================
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Puerto del gateway
    gateway_port: int = 7000
    
    # URLs de microservicios
    user_service_url: str = "http://localhost:8000"
    rh_service_url: str = "http://localhost:8001"
    
    # CORS
    allowed_origins: str = "http://localhost:5173"
    
    # Entorno
    env: str = "development"
    debug: bool = True
    
    # Timeouts
    request_timeout: int = 10
    connect_timeout: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def origins_list(self) -> List[str]:
        """Convierte el string de orígenes en una lista"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Instancia global de settings
settings = Settings()