/*
  EMU Robot Firmware v6.0
  - Modular, component-based firmware for the EMU Robot Control Dashboard
  - Supports dynamic enabling/disabling of all hardware components.
*/

// Core Libraries
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// Component Libraries
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <Adafruit_NeoPixel.h>

// --- WIFI CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- PIN DEFINITIONS ---
// Motors (L298N or similar)
#define MOTOR_L_IN1 12
#define MOTOR_L_IN2 14
#define MOTOR_R_IN3 27
#define MOTOR_R_IN4 26
// OLED Display (SSD1306)
#define OLED_SDA 21
#define OLED_SCL 22
// Buzzer
#define BUZZER_PIN 4
// Ultrasonic Sensor (HC-SR04)
#define TRIG_PIN 5
#define ECHO_PIN 18
// Smoke Sensor (MQ-2)
#define SMOKE_PIN 36 // VP
// Battery Monitor
#define BATT_PIN 39 // VN
// DHT Sensor
#define DHT_PIN 25
#define DHT_TYPE DHT11 // or DHT22
// LDR Sensor
#define LDR_PIN 34
// IR Receiver
#define IR_PIN 35 // Note: IR library not included for simplicity, just reading pin state
// NeoPixel LEDs
#define NEOPIXEL_PIN 23
#define NEOPIXEL_COUNT 8 // Number of LEDs in your strip

// --- GLOBAL OBJECTS ---
AsyncWebServer server(80);
WebSocketsServer webSocket(81);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_NeoPixel pixels(NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

// --- ROBOT STATE & CONFIGURATION ---
struct ComponentConfig {
  bool motors = true;
  bool buzzer = true;
  bool oled = true;
  bool ultrasonic = true;
  bool smoke = true;
  bool dht = true;
  bool ldr = true;
  bool irReceiver = true;
  bool neopixel = true;
};
ComponentConfig components;

struct NeoPixelState {
  String mode = "static";
  uint8_t r = 0, g = 100, b = 255;
  uint8_t brightness = 50;
};
NeoPixelState neopixelState;

unsigned long lastSensorRead = 0;
unsigned long uptime_seconds = 0;

// --- FUNCTION DECLARATIONS ---
void handleWebSocketMessage(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
void sendSensorData();
void setMotorSpeed(int left, int right);
void updateOLED(String text, String expression);
void updateNeoPixels();

// --- SETUP ---
void setup() {
  Serial.begin(115200);

  // Initialize WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize Components if enabled
  if (components.motors) {
    pinMode(MOTOR_L_IN1, OUTPUT);
    pinMode(MOTOR_L_IN2, OUTPUT);
    pinMode(MOTOR_R_IN3, OUTPUT);
    pinMode(MOTOR_R_IN4, OUTPUT);
  }
  if (components.buzzer) pinMode(BUZZER_PIN, OUTPUT);
  if (components.ultrasonic) {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
  }
  if (components.oled) {
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
      Serial.println(F("SSD1306 allocation failed"));
    }
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("EMU v6.0 Online!");
    display.display();
  }
  if (components.dht) dht.begin();
  if (components.neopixel) {
    pixels.begin();
    pixels.setBrightness(neopixelState.brightness);
    updateNeoPixels();
  }

  // WebSocket Server
  webSocket.begin();
  webSocket.onEvent(handleWebSocketMessage);

  // HTTP Server (for health check)
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", "EMU Robot is online!");
  });
  server.begin();
}

// --- MAIN LOOP ---
void loop() {
  webSocket.loop();
  
  // Send sensor data every 250ms
  if (millis() - lastSensorRead > 250) {
    sendSensorData();
    uptime_seconds = millis() / 1000;
    lastSensorRead = millis();
  }

  // Update NeoPixels continuously for effects like rainbow
  if (components.neopixel) {
    updateNeoPixels();
  }
}

