import requests
import json
import time
import os
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Cloud Run URL from environment variable
url = os.getenv("CLOUD_RUN_URL", "https://motor-health-api-250203692178.asia-southeast1.run.app/predict")

# Generate 5 test cases with varying values
test_cases = []

print("Generating 5 diverse test cases...\n")

for i in range(5):
    # Generate realistic varying sensor data
    # Normal range: temp 20-45, vib 0.01-0.05, rpm 1400-1600
    # Risky range: temp 45-80, vib 0.05-0.15, rpm 1200-1400
    
    # Mix of normal, borderline, and risky conditions
    if i < 7:  # 35% normal operation
        temp = random.uniform(25, 40)
        vib = random.uniform(0.015, 0.04)
        rpm = random.uniform(1450, 1580)
    elif i < 14:  # 35% medium risk
        temp = random.uniform(40, 55)
        vib = random.uniform(0.04, 0.08)
        rpm = random.uniform(1350, 1450)
    else:  # 30% high risk
        temp = random.uniform(55, 75)
        vib = random.uniform(0.08, 0.13)
        rpm = random.uniform(1220, 1350)
    
    test_cases.append({
        "name": f"Test {i+1}",
        "data": {
            "temperature": round(temp, 1),
            "vibration": round(vib, 3),
            "rpm": int(rpm),
            "timestamp": int(time.time())
        }
    })

print(f"Testing Cloud Run API with {len(test_cases)} requests...\n")

results = []
for idx, test in enumerate(test_cases, 1):
    print(f"📊 {test['name']}: temp={test['data']['temperature']}°C, "
          f"vib={test['data']['vibration']}, rpm={test['data']['rpm']}", end=" → ")
    
    try:
        response = requests.post(url, json=test['data'])
        
        if response.status_code == 200:
            result = response.json()
            prob = result['failure_probability']
            risk_level = "LOW" if prob < 0.3 else "MED" if prob < 0.7 else "HIGH"
            print(f"✓ {prob:.1%} [{risk_level}]")
            results.append(prob)
        else:
            print(f"✗ Error: {response.status_code}")
    except Exception as e:
        print(f"✗ Connection error: {e}")
    
    # Small delay to avoid overwhelming the API
    time.sleep(0.5)

print(f"\n{'='*60}")
print(f"✅ Completed {len(results)}/{len(test_cases)} requests")
print(f"📈 Probability range: {min(results):.1%} - {max(results):.1%}")
print(f"📊 Average risk: {sum(results)/len(results):.1%}")
print(f"🌐 ESP32 URL: {url}")
print(f"{'='*60}")
