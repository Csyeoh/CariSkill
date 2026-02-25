from pydantic import BaseModel, Field
from typing import List, Optional

class MacroNode(BaseModel):
    node_id: str = Field(..., description="Unique URL-friendly ID (e.g., 'java_oop').")
    title: str = Field(..., description="Human-readable title of the module.")
    rationale: str = Field(..., description="Why this specific module is necessary for the user's goal.")
    prerequisites: List[str] = Field(..., description="List of node_ids that must be completed first. Empty list [] if foundational.")
    suggested_micro_topics: List[str] = Field(..., description="minimum 3 to maximum 10 specific sub-topics to be researched later (e.g., ['Abstraction', 'Inheritance']).")

class Blueprint(BaseModel):
    nodes: List[MacroNode] = Field(..., description="The complete, ordered skill tree DAG.")

class QAEvaluation(BaseModel):
    is_approved: bool = Field(..., description="True if the blueprint perfectly matches the user profile and has valid logic. False otherwise.")
    feedback: str = Field(..., description="If rejected, exact instructions on what the Architect needs to fix. 'None' if approved.")
    blueprint: Blueprint = Field(..., description="The blueprint being evaluated.")
