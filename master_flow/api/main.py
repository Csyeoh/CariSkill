import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
# Load the environment variables from the .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from master_flow.main import MasterFlow

from typing import Optional
from master_flow.model.system_state import SystemState

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class StartMacroRequest(BaseModel):
    session_id: str
    topic: str
    experience: str
    goal: str
    constraints: str

@app.post("/api/start_macro")
async def start_macro_endpoint(req: StartMacroRequest):
    if not req.session_id:
        raise HTTPException(status_code=400, detail="session_id is required.")
        
    flow = MasterFlow()
    
    # Instantiate persistence layer to check if a session already exists
    from crewai.flow.persistence import SQLiteFlowPersistence
    persistence = SQLiteFlowPersistence()
    previous_state = persistence.load_state(req.session_id)
    
    # If a previous state exists, completely hydrate our newly instantiated flow
    if previous_state:
        print(f"Resuming existing flow. Hydrating {req.session_id}...")
        for key, value in previous_state.items():
            if hasattr(flow.state, key):
                setattr(flow.state, key, value)
    
    # Initialize the state explicitly with the requested macro fields
    flow.state.id = req.session_id
    flow.state.topic = req.topic
    flow.state.experience = req.experience
    flow.state.goal = req.goal
    flow.state.constraints = req.constraints
    
    print(f"Starting macro flow for session {flow.state.id} with topic: {req.topic}")
    result = await flow.kickoff_async() 
    
    response_data = result if isinstance(result, dict) else {"status": "completed", "result": result}
    
    return {
        "response": response_data,
        "state": flow.state.model_dump(),
        "session_id": flow.state.id
    }
