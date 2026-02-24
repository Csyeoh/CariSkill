from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import re

from agents.crew import generate_roadmap

app = FastAPI(title="AMLS API", description="AI-Powered Autonomous Micro-Learning System backend")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str
    experience: str = "Beginner"
    requirements: str = "None"

@app.get("/")
def read_root():
    return {"message": "Welcome to the AMLS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/roadmap")
def generate_endpoint(request: GenerateRequest):
    # Combine the form fields into a richer prompt for the CrewAI agents
    enriched_skill_prompt = f"Topic: {request.topic}. User Experience Level: {request.experience}. Special Requirements: {request.requirements}"
    
    try:
        # Call the CrewAI orchestration function
        roadmap_result = generate_roadmap(enriched_skill_prompt)
        
        # Try to parse the result as JSON in case the agent returned a JSON string
        try:
            clean_result = roadmap_result.strip()
            
            # Use regex to perfectly extract the JSON block even if Gemini includes conversational text
            match = re.search(r'```(?:json)?\s*(\{.*\}|\[.*\])\s*```', clean_result, re.DOTALL)
            if match:
                clean_result = match.group(1)
            else:
                # Fallback: extract from first { or [ to last } or ]
                match_raw = re.search(r'(\{.*\}|\[.*\])', clean_result, re.DOTALL)
                if match_raw:
                    clean_result = match_raw.group(1)
                
            json_response = json.loads(clean_result)
            return {"status": "success", "roadmap": json_response}
        except json.JSONDecodeError as e:
            print(f"Failed to decode CrewAI JSON payload: {e}")
            print(f"Raw output was: {roadmap_result}")
            # If it's not valid JSON after all regex attempts, return an error state
            # so the frontend doesn't try to save a malformed string to Supabase 'jsonb'
            return {
                "status": "error", 
                "message": "CrewAI agents failed to return a valid JSON format.", 
                "raw": roadmap_result 
            }
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
