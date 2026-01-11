# Industrial Motor Health Monitoring System

IoT-based predictive maintenance system for industrial motors using ESP32, Random Forest ML inference, and real-time monitoring.

**🎯 UN SDG 9** - Industry, Innovation and Infrastructure

---

## 📁 Project Structure

```
├── cloud/          # MQTT Subscriber & ML model (Compute Engine)
├── dashboard/      # Firebase web dashboard  
├── esp32/          # Arduino firmware for edge device
└── README.md       # This file
```

---

## 🚀 Quick Start

### 1. **Dashboard** (View real-time data)
Visit: **https://iot-project-481405.web.app**

No installation needed! 🎉

### 2. **Cloud Layer** (Backend service)
The backend runs as an MQTT Subscriber service on a Google Compute Engine VM.

See [`cloud/README.md`](cloud/README.md) for VM setup and model details.

### 3. **ESP32** (Edge Device)
The ESP32 publishes sensor data to the MQTT broker:

**Payload Format:**
```json
{
  "temperature": 35.5,
  "vibration_rms": 0.03,
  "rpm": 1500
}
```

**Workflow:**
1. Collects temperature, vibration, and RPM.
2. Performs edge pre-processing (Vibration RMS).
3. Publishes to MQTT topic.
4. Alerts via local buzzer/LEDs if failure probability is high.

---

## 🔧 Development

### Cloud Layer
```powershell
cd cloud
# See cloud/README.md for VM setup and subscriber logic
```

### Dashboard
```powershell
cd dashboard
# See dashboard/README.md for features and deployment
```

---

## 📚 Documentation

- **Technical Report**: Detailed architecture, SDG impact, and methodology.
- **Cloud Layer**: See [`cloud/README.md`](cloud/README.md) - MQTT setup, ML model, VM deployment.
- **Dashboard**: See [`dashboard/README.md`](dashboard/README.md) - Features, Firebase setup, UI components.

---

## 🏗️ Architecture

```
ESP32 Sensors → MQTT Broker (Mosquitto) → Python Subscriber → Firestore Database
                                                ↓                   ↓
                                          ML Prediction        Dashboard
```

**Technologies:**
- **Hardware**: ESP32 (Temperature, Vibration, RPM sensors)
- **Backend**: Python MQTT Subscriber, Random Forest ML model
- **Broker**: Mosquitto on Google Compute Engine
- **Database**: Firebase Firestore (real-time)
- **Frontend**: Vanilla JS, Chart.js, Firebase Hosting
- **Cloud**: Google Cloud Platform (GCP)

---

## ⚡ Quick Commands

```powershell
# Run MQTT Subscriber (on VM)
cd cloud
python mqtt_subscriber.py

# Deploy Dashboard
cd dashboard
firebase deploy --only hosting

# Test locally (Mock Publisher)
cd cloud
python test_mqtt_publisher.py
```

---

## 🌐 Live URLs

- **Dashboard**: https://iot-project-481405.web.app
- **Firebase Console**: Requires authentication

---

## 📊 Features

✅ Real-time sensor monitoring  
✅ ML-based (Random Forest) failure prediction  
✅ Interactive multi-line charts  
✅ Search & filter predictions  
✅ Mobile-responsive dashboard  
✅ Automated Telegram alerts  

---

**For detailed documentation, refer to:**
- [`cloud/README.md`](cloud/README.md)
- [`dashboard/README.md`](dashboard/README.md)
