from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.api.deps import get_settings
from app.core.config import Settings

router = APIRouter()

@router.get("/", response_model=Dict[str, Any], status_code=200)
async def health_check(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """
    Health check endpoint.
    Used by load balancers and deployment orchestrators (like Docker/Render) 
    to verify that the application is running and responsive.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "message": "System is operational"
    }
