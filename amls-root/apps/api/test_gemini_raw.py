import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("FATAL: GEMINI_API_KEY not found in environment.")
    exit(1)

print(f"Testing API Key: {api_key[:10]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
headers = {'Content-Type': 'application/json'}
data = {
    "contents": [{
        "parts": [{"text": "Hello, exactly one word reply."}]
    }]
}

print("Pinging Google Gemini API natively...")
try:
    response = requests.post(url, headers=headers, json=data)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE:", response.json())
except Exception as e:
    print("FATAL REQUEST ERROR:", str(e))
