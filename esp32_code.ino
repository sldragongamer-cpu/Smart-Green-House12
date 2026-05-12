/*
 * ESP32 → Arduino Cloud Dashboard
 * 
 * 1. Install ArduinoJson library (by Benoit Blanchon)
 * 2. Change ssid, password, and server below
 * 3. Upload to your ESP32
 * 
 * The ESP32 auto-registers as a device on the website.
 * Check the /devices page after the first POST.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ═══════ CONFIGURE THESE 3 LINES ═══════
const char* ssid     = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server   = "http://192.168.1.50:3000";  // your PC's LAN IP + port
// ════════════════════════════════════════

// For production: const char* server = "https://your-domain.com";

// ─── Device identity ───────────────────
// The deviceId is derived from the MAC address so it's stable across reboots.
// The deviceName and deviceType show up on the website's Devices page.
String deviceId;
const String deviceName = "My ESP32";      // ← change this
const String deviceType = "ESP32";         // ← change if using ESP8266 etc.

// ─── Pin assignments (adjust to your wiring) ───
const int LIGHT_RELAY = 13;   // digital out — light on/off
const int FAN_PWM     = 12;   // PWM out     — fan speed 0-100%
const int TEMP_PIN    = 34;   // analog in   — temperature sensor
const int HUM_PIN     = 35;   // analog in   — humidity sensor
const int WATER_PIN   = 32;   // analog in   — water level / soil moisture

int  currentFan   = 0;
bool currentLight = false;

void setup() {
  Serial.begin(115200);

  // Generate stable device ID from MAC
  uint64_t chipid = ESP.getEfuseMac();
  deviceId = "esp-" + String((uint16_t)(chipid >> 32), HEX) + String((uint32_t)chipid, HEX);

  pinMode(LIGHT_RELAY, OUTPUT);
  pinMode(FAN_PWM, OUTPUT);
  digitalWrite(LIGHT_RELAY, LOW);

  Serial.print("Device ID: ");
  Serial.println(deviceId);
  Serial.print("Device Name: ");
  Serial.println(deviceName);

  connectWiFi();
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int att = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++att > 40) {
      Serial.println("\nWiFi failed! Check credentials.");
      ESP.restart();
    }
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    return;
  }

  // ─── 1) Read sensors ──────────────────────
  float temperature = analogRead(TEMP_PIN) * 0.1;   // replace with DHT or real sensor
  float humidity    = analogRead(HUM_PIN) * 0.1;    // replace with real sensor
  int waterLevel    = constrain(map(analogRead(WATER_PIN), 0, 4095, 100, 0), 0, 100);

  // Demo fallback: simulate if no real sensor connected
  if (temperature < 1) temperature = 24.5 + (random(-20, 20) / 10.0);
  if (humidity < 1)    humidity    = 60.0 + (random(-15, 15) / 10.0);

  // ─── 2) POST sensor data + device info ────
  HTTPClient http;
  http.begin(String(server) + "/api/sensors");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<384> json;
  json["temperature"] = round(temperature * 10) / 10.0;
  json["humidity"]    = round(humidity * 10) / 10.0;
  json["water"]       = waterLevel;
  json["light"]       = currentLight;
  json["fan"]         = currentFan;
  json["deviceId"]    = deviceId;
  json["deviceName"]  = deviceName;
  json["deviceType"]  = deviceType;

  String body;
  serializeJson(json, body);
  int code = http.POST(body);

  if (code > 0) {
    Serial.print("Sent: ");
    Serial.println(body);
  } else {
    Serial.print("POST failed: ");
    Serial.println(http.errorToString(code));
  }
  http.end();

  // ─── 3) GET commands from dashboard ───────
  http.begin(String(server) + "/api/control");
  int getCode = http.GET();

  if (getCode > 0) {
    String resp = http.getString();
    StaticJsonDocument<128> cmd;
    deserializeJson(cmd, resp);

    int  fan   = cmd["fan"] | -1;
    bool light = cmd["light"] | currentLight;

    if (fan >= 0 && fan != currentFan) {
      currentFan = fan;
      analogWrite(FAN_PWM, map(currentFan, 0, 100, 0, 255));
      Serial.print("Fan set to: ");
      Serial.print(currentFan);
      Serial.println("%");
    }

    if (light != currentLight) {
      currentLight = light;
      digitalWrite(LIGHT_RELAY, currentLight ? HIGH : LOW);
      Serial.print("Light: ");
      Serial.println(currentLight ? "ON" : "OFF");
    }
  }
  http.end();

  delay(2000);
}
