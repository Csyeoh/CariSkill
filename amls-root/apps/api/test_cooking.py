import sys
import logging
logging.basicConfig(level=logging.INFO)
from agents.crew import generate_roadmap

if __name__ == "__main__":
    print("Starting generation for 'cooking'...")
    result = generate_roadmap("cooking")
    print("FINAL RESULT:")
    print(result)
