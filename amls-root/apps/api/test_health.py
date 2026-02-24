import urllib.request
import json

url = 'http://localhost:8000/health'
try:
    with urllib.request.urlopen(url) as response:
        result = response.read().decode('utf-8')
        print("Health Output:")
        print(result)
except Exception as e:
    print("Health Error:", e)
