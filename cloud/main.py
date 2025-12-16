import pickle
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import firestore
from datetime import datetime

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

    # Store prediction with reference to sensor data
    db.collection("predictions").add({
        "sensor_data_id": sensor_doc_id,
        "failure_probability": float(prob),
        "timestamp": datetime.utcnow()
    })

    return {
        "failure_probability": float(prob)
    }

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Motor Health API is running", "model": "trained_logistic_regression"}
