from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from agents.crew import generate_roadmap

app = FastAPI(title="AMLS API", description="AI-Powered Autonomous Micro-Learning System backend")

# Configure CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    goal: str  # Note: The UI wireframe sends {"goal": skillGoal}

@app.get("/")
def read_root():
    return {"message": "Welcome to the AMLS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/generate")
def generate_endpoint(request: GenerateRequest):
    skill = request.goal
    
    try:
        # Call the CrewAI orchestration function
        roadmap_result = generate_roadmap(skill)
        
        # Try to parse the result as JSON in case the agent returned a JSON string
        try:
            # Simple cleanup in case the agent wrapped it in markdown code blocks
            clean_result = roadmap_result.strip()
            if clean_result.startswith("```json"):
                clean_result = clean_result[7:]
            if clean_result.endswith("```"):
                clean_result = clean_result[:-3]
                
            json_response = json.loads(clean_result)
            return {"status": "success", "data": json_response}
        except json.JSONDecodeError:
            # If it's not valid JSON, return the raw text
            return {"status": "success", "data": roadmap_result}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
