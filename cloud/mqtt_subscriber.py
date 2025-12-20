import os
import json
import time
import pickle
import numpy as np
import paho.mqtt.client as mqtt
from google.cloud import firestore
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
# Default to public broker for testing if not set
MQTT_BROKER = os.getenv("MQTT_BROKER", "test.mosquitto.org") 
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "motor/health/data"
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Initialize Firestore
db = firestore.Client()

# Load Model
try:
    with open("ml-model/motor_model.pkl", "rb") as f:
        model = pickle.load(f)
    print("✅ Logic Regression Model Loaded")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

def send_failure_notification(probability, data):
    """Sends a Telegram notification for high failure risk."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram credentials not found. Skipping notification.")
        return

    failure_time = datetime.fromtimestamp(data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
    
    message = (
        f"🚨 *CRITICAL WARNING: Motor Failure Detected* 🚨\n\n"
        f"⏰ **Time:** {failure_time}\n"
        f"⚠️ **Failure Probability:** {probability:.1%}\n\n"
        f"📊 **Sensor Readings:**\n"
        f"• Temperature: {data['temperature']:.1f} °C\n"
        f"• Vibration: {data['vibration']:.3f} m/s²\n"
        f"• RPM: {data['rpm']:.0f}\n\n"
        f"Please check the equipment immediately!"
    )
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"telegram notification sent: {response.status_code}")
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")

def process_sensor_data(data):
    """
    Processes received sensor data:
    1. Predicts failure probability
    2. Applies smoothing
    3. Saves to Firestore
    """
    try:
        # 1. Prediction
        X = np.array([[ 
            data['temperature'],
            data['vibration'],
            data['rpm']
        ]])
        raw_prob = model.predict_proba(X)[0][1]

        # 2. Smoothing (Rolling Window)
        previous_preds = db.collection("predictions")\
            .order_by("timestamp", direction=firestore.Query.DESCENDING)\
            .limit(4)\
            .get()

        rolling_values = [raw_prob]
        for doc in previous_preds:
            p_data = doc.to_dict()
            val = p_data.get("raw_failure_probability", p_data.get("failure_probability", 0.0))
            rolling_values.append(val)
            
        mean_prob = sum(rolling_values) / len(rolling_values)

        # 3. Firestore Write (Sensor Data)
        sensor_ref = db.collection("sensor_data").add({
            "temperature": data['temperature'],
            "vibration": data['vibration'],
            "rpm": data['rpm'],
            "timestamp": datetime.utcnow()
        })
        sensor_doc_id = sensor_ref[1].id

        # 4. Check Risk
        if mean_prob > 0.7:
            send_failure_notification(mean_prob, data)

        # 5. Firestore Write (Prediction)
        db.collection("predictions").add({
            "sensor_data_id": sensor_doc_id,
            "failure_probability": float(mean_prob),
            "raw_failure_probability": float(raw_prob),
            "timestamp": datetime.utcnow()
        })

        print(f"✅ Data Processed: Temp={data['temperature']} Vib={data['vibration']} RPM={data['rpm']} -> Risk={mean_prob:.1%}")

    except Exception as e:
        print(f"❌ Error processing data: {e}")

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print(f"📡 Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        # Ensure timestamp exists or use current
        if 'timestamp' not in data:
            data['timestamp'] = int(time.time())
            
        process_sensor_data(data)
    except json.JSONDecodeError:
        print("⚠️ Received non-JSON message")
    except Exception as e:
        print(f"❌ Error processing message: {e}")

# Main Execution
if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"🚀 Connecting to broker: {MQTT_BROKER}:{MQTT_PORT}...")
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
