from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional

class AppException(Exception):
    """
    Base class for all application-specific exceptions.
    Use this to trigger standardized error responses.
    """
    def __init__(
        self, 
        message: str, 
        status_code: int = status.HTTP_400_BAD_REQUEST, 
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Global exception handler for AppException.
    Intercepts these exceptions and formats a consistent JSON payload.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
            "path": request.url.path
        },
    )

class NotFoundException(AppException):
    """Exception for resource not found (HTTP 404)."""
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_404_NOT_FOUND, 
            details=details
        )

class UnauthorizedException(AppException):
    """Exception for unauthorized access (HTTP 401)."""
    def __init__(self, message: str = "Not authenticated", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_401_UNAUTHORIZED, 
            details=details
        )
