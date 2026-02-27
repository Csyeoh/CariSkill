import os
from dotenv import load_dotenv
from master_flow.main import MasterFlow

load_dotenv()

def test_flow():
    flow = MasterFlow()
    # Mocking the state for testing
    flow.state.topic = "Python basics"
    flow.state.experience = "beginner"
    flow.state.goal = "Learn enough to automate tasks"
    flow.state.constraints = "only 1 hour a day"
    
    print("Testing execute_macro_planning...")
    flow.execute_macro_planning()
    print("Blueprint nodes:", flow.state.blueprint.get("nodes", []))

if __name__ == "__main__":
    test_flow()
