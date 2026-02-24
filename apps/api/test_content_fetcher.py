import logging
logging.basicConfig(level=logging.INFO)
from agents.crew import generate_roadmap

if __name__ == "__main__":
    print("Testing 4-Agent Pipeline for 'Cooking'...")
    try:
        # Use a topic we know falls back to Tavily for web search
        result = generate_roadmap("Cooking Fundamentals")
        print("\n\n==== FINAL ROADMAP ====\n")
        print(result)
    except Exception as e:
        print(f"Error test: {e}")
