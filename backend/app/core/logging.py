import logging
import sys

def setup_logging() -> None:
    """
    Configure structured logging for the FastAPI application.
    Sets up a console handler with a standard formatting block.
    """
    logger = logging.getLogger("app")
    logger.setLevel(logging.INFO)
    
    # Prevent adding multiple handlers if called more than once
    if not logger.handlers:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)

    # Optionally silence noisy 3rd party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