// --- WEBSOCKET HANDLER ---
void handleWebSocketMessage(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    JsonDocument doc;
    deserializeJson(doc, payload, length);

    String messageType = doc["type"];
    if (messageType == "command") {
      JsonObject data = doc["data"];
      String action = data["action"];

      if (action == "move") {
        String dir = data["direction"];
        if (dir == "forward") setMotorSpeed(255, 255);
        else if (dir == "backward") setMotorSpeed(-255, -255);
        else if (dir == "left") setMotorSpeed(-200, 200);
        else if (dir == "right") setMotorSpeed(200, -200);
        else if (dir == "stop") setMotorSpeed(0, 0);
      } 
      else if (action == "buzzer" && components.buzzer) {
        bool state = data["state"];
        digitalWrite(BUZZER_PIN, state);
        if (data.containsKey("duration")) {
          delay(data["duration"]);
          digitalWrite(BUZZER_PIN, LOW);
        }
      }
      else if (action == "oled" && components.oled) {
        updateOLED(data["text"], "");
      }
      else if (action == "expression" && components.oled) {
        updateOLED("", data["expression"]);
      }
      else if (action == "toggle_component") {
        String comp = data["component"];
        bool enabled = data["enabled"];
        if (comp == "motors") components.motors = enabled;
        else if (comp == "buzzer") components.buzzer = enabled;
        // ... and so on for all components
      }
      else if (action == "neopixel" && components.neopixel) {
        if (data.containsKey("mode")) neopixelState.mode = data["mode"].as<String>();
        if (data.containsKey("brightness")) {
          neopixelState.brightness = data["brightness"];
          pixels.setBrightness(neopixelState.brightness);
        }
        if (data.containsKey("color")) {
          const char* hexColor = data["color"];
          long number = strtol(&hexColor[1], NULL, 16);
          neopixelState.r = (number >> 16) & 0xFF;
          neopixelState.g = (number >> 8) & 0xFF;
          neopixelState.b = number & 0xFF;
        }
      }
    }
  }
}

// --- SENSOR DATA SENDER ---
void sendSensorData() {
  JsonDocument doc;
  doc["type"] = "sensor_data";
  JsonObject data = doc.createNestedObject("data");

  // Read from sensors only if enabled
  if (components.ultrasonic) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH);
    data["ultrasonic"] = duration * 0.034 / 2;
  }
  if (components.smoke) {
    int smokeValue = analogRead(SMOKE_PIN);
    data["smokeLevel"] = map(smokeValue, 0, 4095, 0, 100);
    data["smoke"] = smokeValue > 1500; // Example threshold
  }
  if (components.dht) {
    data["temperature"] = dht.readTemperature();
    data["humidity"] = dht.readHumidity();
  }
  if (components.ldr) {
    data["lightLevel"] = map(analogRead(LDR_PIN), 0, 4095, 0, 100);
  }
  
  data["battery"] = map(analogRead(BATT_PIN), 0, 4095, 0, 100); // Simple mapping
  data["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

// --- ACTUATOR FUNCTIONS ---
void setMotorSpeed(int left, int right) {
  if (!components.motors) return;
  // Left Motor
  if (left > 0) {
    digitalWrite(MOTOR_L_IN1, HIGH);
    digitalWrite(MOTOR_L_IN2, LOW);
  } else {
    digitalWrite(MOTOR_L_IN1, LOW);
    digitalWrite(MOTOR_L_IN2, HIGH);
  }
  // Right Motor
  if (right > 0) {
    digitalWrite(MOTOR_R_IN3, HIGH);
    digitalWrite(MOTOR_R_IN4, LOW);
  } else {
    digitalWrite(MOTOR_R_IN3, LOW);
    digitalWrite(MOTOR_R_IN4, HIGH);
  }
}

void updateOLED(String text, String expression) {
  if (!components.oled) return;
  display.clearDisplay();
  // Drawing expressions would go here...
  display.setCursor(0, 30);
  display.println(text);
  display.display();
}

void updateNeoPixels() {
  if (!components.neopixel) return;
  
  if (neopixelState.mode == "off") {
    pixels.clear();
  } else if (neopixelState.mode == "static") {
    for(int i=0; i<NEOPIXEL_COUNT; i++) {
      pixels.setPixelColor(i, pixels.Color(neopixelState.r, neopixelState.g, neopixelState.b));
    }
  } else if (neopixelState.mode == "rainbow") {
    for(int i=0; i<NEOPIXEL_COUNT; i++) {
      pixels.setPixelColor(i, pixels.gamma32(pixels.ColorHSV((i * 65536 / NEOPIXEL_COUNT) + (millis() * 10)) & 0xFFFF, 255, 255)));
    }
  }
  pixels.show();
}
