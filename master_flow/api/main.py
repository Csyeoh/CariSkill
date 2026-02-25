import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from fastapi import FastAPI
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

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

from fastapi import FastAPI, HTTPException

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.session_id:
        raise HTTPException(status_code=400, detail="session_id is required to initiate or continue a flow.")
        
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
    
    # Explicitly enforce the ID so that future persists overwrite this same session
    flow.state.id = req.session_id
    
    # Update the user's latest incoming message
    flow.state.latest_user_message = req.message
    
    print(f"Running flow for session {flow.state.id} with message: {req.message}")
    result = await flow.kickoff_async() 
    
    # Extract response from flow result if it's chatting
    response_data = result if isinstance(result, dict) else {"status": "completed", "result": result}
    
    # Return the state ID so the client can pass it back next time
    return {
        "response": response_data,
        "state": flow.state.model_dump(),
        "session_id": flow.state.id
    }
