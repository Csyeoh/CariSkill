import json
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# Initialize Qdrant client with an extended timeout
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60.0
)

COLLECTION_NAME = "course_materials"

# Initialize Sentence Transformer model
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

def init_collection():
    if not client.collection_exists(collection_name=COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=model.get_sentence_embedding_dimension(), 
                distance=Distance.COSINE
            ),
        )

def process_and_upsert_data(filepath: str):
    init_collection()
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    points = []
    
    # Handle variations in JSON structure
    if isinstance(data, dict):
        if "courses" in data:
            data = data["courses"]
        elif "data" in data:
            data = data["data"]
        else:
            data = list(data.values())

    print(f"Starting to embed and upsert {len(data)} courses...")

    for idx, item in enumerate(data):
        course_name = item.get("course_name", "")
        provider = item.get("provider", "")
        level = item.get("level", "")
        skills = item.get("skills", [])
        syllabus = item.get("description", "") # Note: updated from "syllabus" based on your dataset format
        
        skills_str = ", ".join(skills) if isinstance(skills, list) else str(skills)
        text_for_embedding = f"Course: {course_name}\nProvider: {provider}\nLevel: {level}\nSkills: {skills_str}\nSyllabus: {syllabus}"
        
        embedding = model.encode(text_for_embedding).tolist()
        
        points.append(
            PointStruct(
                id=idx + 1,
                vector=embedding,
                payload={
                    "course_name": course_name,
                    "provider": provider,
                    "level": level,
                    "skills": skills,
                    "syllabus": syllabus,
                    "text": text_for_embedding
                }
            )
        )
        
        # --- THE FIX: Batching logic inside the loop ---
        if len(points) >= 25:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            print(f"Upserted a batch of 25 courses... (Total processed: {idx + 1})")
            points = [] # Clear the list for the next batch
            
    # Flush any remaining points that didn't divide perfectly into 25
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"Successfully upserted final batch. Total processed: {len(data)}.")

if __name__ == "__main__":
    # Resolve path dynamically to apps/api/data/combined_dataset.json
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(api_dir, "data", "combined_dataset.json")
    process_and_upsert_data(data_path)