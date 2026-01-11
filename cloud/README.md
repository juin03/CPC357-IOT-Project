# Cloud Intelligence Layer (MQTT & ML)

IoT backend for predictive maintenance of industrial motors using MQTT communication, Random Forest Machine Learning, and Google Compute Engine.

## Architecture

```
ESP32 (Sensors) → MQTT Broker (Mosquitto) → Python Subscriber (ML) → Firestore (Database)
```

## Project Structure

```
.
├── mqtt_subscriber.py           # Main service for MQTT message handling & ML inference
├── requirements.txt             # Python dependencies
├── ml-model/
│   ├── train_model.py          # Model training script using Random Forest
│   └── motor_model.pkl         # Trained Random Forest model
├── vm_setup_guide.md           # Step-by-step guide for GCE VM setup
├── test_mqtt_publisher.py      # Local script to simulate ESP32 publishing
├── .env.example                # Environment variables template
└── README.md
```

## Telegram Notifications

The system sends real-time alerts to a Telegram Group when the motor failure probability exceeds **80%**.

### Configuration
Required environment variables (set on VM):
- `TELEGRAM_BOT_TOKEN`: API Token from @BotFather
- `TELEGRAM_CHAT_ID`: ID of the Telegram Group/Chat

## Setup & Deployment (Google Compute Engine)

### 1. VM Provisioning
The backend is hosted on a Google Cloud VM (`e2-micro`, Debian 11).
- **Firewall Rules**: Open ports 80, 443, and **1883** (MQTT).

### 2. Mosquitto Broker Setup
Install and configure Mosquitto as the central MQTT broker on the VM.
See [`vm_setup_guide.md`](vm_setup_guide.md) for detailed commands.

### 3. Subscriber Service Installation
1. Clone repository to VM.
2. Install Python dependencies: `pip install -r requirements.txt`.
3. Run the subscriber: `python mqtt_subscriber.py`.

## Machine Learning Model

- **Algorithm**: **Random Forest Classifier**
- **Features**: Temperature (°C), Vibration (RMS), and RPM.
- **Inference**: Sub-second execution for real-time failure probability calculation.

## ESP32 Integration (MQTT)

The ESP32 publishes to the `motor/sensor_data` topic:

```cpp
// Example payload
{
  "temperature": 38.5,
  "vibration_rms": 0.045,
  "rpm": 1450
}
```

## Firestore Collections

### `sensor_data`
- `temperature` (number)
- `vibration` (number)
- `rpm` (number)
- `timestamp` (server timestamp)

### `predictions`
- `sensor_data_id` (reference)
- `failure_probability` (0.0 - 1.0)
- `timestamp` (server timestamp)

## Monitoring

View logs on the VM:
```bash
journalctl -u motor-health-subscriber -f
```

## Technology Stack

- **ML Framework:** scikit-learn (Random Forest)
- **Protocol:** MQTT (Mosquitto)
- **Runtime:** Python 3.10
- **Cloud Platform:** Google Compute Engine, Firestore
- **Alerts:** Telegram Bot API
