/*
  ESP32 Robot Controller
  Advanced Robotic Control Dashboard Backend
  
  Features:
  - WebSocket server for real-time communication
  - REST API endpoints
  - OLED display with animated expressions
  - Ultrasonic and smoke sensors
  - Motor and buzzer control
  - JSON-based communication protocol
*/

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// Network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Pin definitions
#define OLED_SDA 21
#define OLED_SCL 22
#define OLED_RST -1
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define TRIG_PIN 5
#define ECHO_PIN 18
#define SMOKE_PIN A0
#define BUZZER_PIN 4
#define MOTOR_LEFT_1 25
#define MOTOR_LEFT_2 26
#define MOTOR_RIGHT_1 27
#define MOTOR_RIGHT_2 14
#define MOTOR_LEFT_PWM 32
#define MOTOR_RIGHT_PWM 33

// Objects
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RST);
AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// Robot state
struct RobotState {
  bool buzzer = false;
  int leftMotorSpeed = 0;
  int rightMotorSpeed = 0;
  String direction = "stopped";
  String oledText = "Hello!";
  String expression = "neutral";
  bool ultrasonicEnabled = true;
  bool smokeEnabled = true;
  float distance = 0;
  bool smokeDetected = false;
  float smokeLevel = 0;
} robot;

// Timing
unsigned long lastSensorRead = 0;
unsigned long lastWebSocketUpdate = 0;
unsigned long lastExpressionChange = 0;
unsigned long expressionDuration = 2000;

// OLED expressions (simplified bitmap data)
const unsigned char eye_neutral[] PROGMEM = {
  0x3C, 0x42, 0x81, 0x81, 0x81, 0x42, 0x3C, 0x00
};

const unsigned char eye_happy[] PROGMEM = {
  0x3C, 0x42, 0x81, 0xC3, 0xC3, 0x42, 0x3C, 0x00
};

const unsigned char eye_sad[] PROGMEM = {
  0x3C, 0x42, 0x81, 0x83, 0x83, 0x42, 0x3C, 0x00
};

const unsigned char eye_surprised[] PROGMEM = {
  0x3C, 0x7E, 0xFF, 0xFF, 0xFF, 0x7E, 0x3C, 0x00
};

const unsigned char eye_angry[] PROGMEM = {
  0x18, 0x3C, 0x7E, 0xFF, 0xFF, 0x7E, 0x3C, 0x18
};

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SMOKE_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MOTOR_LEFT_1, OUTPUT);
  pinMode(MOTOR_LEFT_2, OUTPUT);
  pinMode(MOTOR_RIGHT_1, OUTPUT);
  pinMode(MOTOR_RIGHT_2, OUTPUT);
  
  // Initialize PWM
  ledcSetup(0, 5000, 8); // Channel 0, 5kHz, 8-bit resolution
  ledcSetup(1, 5000, 8); // Channel 1, 5kHz, 8-bit resolution
  ledcAttachPin(MOTOR_LEFT_PWM, 0);
  ledcAttachPin(MOTOR_RIGHT_PWM, 1);
  
  // Initialize OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Robot Starting...");
  display.display();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  
  // Initialize WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Initialize web server routes
  setupWebServer();
  
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("WebSocket server started on port 81");
  
  // Update OLED with IP
  updateOLED();
}

void loop() {
  webSocket.loop();
  
  unsigned long currentTime = millis();
  
  // Read sensors every 100ms
  if (currentTime - lastSensorRead >= 100) {
    readSensors();
    lastSensorRead = currentTime;
  }
  
  // Send WebSocket updates every 500ms
  if (currentTime - lastWebSocketUpdate >= 500) {
    sendSensorData();
    lastWebSocketUpdate = currentTime;
  }
  
  // Handle automatic expression changes
  if (currentTime - lastExpressionChange >= expressionDuration) {
    if (robot.smokeDetected) {
      robot.expression = "angry";
    } else if (robot.distance < 10) {
      robot.expression = "surprised";
    } else {
      robot.expression = "neutral";
    }
    updateOLED();
    lastExpressionChange = currentTime;
  }
}

