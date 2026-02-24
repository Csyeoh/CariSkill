import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Ensure tools are in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.crew import generate_roadmap

if __name__ == "__main__":
    print("Starting generation...")
    try:
        raw_result = generate_roadmap("React. Experience Level: Beginner. Requirements: None")
        print("--- RAW RESULT TRIPLE QUOTE ---")
        print(f"'''\n{raw_result}\n'''")
        print("--- END RAW RESULT ---")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
