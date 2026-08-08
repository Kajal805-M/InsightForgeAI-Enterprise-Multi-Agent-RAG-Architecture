import logging
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import AppException, app_exception_handler
from app.api.v1.router import api_router
from app.db.database import engine, Base

# Initialize structured logging globally
setup_logging()
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """
    Application factory to instantiate and configure the FastAPI app.
    Sets up CORS middleware, exception handlers, and API routing.
    """
    app_instance = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="Backend Foundation for Enterprise Multi-Agent RAG Platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Configure CORS Middleware for frontend access (Allow all origins for easy deployment)
    app_instance.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register global exception handlers
    app_instance.add_exception_handler(AppException, app_exception_handler)

    # Include core API routes under the versioned prefix
    app_instance.include_router(api_router, prefix=settings.API_V1_STR)

    # Mount frontend static assets for Single Port Architecture
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
    
    if os.path.exists(frontend_dist):
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.exists(assets_dir):
            app_instance.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
            
        @app_instance.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            if full_path.startswith("api/"):
                return {"detail": "Not Found"}
            index_file = os.path.join(frontend_dist, "index.html")
            if os.path.exists(index_file):
                return FileResponse(index_file)
            return {"detail": "Frontend build not found"}

    return app_instance

# Create the global FastAPI application instance
app = create_app()

@app.on_event("startup")
async def startup_event() -> None:
    """
    Startup event hook. 
    Useful for initializing database connections or model loading in the future.
    """
    logger.info(f"Starting up {settings.PROJECT_NAME} backend...")
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
