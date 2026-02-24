import logging
logging.basicConfig(level=logging.INFO)
from tools.search_tools import web_syllabus_search, search_syllabi

if __name__ == "__main__":
    print("Testing Web Search for 'cooking'...")
    try:
        res1 = web_syllabus_search.run({"skill": "cooking"})
        print("WEB RESULTS:\n", res1)
    except Exception as e:
        print("WEB ERROR:", e)

    print("\n------------------------------\n")
    print("Testing Qdrant Search for 'cooking'...")
    try:
        res2 = search_syllabi.run({"query": "cooking"})
        print("QDRANT RESULTS:\n", res2)
    except Exception as e:
        print("QDRANT ERROR:", e)
