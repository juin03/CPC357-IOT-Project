# Technical Report: Smart City Motor Health Monitoring System
**Course:** CPC357 - IoT & Cloud Computing
**Project:** Smart City Motor Health Monitoring System
**Date:** December 17, 2025

---

## 1.0 Problem Statement
Industrial motors are the workhorses of urban infrastructure, powering everything from water treatment pumps to subway ventilation fans. However, they commonly experience failures due to overheating, excessive vibration, or unstable rotational speed. These mechanical faults often develop gradually, but traditional "run-to-failure" or scheduled maintenance approaches are inefficient. Manual inspections are infrequent and hazardous, often failing to identify early warning signs. Consequently, sudden breakdowns lead to costly downtime, service disruptions, and safety risks. Therefore, a low-cost IoT and machine learning system is required to continuously monitor motor condition, analyze patterns, and predict potential failures before they occur, transitioning maintenance from reactive to proactive.

## 2.0 Objectives
The primary goal is to develop a robust prototype that demonstrates the feasibility of remote, predictive maintenance.
1.  **Monitor Motor Health**: continuously measure critical parameters (temperature, vibration, and RPM) using the ESP32 microcontroller with high sampling precision.
2.  **Predict Failures**: Leverage cloud computing (**Google Cloud Run**) to execute machine learning models that detect anomalies and calculate failure probability in real-time.
3.  **Real-time Visualization**: Centralize data storage in **Google Firestore** and visualize live telemetry via a responsive web dashboard for remote decision-making.
4.  **Local & Remote Alerts**: Trigger immediate local warnings (buzzer) and remote notifications (Telegram) when abnormal behavior is detected to ensure rapid response.

---

## 3.0 Components Used

### 3.1 Microcontroller & Edge Processor
1.  **ESP32 NodeMCU**: Selected for its dual-core processor and built-in Wi-Fi capabilities. It acts as the edge gateway, collecting raw sensor data, performing pre-processing (like vibration RMS calculation) to reduce bandwidth, and securely transmitting JSON payloads via HTTPS.
2.  **Google Cloud Run (Serverless)**: A containerized environment hosting the Python FastAPI backend. It replaces the need for a local Raspberry Pi by shifting the heavy ML inference workload to the cloud, ensuring high availability, automatic scaling, and zero maintenance overhead.

### 3.2 Motor Under Test
*   **Model**: 300C 1.5–6V DC Motor (from IoT Kit) with a 3-blade propeller.
*   **Purpose**: Acts as the physical plant for the simulation. It allows for the safe induction of faults—such as obstructing the fan (stall/RPM drop) or heating the casing (overheating)—to validate the system's detection capabilities.

---

## 4.0 Sensors

| Sensor | Detection Capability | Range & Specification | Usage in Project |
| :--- | :--- | :--- | :--- |
| **DS18B20** (Temperature) | Detects thermal runaway and friction-induced heat. | **Range:** -55°C to +125°C<br>**Accuracy:** ±0.5°C<br>**Protocol:** OneWire | Attached to the motor casing to monitor operating temperature deviations. |
| **MPU6050** (Vibration) | Measures mechanical instability and structural looseness. | **Accel Range:** ±16g<br>**Gyro Range:** ±2000 °/s<br>**Precision:** 16-bit ADC | Mounted rigidly to the motor base. Calculates Root Mean Square (RMS) acceleration to detect abnormal vibrations. |
| **TCRT5000** (RPM/IR) | Detects rotational speed and stall conditions. | **Range:** 0.2mm to 15mm<br>**Type:** Reflective IR<br>**Output:** Digital Pulse | Placed near the spinning propeller to count rotations per minute, detecting load changes or power failures. |

---

## 5.0 Actuators
1.  **Active Buzzer**: A simple piezoelectric buzzer connected to a GPIO pin. It provides immediate audible feedback to on-site personnel when the cloud API returns a "High Risk" status (>80% probability), ensuring safety even if the dashboard is not being watched.
2.  **Telegram Notification**: A software actuator that pushes an alert message to a designated Telegram group chat, informing remote engineers of the specific fault type and current risk level.

---

## 6.0 Machine Learning Approach

### 6.1 Synthetic Data for Training
Since inducing catastrophic failure in a small prototype motor is difficult and destructive, a synthetic dataset was generated to train the model. This dataset models:
1.  **Normal Operation**: Low vibration, stable RPM, ambient temperature.
2.  **Overheating**: Gradual temperature ramp-up with normal vibration.
3.  **Unbalance/Loose**: High vibration spikes with unstable RPM.
4.  **Stall**: Zero or low RPM with rising temperature.

### 6.2 Logic & Classification
*   **Model Architecture**: A Logistic Regression classifier was chosen for its interpretability and speed. It outputs a continuous probability score (0.0 to 1.0) rather than a binary class, allowing for nuanced risk levels.
*   **Deployment**: The model is serialized (`pickle`) and loaded into the FastAPI container on Cloud Run.
*   **Inference Flow**: `Input Vector [Temp, Vib_RMS, RPM]` → `Model` → `Failure Probability`.

---

## 7.0 Cloud Dashboard and Data Storage
**Google Firebase** provides a unified platform for the real-time app layer, chosen for its seamless integration with Google Cloud services.

### 7.1 Dashboard Features
1.  **Live Monitoring**: Multi-line charts (Chart.js) update instantly via Firestore listeners, effectively showing the "heartbeat" of the machine.
2.  **Risk Assessment**: A color-coded status indicator (Green=Safe, Yellow=Warning, Red=Critical) gives an at-a-glance health summary.
3.  **Data Persistence**: All readings are stored in the `sensor_data` collection, while predictions go to `predictions`, allowing for historical auditing.

### 7.2 Data Flow Pipeline
1.  **Acquisition**: ESP32 reads sensors every 1000ms.
2.  **Ingestion**: HTTPS POST request sent to Cloud Run endpoint `/predict`.
3.  **Processing**: Cloud Run computes risk and writes results to Firestore.
4.  **Presentation**: Dashboard subscribes to Firestore changes and renders new data points.

---

## 8.0 SDG 9 Impact Analysis
**Goal 9: Industry, Innovation and Infrastructure**

This project directly supports the modernization of industrial infrastructure:
*   **Target 9.4 (Sustainable Infrastructure)**: By retrofitting legacy motors with simple add-on sensors (using the retrofit concept), industries can extend the life of existing machinery rather than replacing it, promoting resource efficiency.
*   **Target 9.5 (Technological Upgrade)**: It demonstrates the application of cutting-edge Industry 4.0 technologies (Cloud AI, Edge Computing) in a practical, accessible manner, bridging the gap between theoretical research and industrial application.
*   **Resilience**: Predictive maintenance ensures that critical services (water, power, transport) face fewer interruptions, building a more resilient urban ecosystem.

---

## 9.0 Expected Outcomes
1.  **Functional Prototype**: A fully integrated hardware-software loop capable of continuous operation without manual intervention.
2.  **Accurate Anomaly Detection**: The system successfully identifies induced faults (heating, shaking, stopping) with high confidence.
3.  **Operational Dashboard**: A publicly accessible web URL displaying live telemetry with sub-second latency.
4.  **Proactive Safety**: Validated alert chain where a physical fault triggers a digital notification within seconds, proving the "Safety First" concept.

---

## 10.0 Links and Resources

### 10.1 Source Code Repository
*   **GitHub Link**: [INSERT YOUR GITHUB LINK HERE]

### 10.2 Demonstration Video
*   **YouTube Link**: [INSERT YOUR YOUTUBE VIDEO LINK HERE]
