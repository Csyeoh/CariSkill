from pydantic import BaseModel, Field
from typing import Optional

class ExtractedData(BaseModel):
    topic: Optional[str] = Field(None, description="The specific skills, language, or topic the user wants to learn.")
    time_commitment: Optional[str] = Field(None, description="How much time in a week the user can dedicate.")
    preference: Optional[str] = Field(None, description="User's preferred learning format (e.g., videos, official documentation, interactive coding).")
    experience: Optional[str] = Field(None, description="Current knowledge level (e.g., beginner, intermediate, knows coding).")
    goal: Optional[str] = Field(None, description="The end goal or project they want to achieve, whether complete a certification or complete portfolio.")