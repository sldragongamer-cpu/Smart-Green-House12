#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════
// CHANGE THESE 3 LINES:
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server = "https://your-page-url.com";  // <-- PUT YOUR URL HERE
// ═══════════════════════════════════════════════

// If your page is running locally, use your PC's LAN IP with http://
// Example: const char* server = "http://192.168.1.50:3000";

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts > 40) {
      Serial.println("\nFAILED! Check WiFi credentials.");
      Serial.print("Status code: ");
      Serial.println(WiFi.status());
      while (1);
    }
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float temp = 24.5 + (random(-20, 20) / 10.0);
  float hum = 60.0 + (random(-15, 15) / 10.0);
  int water = constrain(45 + random(-3, 4), 0, 100);

  HTTPClient http;
  http.begin(String(server) + "/api/sensors");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> json;
  json["temperature"] = temp;
  json["humidity"] = hum;
  json["water"] = water;

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

  http.begin(String(server) + "/api/control");
  int getCode = http.GET();
  if (getCode > 0) {
    String resp = http.getString();
    StaticJsonDocument<100> cmd;
    deserializeJson(cmd, resp);
    int fan = cmd["fan"] | -1;
    bool light = cmd["light"] | false;
    if (fan >= 0) { Serial.print("Fan: "); Serial.print(fan); Serial.println("%"); }
    Serial.print("Light: ");
    Serial.println(light ? "ON" : "OFF");
  }
  http.end();

  delay(2000);
}
