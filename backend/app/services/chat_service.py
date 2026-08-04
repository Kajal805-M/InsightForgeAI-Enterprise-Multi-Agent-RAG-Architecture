import json
from typing import AsyncGenerator
from sqlalchemy.orm import Session
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.db.models import ChatSession, ChatMessage
import logging
from app.agents.graph import create_multi_agent_graph

logger = logging.getLogger(__name__)

def get_llm():
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. The Chat module will fail without it.")
    return ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        convert_system_message_to_human=True
    )

# Instantiate the graph orchestrator
app_graph = create_multi_agent_graph()

async def stream_chat(session_id: int, query: str, db: Session) -> AsyncGenerator[str, None]:
    """
    Orchestrates the LangGraph Multi-Agent RAG process and streams events via SSE.
    """
    # Save User Message
    user_msg = ChatMessage(session_id=session_id, sender="User", content=query)
    db.add(user_msg)
    db.commit()

    initial_state = {
        "messages": [HumanMessage(content=query)],
        "revision_count": 0
    }

    full_response = ""
    citations = set()
    analyzing_sent = False

    try:
        # Stream the graph execution events
        async for event in app_graph.astream_events(initial_state, version="v1"):
            kind = event["event"]
            name = event.get("name")
            
            # UX: Notify frontend when an agent starts working
            if kind == "on_chain_start" and name in ["Planner", "Retriever", "Analysis", "Report", "Critic"]:
                if not analyzing_sent:
                    yield f"data: {json.dumps({'type': 'status', 'content': 'System is Analyzing...'})}\n\n"
                    analyzing_sent = True
            
            # UX: Emit the final report when the Report node finishes
            elif kind == "on_chain_end" and name == "Report":
                report = event["data"]["output"].get("report", "")
                if report:
                    full_response = report
                    yield f"data: {json.dumps({'type': 'token', 'content': report})}\n\n"

            # Gather Citations when Retriever finishes
            elif kind == "on_chain_end" and name == "Retriever":
                output_data = event["data"].get("output") or {}
                context_docs = output_data.get("context", [])
                for doc in context_docs:
                    metadata = doc.get("metadata") or {}
                    filename = metadata.get("filename")
                    if filename:
                        citations.add(filename)

        # Emit citations to the frontend
        if citations:
            yield f"data: {json.dumps({'type': 'citations', 'content': list(citations)})}\n\n"

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error streaming LangGraph: {str(e)}")
        
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "Quota exceeded" in error_msg:
            friendly_msg = "Google Gemini API rate limit exceeded (Free Tier). Because this uses multiple AI agents, you hit the per-minute limit. Please wait 15 seconds and try again."
        else:
            friendly_msg = "An error occurred in the AI workflow. Please try again."
            
        yield f"data: {json.dumps({'type': 'error', 'content': friendly_msg})}\n\n"
    
    finally:
        yield f"data: {json.dumps({'type': 'end'})}\n\n"
        
        # Save the complete AI response back to SQLite only if it's not empty
        if full_response.strip():
            ai_msg = ChatMessage(session_id=session_id, sender="AI", content=full_response)
            db.add(ai_msg)
            db.commit()
