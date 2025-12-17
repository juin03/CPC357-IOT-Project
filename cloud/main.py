import pickle
import os
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import firestore
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telegram Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_failure_notification(probability, sensor_data):
    """Sends a Telegram notification for high failure risk."""
    failure_time = datetime.fromtimestamp(sensor_data.timestamp).strftime('%Y-%m-%d %H:%M:%S')
    
    message = (
        f"🚨 *CRITICAL WARNING: Motor Failure Detected* 🚨\n\n"
        f"⏰ **Time:** {failure_time}\n"
        f"⚠️ **Failure Probability:** {probability:.1%}\n\n"
        f"📊 **Sensor Readings:**\n"
        f"• Temperature: {sensor_data.temperature:.1f} °C\n"
        f"• Vibration: {sensor_data.vibration:.3f} m/s²\n"
        f"• RPM: {sensor_data.rpm:.0f}\n\n"
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
        print(f"Telegram notification sent: status={response.status_code}, response={response.text[:100]}")
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")

app = FastAPI()
db = firestore.Client()

# Load trained model from ml-model folder
with open("ml-model/motor_model.pkl", "rb") as f:
    model = pickle.load(f)

# ---------- Data schema ----------
class SensorData(BaseModel):
    temperature: float
    vibration: float
    rpm: float
    timestamp: int

# ---------- Endpoint ----------
@app.post("/predict")
def predict(data: SensorData):
    try:
        X = np.array([[ 
            data.temperature,
            data.vibration,
            data.rpm
        ]])

        prob = model.predict_proba(X)[0][1]

        # Store sensor data and get document reference
        sensor_ref = db.collection("sensor_data").add({
            "temperature": data.temperature,
            "vibration": data.vibration,
            "rpm": data.rpm,
            "timestamp": datetime.utcfromtimestamp(data.timestamp)
        })
        
        # Get the document ID
        sensor_doc_id = sensor_ref[1].id

        # Check for high failure probability and send alert
        if prob > 0.7:
            send_failure_notification(prob, data)

        # Store prediction with reference to sensor data
        db.collection("predictions").add({
            "sensor_data_id": sensor_doc_id,
            "failure_probability": float(prob),
            "timestamp": datetime.utcnow()
        })

        return {
            "failure_probability": float(prob)
        }
    
    except Exception as e:
        # Return a proper error response
        print(f"Error in prediction endpoint: {e}")
        return {
            "error": str(e),
            "failure_probability": None
        }

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Motor Health API is running", "model": "trained_logistic_regression"}
