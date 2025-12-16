# Smart City Motor Health Monitoring System

IoT system for predictive maintenance of factory motors using ESP32, Machine Learning, and Google Cloud Platform.

## Architecture

```
ESP32 (Sensors) → Cloud Run (ML API) → Firestore (Database)
```

## Project Structure

```
.
├── main.py                      # FastAPI application with ML inference
├── Dockerfile                   # Container configuration
├── requirements.txt             # Python dependencies
├── ml-model/
│   ├── train_model.py          # Model training script
│   └── motor_model.pkl         # Trained logistic regression model
├── test_cloud.py               # Cloud deployment testing script
└── README.md
```

## Setup & Deployment

### Prerequisites

- Python 3.10+
- Google Cloud SDK
- GCP Project with Firestore enabled

### 1. Install Dependencies (Local Development)

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Train the ML Model

```powershell
cd ml-model
python train_model.py
```

This creates `motor_model.pkl` with a trained logistic regression model.

### 3. Authenticate with Google Cloud

```powershell
# Login to your Google account
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com
```

### 4. Grant Permissions (First Time Only)

```powershell
# Get your project number
gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"

# Grant Cloud Build permissions (replace PROJECT_NUMBER)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/artifactregistry.writer"
```

### 5. Deploy to Cloud Run

```powershell
gcloud run deploy motor-health-api --source . --region asia-southeast1 --allow-unauthenticated --platform managed
```

This command will:
- Build the Docker container
- Push to Artifact Registry
- Deploy to Cloud Run
- Return a public HTTPS URL

### 6. Test the Deployment

```powershell
# Test health check
curl https://YOUR-SERVICE-URL/ -UseBasicParsing

# Run comprehensive tests
python test_cloud.py
```

## API Endpoints

### `GET /`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Motor Health API is running",
  "model": "trained_logistic_regression"
}
```

### `POST /predict`
Predict motor failure probability.

**Request:**
```json
{
  "temperature": 35.5,
  "vibration": 0.03,
  "rpm": 1500,
  "timestamp": 1734268800
}
```

**Response:**
```json
{
  "failure_probability": 0.0234
}
```

## ESP32 Integration

Use the Cloud Run service URL in your ESP32 code:

```cpp
const char* serverUrl = "https://YOUR-SERVICE-URL/predict";

// Send POST request with JSON body
HTTPClient http;
http.begin(serverUrl);
http.addHeader("Content-Type", "application/json");

String jsonPayload = "{\"temperature\":" + String(temp) + 
                     ",\"vibration\":" + String(vib) + 
                     ",\"rpm\":" + String(rpm) + 
                     ",\"timestamp\":" + String(timestamp) + "}";

int httpCode = http.POST(jsonPayload);
```

## Firestore Collections

### `sensor_data`
Stores raw sensor readings:
- `temperature` (float)
- `vibration` (float)
- `rpm` (float)
- `timestamp` (datetime)

### `predictions`
Stores ML predictions with link to sensor data:
- `sensor_data_id` (string) - References the `sensor_data` document ID
- `failure_probability` (float, 0.0-1.0)
- `timestamp` (datetime)

## Monitoring

View live data in Firestore Console:
```
https://console.cloud.google.com/firestore/databases/-default-/data/panel?project=YOUR_PROJECT_ID
```

View Cloud Run logs:
```powershell
gcloud run logs read motor-health-api --region asia-southeast1
```

## Update Deployment

After making code changes:

```powershell
gcloud run deploy motor-health-api --source . --region asia-southeast1 --allow-unauthenticated --platform managed
```

## Clean Up

Delete the Cloud Run service:
```powershell
gcloud run services delete motor-health-api --region asia-southeast1
```

## Technology Stack

- **Hardware:** ESP32, DS18B20, MPU6050, IR Sensor
- **ML Framework:** scikit-learn (Logistic Regression)
- **API Framework:** FastAPI, Uvicorn
- **Cloud Platform:** Google Cloud Run, Firestore
- **Container:** Docker

## License

MIT License
