import requests
import json

try:
    response = requests.post('http://localhost:8000/api/roadmap', json={"topic": "React"})
    print("STATUS:", response.status_code)
    print("JSON RESPONSE:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("ERROR:", e)
