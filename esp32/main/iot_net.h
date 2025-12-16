#pragma once

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Hardcoded API endpoint (Cloud Run)
static const char *API_URL = "https://motor-health-api-250203692178.asia-southeast1.run.app/predict";

// Provide your WiFi credentials via build flags or set here if needed
#ifndef WIFI_SSID
#define WIFI_SSID "johnas"
#endif
#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "leeyingshen"
#endif

inline void connectWiFi()
{
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_MODE_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    uint8_t attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 60)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("✓ WiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Signal strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    else
    {
        Serial.println("✗ WiFi connection failed! Check SSID/password.");
    }
}

inline float sendToAPI(float temperature, float vibration, int rpm, unsigned long timestamp)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("✗ WiFi not connected!");
        return -1.0f;
    }

    HTTPClient http;
    http.setTimeout(15000);
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["vibration"] = vibration;
    doc["rpm"] = rpm;
    doc["timestamp"] = timestamp;

    String payload;
    serializeJson(doc, payload);

    Serial.print("📤 Sending to API... ");
    int code = http.POST(payload);
    float failureProbability = -1.0f;

    if (code == 200)
    {
        String response = http.getString();
        Serial.println("✓ Success!");

        StaticJsonDocument<128> resp;
        DeserializationError err = deserializeJson(resp, response);
        if (!err)
        {
            failureProbability = resp["failure_probability"].as<float>();
        }
        else
        {
            Serial.println("✗ Failed to parse response JSON");
        }
    }
    else if (code > 0)
    {
        Serial.printf("✗ HTTP Error: %d\n", code);
        Serial.println("Response: " + http.getString());
    }
    else
    {
        Serial.printf("✗ Connection error: %s\n", http.errorToString(code).c_str());
    }

    http.end();
    return failureProbability;
}
