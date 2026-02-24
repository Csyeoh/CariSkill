import logging
logging.basicConfig(level=logging.INFO)
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

client = QdrantClient(url="http://localhost:6333")
model = SentenceTransformer('BAAI/bge-small-en-v1.5')

if __name__ == "__main__":
    vector = model.encode("Next.js").tolist()
    results = client.query_points(
        collection_name="course_materials",
        query=vector,
        limit=5
    ).points
    
    print("SCORES FOR Next.js:")
    for res in results:
        print(f"Score: {res.score} - Course: {res.payload.get('course_name')}")
