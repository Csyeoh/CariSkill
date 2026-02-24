import sys
import os

# Append current dir to sys.path so we can import agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.crew import generate_roadmap

if __name__ == "__main__":
    print("Testing generate_roadmap() directly...")
    try:
        result = generate_roadmap("Topic: React. User Experience Level: Beginner. Special Requirements: None")
        print("SUCCESS:", result)
    except Exception as e:
        import traceback
        print("EXCEPTION CAUGHT:")
        traceback.print_exc()
