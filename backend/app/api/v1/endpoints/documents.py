from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.api.deps import get_db
from app.domain.document import DocumentResponse
from app.services import document_service
from app.services import rag_service

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Upload a document. Validates type, checks for duplicates via SHA-256, stores in SQLite,
    and triggers RAG ingestion in the background.
    """
    document = await document_service.save_document(db, file)
    
    # Trigger background RAG processing
    background_tasks.add_task(
        document_service.process_document_background,
        document_id=document.id,
        file_path=document.file_path,
        file_type=document.file_type,
        filename=document.filename
    )
    
    return document

@router.get("/", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    """
    List all uploaded documents.
    """
    return document_service.get_all_documents(db)

@router.get("/search")
def search_documents(
    query: str = Query(..., description="The search query"),
    limit: int = Query(5, description="Number of results to return"),
    document_id: Optional[int] = Query(None, description="Filter by a specific document ID")
) -> List[Dict[str, Any]]:
    """
    Semantic Search via ChromaDB.
    Returns the most relevant text chunks along with metadata citations.
    """
    filters = None
    if document_id is not None:
        filters = {"document_id": document_id}
        
    results = rag_service.search_context(query=query, limit=limit, filters=filters)
    return results
