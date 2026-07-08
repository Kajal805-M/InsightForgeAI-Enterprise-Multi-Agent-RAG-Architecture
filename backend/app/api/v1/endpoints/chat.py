from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from app.api.deps import get_db
from app.db.models import ChatSession, ChatMessage
from app.services import chat_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/")
def create_session(db: Session = Depends(get_db)):
    """Create a new chat session."""
    session = ChatSession(title="New Chat Session")
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "title": session.title}

@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    """Retrieve all chat sessions."""
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()
    return [{"session_id": s.id, "title": s.title, "created_at": s.created_at} for s in sessions]

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """Delete a chat session and all its messages."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        db.delete(session)
        db.commit()
    return {"status": "success"}

@router.get("/{session_id}/history")
def get_history(session_id: int, db: Session = Depends(get_db)):
    """Retrieve message history for a session to populate the UI."""
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    return [{"id": m.id, "sender": m.sender, "content": m.content, "timestamp": m.timestamp} for m in messages]

@router.post("/{session_id}/stream")
async def stream_chat(session_id: int, request: ChatRequest, db: Session = Depends(get_db)):
    """
    Stream AI responses using Server-Sent Events (SSE).
    """
    # Auto-update title if it's "New Chat Session"
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session and session.title == "New Chat Session":
        session.title = request.query[:30] + ("..." if len(request.query) > 30 else "")
        db.commit()

    return StreamingResponse(
        chat_service.stream_chat(session_id, request.query, db),
        media_type="text/event-stream"
    )
