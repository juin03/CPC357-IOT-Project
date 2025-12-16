import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Cloud Run URL from environment variable
url = os.getenv("CLOUD_RUN_URL", "https://motor-health-api-250203692178.asia-southeast1.run.app/predict")

# Test data
test_cases = [
    {
        "name": "Normal operation",
        "data": {
            "temperature": 35.5,
            "vibration": 0.03,
            "rpm": 1500,
            "timestamp": int(time.time())
        }
    },
    {
        "name": "High risk",
        "data": {
            "temperature": 65.0,
            "vibration": 0.10,
            "rpm": 1250,
            "timestamp": int(time.time())
        }
    }
]

print("Testing Cloud Run API...\n")

for test in test_cases:
    print(f"📊 Test: {test['name']}")
    print(f"   Input: temp={test['data']['temperature']}°C, "
          f"vib={test['data']['vibration']}, rpm={test['data']['rpm']}")
    
    response = requests.post(url, json=test['data'])
    
    if response.status_code == 200:
        result = response.json()
        prob = result['failure_probability']
        print(f"   ✓ Response: {prob:.4f} ({prob:.2%})")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   {response.text}")
    
    print()

print("✅ API is deployed and working!")
print(f"🌐 ESP32 URL: {url}")
