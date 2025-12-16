#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <time.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Cloud API endpoint
const char* apiUrl = "YOUR_CLOUD_RUN_API_URL/predict";

// NTP settings for timestamp
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;        // UTC offset in seconds
const int daylightOffset_sec = 0;

// Sensor pins (adjust based on your setup)
const int tempSensorPin = A0;     // Temperature sensor (e.g., LM35, DHT22)
const int vibSensorPin = D1;      // Vibration sensor (e.g., SW-420, ADXL345)
const int rpmSensorPin = D2;      // RPM sensor (e.g., Hall effect, IR sensor)

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;  // Send data every 5 seconds

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n=================================");
  Serial.println("Motor Health Monitoring - ESP8266");
  Serial.println("=================================\n");
  
  // Initialize sensor pins
  pinMode(tempSensorPin, INPUT);
  pinMode(vibSensorPin, INPUT);
  pinMode(rpmSensorPin, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  // Initialize time via NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time sync...");
  
  time_t now = time(nullptr);
  int retries = 0;
  while (now < 8 * 3600 * 2 && retries < 20) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retries++;
  }
  Serial.println();
  
  if (now > 8 * 3600 * 2) {
    Serial.println("✓ Time synchronized!");
    Serial.print("Current time: ");
    Serial.println(ctime(&now));
  } else {
    Serial.println("✗ Time sync failed! Using default timestamp.");
  }
  
  Serial.println("\n✓ Setup complete. Starting sensor monitoring...\n");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Send data at specified interval
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    
    // Read sensor values
    float temperature = readTemperature();
    float vibration = readVibration();
    int rpm = readRPM();
    unsigned long timestamp = time(nullptr);
    
    // Display readings
    Serial.println("─────────────────────────────────");
    Serial.printf("📊 Temperature: %.1f °C\n", temperature);
    Serial.printf("📊 Vibration: %.3f m/s²\n", vibration);
    Serial.printf("📊 RPM: %d rev/min\n", rpm);
    Serial.printf("🕐 Timestamp: %lu\n", timestamp);
    
    // Send to Cloud API
    float failureProbability = sendToAPI(temperature, vibration, rpm, timestamp);
    
    if (failureProbability >= 0) {
      Serial.printf("🔮 Failure Risk: %.1f%%", failureProbability * 100);
      
      if (failureProbability < 0.3) {
        Serial.println(" [LOW - Normal operation]");
      } else if (failureProbability < 0.7) {
        Serial.println(" [MEDIUM - Monitor closely]");
      } else {
        Serial.println(" [HIGH - Maintenance needed!]");
      }
    }
    
    Serial.println("─────────────────────────────────\n");
  }
  
  delay(100);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✓ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("✗ WiFi connection failed!");
    Serial.println("Please check SSID and password.");
    while (1) {
      delay(1000);
    }
  }
}

float sendToAPI(float temperature, float vibration, int rpm, unsigned long timestamp) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected!");
    return -1.0;
  }
  
  WiFiClientSecure client;
  client.setInsecure();  // Skip SSL certificate verification (for development)
  
  HTTPClient http;
  http.begin(client, apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000);  // 15 second timeout
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["vibration"] = vibration;
  doc["rpm"] = rpm;
  doc["timestamp"] = timestamp;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.print("📤 Sending to API... ");
  
  int httpResponseCode = http.POST(payload);
  float failureProbability = -1.0;
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✓ Success!");
    
    // Parse response JSON
    StaticJsonDocument<100> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      failureProbability = responseDoc["failure_probability"];
    } else {
      Serial.println("✗ Failed to parse response");
    }
  } else if (httpResponseCode > 0) {
    Serial.printf("✗ HTTP Error: %d\n", httpResponseCode);
    Serial.println("Response: " + http.getString());
  } else {
    Serial.printf("✗ Connection error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
  return failureProbability;
}

// Sensor reading functions - Implement based on your actual sensors

float readTemperature() {
  // Example for LM35 temperature sensor (10mV per degree Celsius)
  // Adjust this based on your actual sensor
  
  int rawValue = analogRead(tempSensorPin);
  float voltage = rawValue * (3.3 / 1024.0);  // NodeMCU uses 3.3V
  float temperature = voltage * 100.0;         // LM35: 10mV/°C
  
  // Simulate realistic variations if no sensor connected
  if (temperature < 10 || temperature > 100) {
    temperature = 25.0 + random(-50, 200) / 10.0;  // 20-45°C range
  }
  
  return temperature;
}

float readVibration() {
  // Example for vibration sensor
  // Adjust this based on your actual sensor (ADXL345, SW-420, etc.)
  
  int rawValue = digitalRead(vibSensorPin);  // For digital vibration sensor
  float vibration = rawValue * 0.05;         // Scale to m/s²
  
  // Simulate realistic variations if no sensor connected
  if (vibration < 0.001) {
    vibration = 0.02 + random(0, 50) / 1000.0;  // 0.02-0.07 m/s² range
  }
  
  return vibration;
}

int readRPM() {
  // Example for RPM sensor (Hall effect or IR sensor)
  // Adjust this based on your actual sensor
  
  // For pulse-counting sensors, you'd typically use interrupts
  // This is a simplified example
  
  int pulseCount = pulseIn(rpmSensorPin, HIGH, 100000);  // Wait max 100ms
  int rpm = (pulseCount > 0) ? (60000000 / pulseCount) : 0;
  
  // Simulate realistic variations if no sensor connected
  if (rpm < 100 || rpm > 2000) {
    rpm = 1450 + random(-100, 150);  // 1350-1600 RPM range
  }
  
  return rpm;
}
