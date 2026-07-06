from typing import Annotated, Sequence, TypedDict, List, Dict, Any
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    """
    The shared state dictionary that flows between all agents in the LangGraph.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    plan: str
    context: List[Dict[str, Any]]
    analysis: str
    report: str
    feedback: str
    revision_count: int
