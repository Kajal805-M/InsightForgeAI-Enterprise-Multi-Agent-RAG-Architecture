import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api.deps import get_db
from app.db.models import Document
from app.services import report_service

router = APIRouter()

@router.post("/generate/{document_id}")
def generate_report(document_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Generates a full Markdown and PDF report for the given document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.file_type not in ["CSV", "XLSX"]:
        raise HTTPException(status_code=400, detail="Reports can currently only be generated for tabular datasets (CSV, XLSX).")

    result = report_service.generate_business_report(doc)
    return result

@router.get("/download/{report_id}")
def download_report(report_id: str, format: str = "pdf"):
    """Downloads the generated report in the specified format."""
    if format not in ["pdf", "md"]:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'md'.")
        
    file_path = os.path.join(report_service.REPORT_DIR, f"{report_id}.{format}")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found. It may have expired or failed to generate.")
        
    media_type = "application/pdf" if format == "pdf" else "text/markdown"
    return FileResponse(path=file_path, filename=f"business_report_{report_id[:8]}.{format}", media_type=media_type)
