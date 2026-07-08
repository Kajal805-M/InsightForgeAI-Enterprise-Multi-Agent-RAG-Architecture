from fastapi import Depends
from app.core.config import Settings, settings
from app.db.database import get_db

def get_settings() -> Settings:
    """
    Dependency to inject the global application settings.
    Useful for overriding settings during testing.
    """
    return settings
