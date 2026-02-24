from pydantic import BaseModel, Field
from typing import Optional

class ExtractedData(BaseModel):
    topic: Optional[str] = Field(None, description="The specific skills, language, or topic the user wants to learn.")
    experience: Optional[str] = Field(None, description="Current knowledge level (e.g., beginner, intermediate, knows coding).")
    goal: Optional[str] = Field(None, description="The end goal or project they want to achieve, whether complete a certification or complete portfolio.")
    constraints: Optional[str] = Field(None, description="Any time limits, learning preferences, or worries the user mentions.")