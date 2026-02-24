from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from master_flow.model.extracted_data import ExtractedData

class SystemState(ExtractedData):
    id: Optional[str] = None
    chat_history: List[Dict[str, str]] = Field(default_factory=list)
    latest_user_message: str = ""
    asked_for_constraints: bool = False
    
    # Internal usage fields for exclusion checks
    raw_research: Optional[Any] = None
    roadmap: Optional[Any] = None
    critic_feedback: Optional[Any] = None
    is_approved: bool = False