void readSensors() {
  // Read ultrasonic sensor
  if (robot.ultrasonicEnabled) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
    if (duration > 0) {
      robot.distance = duration * 0.034 / 2; // Convert to cm
    }
  }
  
  // Read smoke sensor
  if (robot.smokeEnabled) {
    int smokeValue = analogRead(SMOKE_PIN);
    robot.smokeLevel = map(smokeValue, 0, 4095, 0, 100);
    robot.smokeDetected = robot.smokeLevel > 30; // Threshold at 30%
  }
}

void sendSensorData() {
  StaticJsonDocument<200> doc;
  doc["type"] = "sensor_data";
  doc["data"]["ultrasonic"] = robot.distance;
  doc["data"]["smoke"] = robot.smokeDetected;
  doc["data"]["smokeLevel"] = robot.smokeLevel;
  doc["data"]["timestamp"] = millis();
  
  String message;
  serializeJson(doc, message);
  webSocket.broadcastTXT(message);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      
      // Send current status
      sendStatusUpdate();
      break;
    }
    
    case WStype_TEXT: {
      Serial.printf("[%u] Received: %s\n", num, payload);
      
      StaticJsonDocument<300> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        handleCommand(doc);
      }
      break;
    }
    
    default:
      break;
  }
}

void handleCommand(JsonDocument& doc) {
  String action = doc["data"]["action"];
  
  if (action == "move") {
    String direction = doc["data"]["direction"];
    moveRobot(direction);
  }
  else if (action == "buzzer") {
    bool state = doc["data"]["state"];
    setBuzzer(state);
  }
  else if (action == "oled") {
    String text = doc["data"]["text"];
    robot.oledText = text;
    updateOLED();
  }
  else if (action == "expression") {
    String expression = doc["data"]["expression"];
    robot.expression = expression;
    updateOLED();
  }
  else if (action == "sensor_toggle") {
    String sensor = doc["data"]["sensor"];
    bool enabled = doc["data"]["enabled"];
    
    if (sensor == "ultrasonic") {
      robot.ultrasonicEnabled = enabled;
    } else if (sensor == "smoke") {
      robot.smokeEnabled = enabled;
    }
  }
  
  sendStatusUpdate();
}

void moveRobot(String direction) {
  robot.direction = direction;
  
  if (direction == "forward") {
    setMotors(200, 200);
  }
  else if (direction == "backward") {
    setMotors(-200, -200);
  }
  else if (direction == "left") {
    setMotors(-150, 150);
  }
  else if (direction == "right") {
    setMotors(150, -150);
  }
  else if (direction == "stop") {
    setMotors(0, 0);
  }
}

void setMotors(int left, int right) {
  robot.leftMotorSpeed = left;
  robot.rightMotorSpeed = right;
  
  // Left motor
  if (left > 0) {
    digitalWrite(MOTOR_LEFT_1, HIGH);
    digitalWrite(MOTOR_LEFT_2, LOW);
  } else if (left < 0) {
    digitalWrite(MOTOR_LEFT_1, LOW);
    digitalWrite(MOTOR_LEFT_2, HIGH);
  } else {
    digitalWrite(MOTOR_LEFT_1, LOW);
    digitalWrite(MOTOR_LEFT_2, LOW);
  }
  
  // Right motor
  if (right > 0) {
    digitalWrite(MOTOR_RIGHT_1, HIGH);
    digitalWrite(MOTOR_RIGHT_2, LOW);
  } else if (right < 0) {
    digitalWrite(MOTOR_RIGHT_1, LOW);
    digitalWrite(MOTOR_RIGHT_2, HIGH);
  } else {
    digitalWrite(MOTOR_RIGHT_1, LOW);
    digitalWrite(MOTOR_RIGHT_2, LOW);
  }
  
  // Set PWM speeds
  ledcWrite(0, abs(left));
  ledcWrite(1, abs(right));
}

void setBuzzer(bool state) {
  robot.buzzer = state;
  digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
}

