# Smart City Motor Health Monitoring System

IoT-based predictive maintenance system for urban factory motors using ESP32, ML inference, and real-time monitoring.

**🎯 UN SDG 11** - Sustainable Cities and Communities

---

## 📁 Project Structure

```
├── cloud/          # Cloud Run API with ML inference
├── dashboard/      # Firebase web dashboard  
└── README.md       # This file
```

---

## 🚀 Quick Start

### 1. **Dashboard** (View real-time data)
Visit: **https://iot-project-481405.web.app**

No installation needed! 🎉

### 2. **Cloud API** (Backend service)
The API is deployed on Google Cloud Run.

See [`cloud/README.md`](cloud/README.md) for API documentation.

### 3. **ESP32** (Hardware sensor)
Send sensor data to the API endpoint:

**Request:**
```
POST /predict
Content-Type: application/json

{
  "temperature": 35.5,
  "vibration": 0.03,
  "rpm": 1500,
  "timestamp": 1734350400
}
```

**Response:**
```json
{
  "failure_probability": 0.0234
}
```

**Notes:**
- `timestamp` must be a Unix timestamp (seconds since epoch)
- ESP32 can obtain timestamp via NTP sync: `configTime(0, 0, "pool.ntp.org")`
- Use `time(NULL)` in C/C++ to get current Unix timestamp
- Response contains the ML prediction (0.0 = 0% risk, 1.0 = 100% risk)

---

## 🔧 Development

### Cloud API
```powershell
cd cloud
# See cloud/README.md for setup, deployment, and API docs
```

### Dashboard
```powershell
cd dashboard
# See dashboard/README.md for features and deployment
```

---

## 📚 Documentation

- **Cloud API**: See [`cloud/README.md`](cloud/README.md) - Setup, ML model, deployment, testing
- **Dashboard**: See [`dashboard/README.md`](dashboard/README.md) - Features, Firebase setup, UI components

---

## 🏗️ Architecture

```
ESP32 Sensors → Cloud Run API → Firestore Database
                     ↓                    ↓
               ML Prediction         Dashboard
```

**Technologies:**
- **Hardware**: ESP32 (Temperature, Vibration, RPM sensors)
- **Backend**: FastAPI on Cloud Run, scikit-learn ML model
- **Database**: Firebase Firestore (real-time)
- **Frontend**: Vanilla JS, Chart.js, Firebase Hosting
- **Cloud**: Google Cloud Platform (GCP)

---

## ⚡ Quick Commands

```powershell
# Deploy Cloud API
cd cloud
gcloud run deploy motor-health-api --source .

# Deploy Dashboard
cd dashboard
firebase deploy --only hosting

# Test locally
cd cloud
python test_cloud.py
```

---

## 🌐 Live URLs

- **Dashboard**: https://iot-project-481405.web.app
- **API**: See `cloud/README.md` for endpoint details
- **Firebase Console**: Requires authentication

---

## 📊 Features

✅ Real-time sensor monitoring  
✅ ML-based failure prediction  
✅ Interactive multi-line charts  
✅ Search & filter predictions  
✅ Mobile-responsive dashboard  
✅ Auto-scaling cloud infrastructure  

---

## 📝 License

MIT

---

**For detailed documentation, refer to:**
- [`cloud/README.md`](cloud/README.md)
- [`dashboard/README.md`](dashboard/README.md)
