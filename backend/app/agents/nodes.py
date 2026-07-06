import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from app.services import chat_service
from app.services import rag_service
from .state import AgentState

logger = logging.getLogger(__name__)

def get_llm():
    return chat_service.get_llm()

def extract_text(content: Any) -> str:
    if isinstance(content, list):
        # Extract text from a list of parts (e.g., [{'type': 'text', 'text': '...'}])
        return " ".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    return str(content)

async def planner_node(state: AgentState) -> Dict[str, Any]:
    logger.info("--- PLANNER AGENT ---")
    llm = get_llm()
    user_query = state["messages"][-1].content
    
    prompt = f"""You are the Planner Agent. Your job is to create a step-by-step plan to answer the user's query using retrieved business intelligence documents.
User Query: {user_query}
Output a concise plan outlining what needs to be retrieved and analyzed."""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return {"plan": extract_text(response.content)}

async def retriever_node(state: AgentState) -> Dict[str, Any]:
    logger.info("--- RETRIEVER AGENT ---")
    llm = get_llm()
    plan = state.get("plan", "")
    user_query = state["messages"][-1].content
    
    prompt = f"""You are the Retriever Agent. Based on the user query and the plan, output a single highly optimized search query string to search the vector database.
User Query: {user_query}
Plan: {plan}
Output ONLY the search query string."""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    search_query = extract_text(response.content).strip()
    
    # Tool execution
    retrieved_docs = rag_service.search_context(query=search_query, limit=5)
    return {"context": retrieved_docs}

async def analysis_node(state: AgentState) -> Dict[str, Any]:
    logger.info("--- ANALYSIS AGENT ---")
    llm = get_llm()
    user_query = state["messages"][-1].content
    plan = state.get("plan", "")
    context = state.get("context", [])
    feedback = state.get("feedback", "")
    
    context_str = "\\n\\n".join([f"Source: {(c.get('metadata') or {}).get('filename', 'Unknown')}\\nContent: {c.get('content', '')}" for c in context])
    
    prompt = f"""You are the Analysis Agent. 
Analyze the provided context to answer the user's query following the planner's plan.
User Query: {user_query}
Plan: {plan}
Feedback from previous attempts (if any): {feedback}

Context:
{context_str}

Provide a detailed analysis. Do not worry about final formatting yet."""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return {"analysis": extract_text(response.content)}

async def report_node(state: AgentState) -> Dict[str, Any]:
    logger.info("--- REPORT AGENT ---")
    llm = get_llm()
    user_query = state["messages"][-1].content
    analysis = state.get("analysis", "")
    
    prompt = f"""You are the Report Agent. 
Take the following analysis and format it into a clear, professional markdown report to answer the user's query.
Include citations (source filenames) if provided in the analysis.

User Query: {user_query}
Analysis: {analysis}

Output the final markdown report."""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return {"report": extract_text(response.content)}

async def critic_node(state: AgentState) -> Dict[str, Any]:
    logger.info("--- CRITIC AGENT ---")
    llm = get_llm()
    user_query = state["messages"][-1].content
    report = state.get("report", "")
    
    prompt = f"""You are the Critic Agent.
Review the following report against the user query. 
Does the report accurately and fully answer the query based on typical Business Intelligence standards? 
If it passes, respond with EXACTLY: "PASS".
If it fails, provide detailed feedback on what needs to be fixed.

User Query: {user_query}
Report: {report}"""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    feedback = extract_text(response.content).strip()
    
    current_revisions = state.get("revision_count", 0)
    
    # Retry mechanism limits to prevent infinite loops
    if "PASS" in feedback.upper() or current_revisions >= 2: 
        return {"feedback": "PASS", "revision_count": current_revisions}
    else:
        return {"feedback": feedback, "revision_count": current_revisions + 1}