void updateOLED() {
  display.clearDisplay();
  
  // Draw eyes based on expression
  const unsigned char* eyeData;
  switch (robot.expression.c_str()[0]) {
    case 'h': eyeData = eye_happy; break;
    case 's': eyeData = robot.expression.startsWith("sa") ? eye_sad : eye_surprised; break;
    case 'a': eyeData = eye_angry; break;
    default: eyeData = eye_neutral; break;
  }
  
  // Draw left eye
  display.drawBitmap(30, 10, eyeData, 8, 8, WHITE);
  // Draw right eye
  display.drawBitmap(90, 10, eyeData, 8, 8, WHITE);
  
  // Draw mouth based on expression
  if (robot.expression == "happy") {
    display.drawCircle(64, 35, 15, WHITE);
    display.fillRect(49, 25, 30, 15, BLACK);
  } else if (robot.expression == "sad") {
    display.drawCircle(64, 55, 15, WHITE);
    display.fillRect(49, 45, 30, 15, BLACK);
  } else if (robot.expression == "surprised") {
    display.fillCircle(64, 35, 5, WHITE);
  } else if (robot.expression == "angry") {
    display.drawLine(50, 40, 78, 40, WHITE);
  } else {
    display.drawLine(55, 35, 73, 35, WHITE);
  }
  
  // Display text
  display.setCursor(0, 50);
  display.setTextSize(1);
  display.println(robot.oledText.substring(0, 20)); // Limit to 20 chars
  
  display.display();
}

void sendStatusUpdate() {
  StaticJsonDocument<300> doc;
  doc["type"] = "status_update";
  doc["data"]["buzzer"] = robot.buzzer;
  doc["data"]["motors"]["left"] = robot.leftMotorSpeed;
  doc["data"]["motors"]["right"] = robot.rightMotorSpeed;
  doc["data"]["motors"]["direction"] = robot.direction;
  doc["data"]["oled"]["text"] = robot.oledText;
  doc["data"]["oled"]["expression"] = robot.expression;
  doc["data"]["sensors"]["ultrasonic"] = robot.ultrasonicEnabled;
  doc["data"]["sensors"]["smoke"] = robot.smokeEnabled;
  doc["data"]["timestamp"] = millis();
  
  String message;
  serializeJson(doc, message);
  webSocket.broadcastTXT(message);
}

void setupWebServer() {
  // CORS headers
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // REST API endpoints
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", "ESP32 Robot Controller v1.0");
  });
  
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
    StaticJsonDocument<300> doc;
    doc["buzzer"] = robot.buzzer;
    doc["distance"] = robot.distance;
    doc["smoke"] = robot.smokeDetected;
    doc["smokeLevel"] = robot.smokeLevel;
    doc["direction"] = robot.direction;
    doc["oledText"] = robot.oledText;
    doc["expression"] = robot.expression;
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  server.on("/buzzer", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("state")) {
      String state = request->getParam("state")->value();
      setBuzzer(state == "on" || state == "true" || state == "1");
      sendStatusUpdate();
      request->send(200, "application/json", "{\"status\":\"ok\"}");
    } else {
      request->send(400, "application/json", "{\"error\":\"Missing state parameter\"}");
    }
  });
  
  server.on("/oled", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("text")) {
      robot.oledText = request->getParam("text")->value();
      updateOLED();
      sendStatusUpdate();
      request->send(200, "application/json", "{\"status\":\"ok\"}");
    } else {
      request->send(400, "application/json", "{\"error\":\"Missing text parameter\"}");
    }
  });
  
  server.on("/move", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("direction")) {
      String direction = request->getParam("direction")->value();
      moveRobot(direction);
      sendStatusUpdate();
      request->send(200, "application/json", "{\"status\":\"ok\"}");
    } else {
      request->send(400, "application/json", "{\"error\":\"Missing direction parameter\"}");
    }
  });
  
  server.on("/sensor", HTTP_GET, [](AsyncWebServerRequest *request){
    StaticJsonDocument<200> doc;
    doc["distance"] = robot.distance;
    doc["smoke"] = robot.smokeDetected;
    doc["smokeLevel"] = robot.smokeLevel;
    doc["timestamp"] = millis();
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
}
