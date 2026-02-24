import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("FATAL: GEMINI_API_KEY not found in environment.")
    exit(1)

print(f"Testing API Key: {api_key[:10]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
data = json.dumps({
    "contents": [{
        "parts": [{"text": "Hello, exactly one word reply."}]
    }]
}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

print("Pinging Google Gemini API natively...")
req = urllib.request.Request(url, data=data, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print("STATUS CODE:", response.status)
        print("RESPONSE:", result)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("FATAL REQUEST ERROR:", str(e))
