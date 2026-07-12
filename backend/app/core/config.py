from typing import Annotated, Any
from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

def parse_cors(v: Any) -> list[str] | str:
    """Parse a comma-separated string or a JSON array string into a list."""
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list) or isinstance(v, str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    """
    Global application settings, parsed from the environment or .env file.
    """
    PROJECT_NAME: str = "Enterprise RAG Platform"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: Annotated[
        list[str] | str, BeforeValidator(parse_cors)
    ] = []
    
    # RAG Configuration
    CHROMA_DB_DIR: str = "./chroma_data"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    GEMINI_API_KEY: str = ""
    
    model_config = SettingsConfigDict(
        case_sensitive=True, env_file=".env", env_file_encoding="utf-8"
    )

settings = Settings()
