import urllib.request
import json

url = 'http://localhost:3000/api/v1/bkt/evaluate'
payload = {
    'taskId': 'bf1d2e4d-e1db-4177-9ba0-81daf9f45907',
    'code': '''async function fetchUser(id) {
  await new Promise(r => setTimeout(r, 50));
  return { id: id, name: "User_" + id };
}'''
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode('utf-8'))
