from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_type = Column(String)
    file_size_bytes = Column(Integer)
    file_hash = Column(String, unique=True, index=True)
    status = Column(String, default="Uploaded")
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    sender = Column(String) # "User" or "AI"
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
