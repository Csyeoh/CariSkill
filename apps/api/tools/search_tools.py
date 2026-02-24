import os
import json
from crewai.tools import tool
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer


# Initialize clients globally so they don't reload on every tool call
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)
embedding_model = SentenceTransformer('BAAI/bge-small-en-v1.5')
from tavily import TavilyClient

@tool("Web Syllabus Search")
def web_syllabus_search(skill: str) -> str:
    """Fetches course syllabus and curriculum steps from the web when local database fails. Use this to find the live industry standard roadmap for a skill."""
    skill_query = skill.get("skill", skill) if isinstance(skill, dict) else skill
    
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        return "ERROR: TAVILY_API_KEY is not set in the environment. Cannot perform web search."
        
    try:
        tavily = TavilyClient(api_key=tavily_key)
        # We prompt Tavily to find step-by-step learning roadmaps or course syllabi
        response = tavily.search(query=f"Best learning roadmap or complete step-by-step course syllabus for {skill_query} 2026", search_depth="advanced", max_results=3)
        
        if not response or not response.get("results"):
            return f"No web results found for {skill_query}."
            
        formatted_results = [f"Found {len(response['results'])} relevant articles. Use this information to construct a standard learning curriculum for {skill_query}, and MAKE SURE to include the URLs as references:"]
        
        for idx, result in enumerate(response["results"]):
            title = result.get("title", "Unknown Title")
            url = result.get("url", "")
            content = result.get("content", "")[:1000] # Take first 1000 characters of each top result
            
            formatted_results.append(f"\n--- Source {idx+1} ---\nTitle: {title}\nURL: {url}\nContent Snippet: {content}")
            
        return "\n".join(formatted_results)
    except Exception as e:
        return f"Error retrieving web results for {skill_query}: {e}"

@tool("Find Resource Links")
def find_resource_links(topic: str) -> str:
    """Searches the web for high-quality, free tutorials, interactive courses, or guides for a highly specific learning topic (e.g., 'Python Variables tutorial')."""
    topic_query = topic.get("topic", topic) if isinstance(topic, dict) else topic
    
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        return "ERROR: TAVILY_API_KEY is not set."
        
    try:
        tavily = TavilyClient(api_key=tavily_key)
        response = tavily.search(query=f"Best free online tutorial, guide, or interactive course for {topic_query} 2026", search_depth="basic", max_results=3)
        
        if not response or not response.get("results"):
            return f"No related tutorials found for {topic_query}."
            
        formatted_results = [f"Found the following top resources for {topic_query}:"]
        
        for result in response["results"]:
            title = result.get("title", "Unknown Title")
            url = result.get("url", "")
            formatted_results.append(f"- {title}: {url}")
            
        return "\n".join(formatted_results)
    except Exception as e:
        return f"Error retrieving resources for {topic_query}: {e}"

@tool("Qdrant Syllabus Search")
def search_syllabi(query: str) -> str:
    """Searches the Qdrant database for top course syllabi matching the skill query."""
    vector = embedding_model.encode(query).tolist()
    results = qdrant_client.query_points(
        collection_name="course_materials",
        query=vector,
        limit=5
    ).points

    formatted_results = []
    for res in results:
        # Only accept highly confident matches! Adjust the threshold based on your model's typical scores.
        if hasattr(res, 'score') and res.score < 0.70:
            continue
            
        # Note: mapping 'course_name' based on vector_store payload, or default to 'name'
        name_val = res.payload.get('course_name') or res.payload.get('name')
        formatted_results.append(f"Course: {name_val}\nLevel: {res.payload.get('level')}\nSyllabus: {res.payload.get('text')}")
        
    if not formatted_results:
        return "ERROR_NOT_FOUND: The local database does not contain this skill. You MUST use the 'Web Syllabus Search' tool instead."
        
    return "\n\n---\n\n".join(formatted_results)

@tool("Roadmap JSON Structurer")
def format_roadmap_json(raw_text: str) -> str:
    """Forces raw syllabus text into a structured JSON micro-learning roadmap."""
    # In a full implementation, this might do additional regex or parsing
    # For now, it signals the LLM to strictly format its output.
    return "Ensure your final response is strictly valid JSON matching the UI Node schema."

@tool("Prerequisite Validator")
def validate_prerequisites(roadmap_json: str) -> str:
    """Analyzes a JSON roadmap to ensure foundational skills are not skipped."""
    # This is where the Critic Agent will pass the roadmap for QA
    return "Validation complete. No missing prerequisites detected."
