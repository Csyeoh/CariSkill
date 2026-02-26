from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class SystemState(BaseModel):
    id: Optional[str] = None
    
    # Internal usage fields for exclusion checks
    raw_research: Optional[Any] = None
    roadmap: Optional[Any] = None
    critic_feedback: Optional[Any] = None
    is_approved: bool = False

    # User payload fields
    topic: str = ""
    experience: str = ""
    goal: str = ""
    constraints: str = ""

    # --- NEW MACRO PLANNING FIELDS ---
    blueprint: Optional[Dict] = None
    macro_critic_feedback: str = "None"
    macro_retry_count: int = 0
