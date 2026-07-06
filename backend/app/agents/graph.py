from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import planner_node, retriever_node, analysis_node, report_node, critic_node

def should_continue(state: AgentState):
    """
    Conditional edge: determines if the Critic passed the report.
    If not, it loops back to the Analysis agent for self-correction.
    """
    feedback = state.get("feedback", "")
    if "PASS" in feedback:
        return "end"
    return "continue"

def create_multi_agent_graph():
    """
    Constructs the LangGraph Multi-Agent system for RAG orchestration.
    """
    workflow = StateGraph(AgentState)

    # 1. Add Agent Nodes
    workflow.add_node("Planner", planner_node)
    workflow.add_node("Retriever", retriever_node)
    workflow.add_node("Analysis", analysis_node)
    workflow.add_node("Report", report_node)
    workflow.add_node("Critic", critic_node)

    # 2. Set Entry Point
    workflow.set_entry_point("Planner")

    # 3. Define standard execution edges
    workflow.add_edge("Planner", "Retriever")
    workflow.add_edge("Retriever", "Analysis")
    workflow.add_edge("Analysis", "Report")
    workflow.add_edge("Report", "Critic")

    # 4. Define Reflection / Self-correction conditional edges
    workflow.add_conditional_edges(
        "Critic",
        should_continue,
        {
            "continue": "Analysis", # Self-correct loop
            "end": END              # Finalize
        }
    )

    # Compile the graph into an executable application
    app = workflow.compile()
    return app
