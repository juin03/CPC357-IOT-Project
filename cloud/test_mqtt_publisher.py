import paho.mqtt.client as mqtt
import json
import time
import random
import os
from dotenv import load_dotenv

# Load environment variables (optional, for broker IP)
load_dotenv()

# Configuration
# Default to localhost if running on the same machine/network as the broker
# User should replace this with VM External IP if running from a different network
MQTT_BROKER = os.getenv("MQTT_BROKER", "34.177.80.102") 
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "motor/health/data"

print(f"🚀 Connecting to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT}...")

def on_connect(client, userdata, flags, rc):
    connection_codes = {
        0: "Success",
        1: "Refused - unacceptable protocol version",
        2: "Refused - identifier rejected",
        3: "Refused - server unavailable",
        4: "Refused - bad username or password",
        5: "Refused - not authorized"
    }
    print(f"📡 Connection Status: {connection_codes.get(rc, 'Unknown code')}")
    if rc == 0:
        print("✅ Simulating sensor data stream...")

def on_publish(client, userdata, mid):
    # print(f"Message {mid} published.")
    pass

client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start() # Start background thread for network loop
except Exception as e:
    print(f"❌ Connection Failed: {e}")
    print("Ensure Mosquitto is running and port 1883 is open in firewall.")
    exit(1)

# Simulation Loop
try:
    count = 1
    while True:
        # Generate realistic data
        # 80% chance of Normal, 20% Anomalies
        if random.random() > 0.2:
            # Normal
            temp = random.uniform(20, 35)
            vib = random.uniform(0.1, 0.5)
            rpm = random.uniform(2500, 3000)
            status = "NORMAL"
        else:
            # Anomaly (High Risk)
            chance = random.random()
            if chance < 0.33:
               # High Temp
               temp = random.uniform(60, 80)
               vib = random.uniform(0.5, 0.8)
               rpm = random.uniform(2000, 2800)
               status = "HIGH TEMP"
            elif chance < 0.66:
               # High Vib
               temp = random.uniform(30, 45)
               vib = random.uniform(2.0, 5.0)
               rpm = random.uniform(2000, 2800)
               status = "HIGH VIB"
            else:
               # Stall
               temp = random.uniform(50, 65)
               vib = random.uniform(3.0, 6.0)
               rpm = random.uniform(0, 500)
               status = "STALL"

        payload = {
            "temperature": round(temp, 1),
            "vibration": round(vib, 3),
            "rpm": int(rpm),
            "timestamp": int(time.time())
        }

        json_payload = json.dumps(payload)
        client.publish(MQTT_TOPIC, json_payload)
        
        print(f"[{count}] Output: {status} | Temp: {payload['temperature']}°C | Vib: {payload['vibration']} m/s² | RPM: {payload['rpm']}")
        
        count += 1
        time.sleep(2) # Send every 2 seconds

except KeyboardInterrupt:
    print("\n🛑 Simulation stopped by user.")
    client.loop_stop()
    client.disconnect()
