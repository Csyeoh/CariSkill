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

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if req.session_id:
        # Resume existing session — pass the previous state ID
        flow = MasterFlow(state=SystemState(id=req.session_id), tracing=True)
    else:
        # New session
        flow = MasterFlow(tracing=True)
    
    flow.state.latest_user_message = req.message
    
    # Run the flow based on the current state
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
