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
}

// ================== LOOP ==================
void loop()
{

  // -------- TEMPERATURE --------
  DS18B20.requestTemperatures();
  float tempC = DS18B20.getTempCByIndex(0);

  // -------- RPM + VIBRATION every 1 second --------
  if (millis() - lastRPMTime >= 1000)
  {

    // ----- RPM -----
    noInterrupts();
    unsigned long pulses = pulseCount;
    pulseCount = 0;
    interrupts();

    rpm = pulses * 60.0; // 1 mark per revolution
    lastRPMTime = millis();

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

    // Dont use this
    // Serial.println((vibRMS > VIB_THRESHOLD) ? "ON" : "OFF");

    // ----- POST TO API -----
    unsigned long ts = (unsigned long)(millis() / 1000); // fallback if NTP not used
    float failureProbability = sendToAPI(tempC, vibRMS, (int)rpm, ts);
    if (failureProbability >= 0)
    {
      Serial.print(" | Failure Risk: ");
      Serial.print(failureProbability * 100.0, 1);
      Serial.println(" %");

      // ----- BUZZER BEEP WHEN PROBABILITY > 0.8-----
      if (failureProbability > 0.8f)
      {
        digitalWrite(BUZZER_PIN, HIGH); // ALARM
      }
      else
      {
        digitalWrite(BUZZER_PIN, LOW);
      }
    }
    else
    {
      Serial.println(" | Failure Risk: N/A");
    }
  }
}
