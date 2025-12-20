#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
// Networking helpers (renamed to avoid collision with core Network.h)
#include "iot_net.h"

// ================== PIN DEFINITIONS ==================
#define TEMP_PIN 17
#define RPM_PIN 25
#define BUZZER_PIN 26

// ================== POSTING INTERVAL ==================
#define POST_INTERVAL_MS 5000

// ================== TEMPERATURE ==================
OneWire oneWire(TEMP_PIN);
DallasTemperature DS18B20(&oneWire);

// ================== RPM ==================
volatile unsigned long pulseCount = 0;
unsigned long lastRPMTime = 0;
float rpm = 0;

// ================== MPU6050 ==================
Adafruit_MPU6050 mpu;
float vibRMS = 0;

// ================== VIBRATION SETTINGS ==================
#define VIB_SAMPLES 200
#define VIB_DELAY_US 500  // ~2 kHz
#define VIB_THRESHOLD 0.6 // m/s^2 → tune this!

// ================== ISR ==================
void IRAM_ATTR countPulse()
{
  pulseCount++;
}

// ================== SETUP ==================
void setup()
{
  Serial.begin(115200);

  // I2C protection
  Wire.setTimeOut(50);
  Wire.begin(21, 22);

  // Temperature
  DS18B20.begin();

  // RPM
  pinMode(RPM_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(RPM_PIN), countPulse, FALLING);

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // MPU6050
  if (!mpu.begin())
  {
    Serial.println("MPU6050 not found!");
    while (1)
      ;
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_16_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_260_HZ);

  lastRPMTime = millis();

  // WiFi
  connectWiFi();
  // Connect to MQTT broker once after WiFi
  connectMQTT();
}

// ================== LOOP ==================
void loop()
{
  // Keep MQTT connection alive and process inbound traffic
  mqttLoop();

  // -------- TEMPERATURE --------
  DS18B20.requestTemperatures();
  float tempC = DS18B20.getTempCByIndex(0);

  // -------- RPM + VIBRATION every POST_INTERVAL_MS --------
  unsigned long now = millis();
  if (now - lastRPMTime >= POST_INTERVAL_MS)
  {

    // ----- RPM -----
    noInterrupts();
    unsigned long pulses = pulseCount;
    pulseCount = 0;
    interrupts();

    unsigned long elapsedMs = now - lastRPMTime;
    if (elapsedMs == 0)
      elapsedMs = 1; // safety
    // Convert pulses over elapsedMs to revolutions per minute (1 pulse = 1 rev)
    rpm = (pulses * 60000.0f) / (float)elapsedMs;
    lastRPMTime = now;

    // ----- VIBRATION RMS -----
    float sum = 0.0;
    float sumSq = 0.0;

    for (int i = 0; i < VIB_SAMPLES; i++)
    {
      sensors_event_t accel, gyro, temp;
      mpu.getEvent(&accel, &gyro, &temp);

      float a = sqrt(
          accel.acceleration.x * accel.acceleration.x +
          accel.acceleration.y * accel.acceleration.y +
          accel.acceleration.z * accel.acceleration.z);

      sum += a;
      sumSq += a * a;

      delayMicroseconds(VIB_DELAY_US);
      yield(); // feed watchdog
    }

    float mean = sum / VIB_SAMPLES;
    vibRMS = sqrt((sumSq / VIB_SAMPLES) - (mean * mean));

    // ----- DEBUG OUTPUT -----
    Serial.print("Temp: ");
    Serial.print(tempC, 2);
    Serial.print(" °C | RPM: ");
    Serial.print(rpm);
    Serial.print(" | Vib RMS: ");
    Serial.print(vibRMS, 3);
    Serial.print(" m/s^2 | Alarm: ");
    // Finish the line to avoid mixing with MQTT logs
    Serial.println();

    // Dont use this
    // Serial.println((vibRMS > VIB_THRESHOLD) ? "ON" : "OFF");

    // ----- POST TO API (MQTT) -----
    unsigned long ts = (unsigned long)(millis() / 1000); // fallback if NTP not used

    float result = publishData(tempC, vibRMS, (int)rpm, ts);

    // Note: With MQTT we don't get immediate failure probability back synchronously
    // So we disable the immediate alarm check from the return value.
    // Ideally, the ESP32 should SUBSCRIBE to a "motor/health/alert" topic if we want 2-way comms.
    // For now, we just log.
    if (result == 0.0f)
    {
      Serial.println("Data queued.");
    }
    else
    {
      Serial.println("Failed to queue data.");
    }
  }
}
