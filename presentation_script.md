# Presentation Slides & Script
**Project:** Industrial Motor Health Monitoring System (SDG 9)

---

## Slide 1: Title Slide
**Visuals:**
*   **Title:** Industrial Motor Health Monitoring System
*   **Subtitle:** An IoT & Machine Learning Approach for SDG 9 (Industry, Innovation, and Infrastructure)
*   **Team Members:** [Your Names]
*   **Course:** CPC357 - IoT & Cloud Computing

**Script:**
"Good morning/afternoon everyone. Today, we are presenting our project: the Industrial Motor Health Monitoring System. This project focuses on modernizing industrial maintenance using IoT and Machine Learning, directly aligning with Sustainable Development Goal 9: Industry, Innovation, and Infrastructure."

---

## Slide 2: Introduction & Problem Statement
**Visuals:**

**The Problem:**
*   Industrial motors are critical (conveyors, compressors).
*   70% of failures are bearing/stator faults (overheating, vibration).
*   Current Method: "Run-to-failure" or infrequent manual checks.
*   Consequences: Unexpected downtime, safety risks, high costs.

**The Goal:** Move from Reactive to Proactive (Predictive) Maintenance.

**Script:**
"Let's start with the problem. Industrial motors are the workhorses of factories. However, they often fail due to issues like overheating or excessive vibration. In fact, over 70% of failures are related to bearings or stators. Specifically, bearing failures cause excessive shaking and vibration, while stator faults typically lead to extreme overheating.
Currently, many industries rely on 'run-to-failure' methods or manual inspections that are too infrequent to catch early warning signs. This leads to sudden breakdowns and costly production halts.
Our goal is to solve this by building a low-cost system that monitors motor health in real-time, predicting failures *before* they happen."

---

## Slide 3: The Solution - Hardware & Sensors
**Visuals:**
*   **Proposed Solution:** An IoT System integrated with Machine Learning to continuously monitor **Temperature**, **Vibration**, and **RPM**.
*   **Hardware Components:**

| Component | Type | Function |
| :--- | :--- | :--- |
| **ESP32 NodeMCU** | Edge Processor | Collects data & calculates RMS |
| **DS18B20** | Sensor | Monitors Temperature (Overheating) |
| **MPU6050** | Sensor | Monitors Vibration |
| **TCRT5000** | Sensor | Monitors RPM (Motor Speed/Stall) |
| **Active Buzzer** | Actuator | Local Audible Alert |
| **LEDs (Red/Green)** | Actuator | Local Visual Status |

**Script:**
"To address this challenge, we developed an intelligent IoT system integrated with Machine Learning. This system continuously monitors three critical parameters—Temperature, Vibration, and RPM—and proactively alerts the user the moment the motor shows signs of impending failure.

The main controller is the **ESP32 NodeMCU**, a powerful microcontroller that acts as our edge gateway. It collects data from three key sensors and transmits it to the cloud:
1.  The **DS18B20**, which monitors the motor's casing temperature to detect overheating.
2.  The **MPU6050**, an accelerometer that measures vibration. Instead of sending raw data, the ESP32 processes this locally to calculate the 'RMS' or roughness.
3.  The **TCRT5000**, an infrared sensor that counts rotations to calculate RPM, helping us detect stalls or load issues.

Finally, for immediate on-site safety, we've integrated **LEDs** and an **Active Buzzer**. These provide instant visual and audible warnings to operators on the factory floor, ensuring they are alerted even if they aren't looking at the dashboard."

---

## Slide 4: The Solution - Machine Learning
**Visuals:**
*   **Model:** Random Forest Classifier.
*   **Why Random Forest?** Handles non-linear relationships (e.g., High Temp + Low RPM = Bad).
*   **Training Data:** Synthetic dataset modeling:
    *   Normal Operation
    *   Overheating
    *   Unbalance/Loose
    *   Stall
*   **Output:** Failure Probability (0-100%).

**Script:**
"Collecting raw sensor data is only the first step. The real challenge is interpreting it. Traditional systems often rely on simple thresholds—like 'if temperature > 80 degrees, alarm'. But this is often too simple. A motor might be hot because it's working hard, which is normal, or because it's failing, which is critical. Simple rules can't tell the difference.

That is why we need Machine Learning. We implemented a **Random Forest Classifier**. We chose this model because it excels at understanding these complex, non-linear relationships. It looks at the combination of all factors at once—Temperature, Vibration, and RPM—to make a smart decision.

We trained the model on a synthetic dataset that simulates various real-world scenarios, including normal operation, overheating, unbalance, and stalling.

In operation, the model takes the live sensor data and calculates a 'Failure Probability'. If this probability exceeds 80%, the system immediately triggers a critical alert, allowing for proactive maintenance before a breakdown occurs."

---

## Slide 5: Google Cloud Platform (GCP) Setup
**Visuals:**
*   **Architecture Diagram** (Simplified):
    *   ESP32 -> MQTT -> Cloud VM -> Firestore -> Dashboard.
*   **Components:**
    *   **Google Compute Engine (VM):** Runs Mosquitto MQTT Broker & Python ML Subscriber.
    *   **Google Firestore:** NoSQL Database for real-time data storage.
    *   **Firebase Hosting:** Hosts the Web Dashboard.
    *   **Telegram:** Remote notifications.

**Script:**
"Now, let's look at our Cloud infrastructure, built entirely on the Google Cloud Platform.
We use a **Compute Engine VM** to host our MQTT Broker. MQTT is lightweight and perfect for real-time sensor data. On this same VM, a Python script runs our Machine Learning model in real-time.
The results are stored in **Google Firestore**, a NoSQL database that syncs data instantly.
Finally, we use **Firebase Hosting** to serve our web dashboard, and we've integrated a **Telegram Bot** to send push notifications to maintenance teams wherever they are."

---

## Slide 6: Demo
**Visuals:**
*   *Placeholder for Live Demo*
*   **What to show:**
    1.  Normal operation (Green LED).
    2.  Induce fault (e.g., block fan or heat sensor).
    3.  Show Dashboard updating in real-time.
    4.  Show Telegram alert arriving.

**Script:**
"We will now demonstrate the system in action. We will show how the sensors react to changes, how the data appears on the dashboard in real-time, and how the system triggers an alert when a failure is predicted."

---

## Slide 7: Conclusion
**Visuals:**
*   **Summary:**
    *   Real-time Monitoring (Temp, Vib, RPM).
    *   Predictive AI (Random Forest).
    *   Cloud Integration (GCP & Firebase).
*   **Impact:** Reduced downtime, increased safety, sustainable infrastructure (SDG 9).

**Script:**
"In conclusion, our project successfully demonstrates a complete end-to-end IoT solution. By combining edge computing with cloud AI, we can transform how industries approach maintenance. This system not only saves money by preventing downtime but also improves safety and contributes to more sustainable industrial infrastructure. Thank you."
