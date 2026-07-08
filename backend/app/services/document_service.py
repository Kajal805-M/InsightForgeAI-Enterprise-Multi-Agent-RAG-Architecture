import os
import hashlib
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.db.models import Document
from app.db.database import SessionLocal
from app.core.exceptions import AppException
from app.services import rag_service
from typing import List

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".csv", ".xlsx"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()

async def save_document(db: Session, file: UploadFile) -> Document:
    ext = _get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(message=f"Unsupported file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read content to compute hash for duplicate detection
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Check for duplicate
    existing_doc = db.query(Document).filter(Document.file_hash == file_hash).first()
    if existing_doc:
        raise AppException(message="This document has already been uploaded.", status_code=409)

    file_size = len(content)
    file_path = os.path.join(UPLOAD_DIR, f"{file_hash}{ext}")

    # Save to disk
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Save to database
    db_doc = Document(
        filename=file.filename,
        file_type=ext[1:].upper(), # Remove dot, e.g., PDF
        file_size_bytes=file_size,
        file_hash=file_hash,
        file_path=file_path
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return db_doc

def get_all_documents(db: Session) -> List[Document]:
    return db.query(Document).order_by(Document.created_at.desc()).all()

def process_document_background(document_id: int, file_path: str, file_type: str, filename: str) -> None:
    """
    Background task to run RAG ingestion and update document status.
    """
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "Processing"
            db.commit()

        # Run RAG pipeline
        rag_service.ingest_document(file_path, file_type, document_id, filename)

        if doc:
            doc.status = "Ready"
            db.commit()
    except Exception as e:
        if doc:
            doc.status = "Failed"
            db.commit()
    finally:
        db.close()
