import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any
from app.api.deps import get_db
from app.db.models import Document, ChatSession
from app.db.vector_store import get_vector_store

router = APIRouter()

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Returns aggregated system metrics for the dashboard."""
    start_time = time.time()
    
    # 1. Uploaded Documents
    total_docs = db.query(Document).count()
    recent_docs = db.query(Document).order_by(desc(Document.created_at)).limit(5).all()
    
    # 2. Recent Conversations
    recent_chats = db.query(ChatSession).order_by(desc(ChatSession.created_at)).limit(5).all()
    
    # 3. Embedding Count
    try:
        store = get_vector_store()
        embedding_count = store._collection.count()
    except Exception:
        embedding_count = 0
        
    # 4. Token Usage (Estimated based on db state for demonstration)
    total_chats = db.query(ChatSession).count()
    estimated_tokens = (total_chats * 1450) + (embedding_count * 250)

    # 5. Latency calculation
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    return {
        "status": "operational",
        "latency_ms": latency_ms,
        "total_documents": total_docs,
        "total_embeddings": embedding_count,
        "estimated_tokens_used": estimated_tokens,
        "recent_documents": [{"id": d.id, "filename": d.filename, "status": d.status, "created_at": d.created_at} for d in recent_docs],
        "recent_chats": [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in recent_chats]
    }
