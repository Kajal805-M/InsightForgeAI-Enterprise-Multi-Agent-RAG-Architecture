from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api.deps import get_db
from app.db.models import Document
from app.services import analytics_service

router = APIRouter()

@router.get("/datasets")
def get_analytics_datasets(db: Session = Depends(get_db)):
    """Returns a list of documents that are supported for tabular analytics (CSV, XLSX)."""
    datasets = db.query(Document).filter(
        Document.file_type.in_(["CSV", "XLSX"]),
        Document.status == "Ready"
    ).order_by(Document.created_at.desc()).all()
    
    return [{"id": d.id, "filename": d.filename, "file_type": d.file_type} for d in datasets]

@router.get("/{document_id}")
def run_analytics(document_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Runs Pandas analytics and Gemini insights on the specified document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.file_type not in ["CSV", "XLSX"]:
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported for tabular analytics.")

    results = analytics_service.analyze_dataset(doc.file_path, doc.file_type)
    return results
