import urllib.request
import json

url = 'http://localhost:8000/api/roadmap'
data = json.dumps({'topic': 'React'}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print("Raw Output:")
        print(result)
except Exception as e:
    print("Error:", e)
