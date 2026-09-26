"""Core configuration for PDF OCR Converter API."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = ["*"]
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_MIME_TYPES: list[str] = ["application/pdf"]
    UPLOAD_DIR: str = "/tmp/pdf-ocr-uploads"
    
    # OCR Settings
    TESSDATA_PREFIX: str = "/usr/share/tessdata"
    DEFAULT_LANGUAGES: list[str] = ["spa", "eng"]
    SUPPORTED_LANGUAGES: list[str] = [
        "spa", "eng", "fra", "deu", "ita", "por", 
        "rus", "chi_sim", "jpn", "kor", "ara", "hin"
    ]
    
    # Processing
    DEFAULT_QUALITY: str = "balanced"  # fast, balanced, best
    PRESERVE_LAYOUT: bool = True
    
    # Storage (for cloud deployment)
    STORAGE_BACKEND: str = "local"  # local, s3, r2
    STORAGE_BUCKET: str = ""
    STORAGE_REGION: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    SIGNED_URL_EXPIRY: int = 24 * 60 * 60  # 24 hours
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()