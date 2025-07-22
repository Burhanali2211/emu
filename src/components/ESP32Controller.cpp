#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <Wire.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Hardware Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Pin Definitions
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
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
AsyncWebServer server(80);
WebSocketsServer webSocket(81);

// Robot State
struct RobotState {
  bool buzzer = false;
  String oledText = "Hello! I'm EMU 🤖";
  String expression = "neutral";
  int leftMotorSpeed = 0;
  int rightMotorSpeed = 0;
  String direction = "stopped";
  bool ultrasonicEnabled = true;
  bool smokeEnabled = true;
  float ultrasonicWarning = 25.0;
  float ultrasonicDanger = 10.0;
  float smokeSensitivity = 50.0;
  unsigned long lastExpressionChange = 0;
  unsigned long lastBlink = 0;
  bool isBlinking = false;
} robot;

// OLED Eye Expressions (8x8 bitmaps)
const unsigned char eye_neutral[] PROGMEM = {
  0x3C, 0x7E, 0xFF, 0xFF, 0xFF, 0xFF, 0x7E, 0x3C
};

const unsigned char eye_happy[] PROGMEM = {
  0x3C, 0x66, 0xC3, 0xC3, 0xC3, 0xC3, 0x66, 0x3C
};

const unsigned char eye_sad[] PROGMEM = {
  0x3C, 0x7E, 0xFF, 0xE7, 0xE7, 0xFF, 0x7E, 0x3C
};

const unsigned char eye_surprised[] PROGMEM = {
  0x1C, 0x3E, 0x7F, 0xFF, 0xFF, 0x7F, 0x3E, 0x1C
};

const unsigned char eye_angry[] PROGMEM = {
  0x01, 0x07, 0x1F, 0x7F, 0xFF, 0xFC, 0xF0, 0xC0
};

const unsigned char eye_blink[] PROGMEM = {
  0x00, 0x00, 0x7E, 0x7E, 0x7E, 0x7E, 0x00, 0x00
};

const unsigned char eye_thinking[] PROGMEM = {
  0x3C, 0x7E, 0xDB, 0xFF, 0xFF, 0xDB, 0x7E, 0x3C
};

const unsigned char eye_excited[] PROGMEM = {
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
  ledcSetup(0, 5000, 8);
  ledcSetup(1, 5000, 8);
  ledcAttachPin(MOTOR_LEFT_PWM, 0);
  ledcAttachPin(MOTOR_RIGHT_PWM, 1);
  
  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  showBootScreen();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
    updateBootScreen("Connecting WiFi...");
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  updateBootScreen("WiFi Connected!");
  updateBootScreen("IP: " + WiFi.localIP().toString());
  
  // Setup WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Setup REST API endpoints
  setupRESTAPI();
  
  server.begin();
  Serial.println("EMU Robot Controller Ready! 🤖");
  
  // Show ready screen
  displayEyes("happy");
  robot.oledText = "EMU Ready! 🤖";
  updateOLED();
  
  delay(2000);
}

void loop() {
  webSocket.loop();
  
  // Auto-blink every 3-5 seconds
  if (millis() - robot.lastBlink > random(3000, 5000)) {
    robot.lastBlink = millis();
    robot.isBlinking = true;
    displayEyes("blink");
    delay(150);
    robot.isBlinking = false;
    displayEyes(robot.expression);
  }
  
  // Read sensors and send data every 500ms
  static unsigned long lastSensorRead = 0;
  if (millis() - lastSensorRead > 500) {
    lastSensorRead = millis();
    sendSensorData();
    
    // Auto safety checks
    float distance = readUltrasonic();
    if (distance < robot.ultrasonicDanger && robot.direction != "stopped") {
      stopMotors();
      robot.direction = "stopped";
      robot.expression = "surprised";
      displayEyes("surprised");
      sendCommandAck("auto_stop", "Emergency stop - obstacle too close");
    }
  }
  
  delay(50);
}

void showBootScreen() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("EMU Robot v3.0");
  display.println("Booting up...");
  display.display();
}

void updateBootScreen(String message) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("EMU Robot v3.0");
  display.println(message);
  display.display();
  delay(1000);
}

void updateOLED() {
  display.clearDisplay();
  
  // Draw eyes at top
  displayEyes(robot.expression);
  
  // Draw text at bottom
  display.setCursor(0, 48);
  display.setTextSize(1);
  display.print(robot.oledText.substring(0, 21)); // Limit to screen width
  
  display.display();
}

void displayEyes(String expression) {
  const unsigned char* eyePattern;
  
  if (expression == "happy") eyePattern = eye_happy;
  else if (expression == "sad") eyePattern = eye_sad;
  else if (expression == "surprised") eyePattern = eye_surprised;
  else if (expression == "angry") eyePattern = eye_angry;
  else if (expression == "blink") eyePattern = eye_blink;
  else if (expression == "thinking") eyePattern = eye_thinking;
  else if (expression == "excited") eyePattern = eye_excited;
  else eyePattern = eye_neutral;
  
  // Clear eye area
  display.fillRect(32, 16, 64, 24, SSD1306_BLACK);
  
  // Draw left eye
  display.drawBitmap(40, 20, eyePattern, 8, 8, SSD1306_WHITE);
  
  // Draw right eye
  display.drawBitmap(72, 20, eyePattern, 8, 8, SSD1306_WHITE);
  
  // Add special effects for certain expressions
  if (expression == "excited") {
    // Add sparkles
    display.drawPixel(36, 18, SSD1306_WHITE);
    display.drawPixel(84, 18, SSD1306_WHITE);
    display.drawPixel(38, 32, SSD1306_WHITE);
    display.drawPixel(82, 32, SSD1306_WHITE);
  } else if (expression == "thinking") {
    // Add thought bubble dots
    display.drawPixel(88, 16, SSD1306_WHITE);
    display.drawCircle(92, 14, 1, SSD1306_WHITE);
    display.drawCircle(96, 12, 2, SSD1306_WHITE);
  }
  
  display.display();
}

float readUltrasonic() {
  if (!robot.ultrasonicEnabled) return 999.0;
  
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // Timeout after 30ms
  if (duration == 0) return 999.0; // No echo received
  
  float distance = (duration * 0.034) / 2;
  return constrain(distance, 0, 400); // Limit to sensor range
}

float readSmoke() {
  if (!robot.smokeEnabled) return 0.0;
  
  int sensorValue = analogRead(SMOKE_PIN);
  float percentage = map(sensorValue, 0, 4095, 0, 100);
  return constrain(percentage, 0, 100);
}

void sendSensorData() {
  float distance = readUltrasonic();
  float smokeLevel = readSmoke();
  bool smokeDetected = smokeLevel > robot.smokeSensitivity;
  
  DynamicJsonDocument doc(512);
  doc["type"] = "sensor_data";
  doc["data"]["ultrasonic"] = distance;
  doc["data"]["smoke"] = smokeDetected;
  doc["data"]["smokeLevel"] = smokeLevel;
  doc["data"]["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void sendCommandAck(String commandId, String message = "") {
  DynamicJsonDocument doc(256);
  doc["type"] = "command_ack";
  doc["data"]["commandId"] = commandId;
  doc["data"]["message"] = message;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void sendError(String commandId, String error) {
  DynamicJsonDocument doc(256);
  doc["type"] = "error";
  doc["data"]["commandId"] = commandId;
  doc["data"]["message"] = error;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
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
      sendCurrentStatus();
      break;
    }
    
    case WStype_TEXT: {
      Serial.printf("[%u] Received: %s\n", num, payload);
      
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      
      String commandId = doc["id"].as<String>();
      String type = doc["type"].as<String>();
      
      if (type == "command") {
        handleCommand(doc["data"], commandId);
      }
      break;
    }
    
    default:
      break;
  }
}

void handleCommand(JsonObject data, String commandId) {
  String action = data["action"].as<String>();
  
  if (action == "move") {
    String direction = data["direction"].as<String>();
    int duration = data["duration"] | 0;
    
    moveRobot(direction);
    
    if (duration > 0) {
      delay(duration);
      stopMotors();
      robot.direction = "stopped";
    }
    
    sendCommandAck(commandId, "Movement command executed");
    
  } else if (action == "buzzer") {
    bool state = data["state"].as<bool>();
    robot.buzzer = state;
    digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
    
    sendCommandAck(commandId, state ? "Buzzer ON" : "Buzzer OFF");
    
  } else if (action == "oled") {
    String text = data["text"].as<String>();
    robot.oledText = text;
    updateOLED();
    
    sendCommandAck(commandId, "OLED updated");
    
  } else if (action == "expression") {
    String expression = data["expression"].as<String>();
    robot.expression = expression;
    displayEyes(expression);
    
    sendCommandAck(commandId, "Expression changed to " + expression);
    
  } else if (action == "patrol") {
    // Automated patrol behavior
    patrol();
    sendCommandAck(commandId, "Patrol completed");
    
  } else if (action == "scan") {
    // Environmental scan
    scan();
    sendCommandAck(commandId, "Scan completed");
    
  } else {
    sendError(commandId, "Unknown command: " + action);
  }
}

void moveRobot(String direction) {
  robot.direction = direction;
  
  if (direction == "forward") {
    digitalWrite(MOTOR_LEFT_1, HIGH);
    digitalWrite(MOTOR_LEFT_2, LOW);
    digitalWrite(MOTOR_RIGHT_1, HIGH);
    digitalWrite(MOTOR_RIGHT_2, LOW);
    ledcWrite(0, 200); // Left motor PWM
    ledcWrite(1, 200); // Right motor PWM
    
  } else if (direction == "backward") {
    digitalWrite(MOTOR_LEFT_1, LOW);
    digitalWrite(MOTOR_LEFT_2, HIGH);
    digitalWrite(MOTOR_RIGHT_1, LOW);
    digitalWrite(MOTOR_RIGHT_2, HIGH);
    ledcWrite(0, 200);
    ledcWrite(1, 200);
    
  } else if (direction == "left") {
    digitalWrite(MOTOR_LEFT_1, LOW);
    digitalWrite(MOTOR_LEFT_2, HIGH);
    digitalWrite(MOTOR_RIGHT_1, HIGH);
    digitalWrite(MOTOR_RIGHT_2, LOW);
    ledcWrite(0, 150);
    ledcWrite(1, 150);
    
  } else if (direction == "right") {
    digitalWrite(MOTOR_LEFT_1, HIGH);
    digitalWrite(MOTOR_LEFT_2, LOW);
    digitalWrite(MOTOR_RIGHT_1, LOW);
    digitalWrite(MOTOR_RIGHT_2, HIGH);
    ledcWrite(0, 150);
    ledcWrite(1, 150);
    
  } else {
    stopMotors();
  }
}

void stopMotors() {
  digitalWrite(MOTOR_LEFT_1, LOW);
  digitalWrite(MOTOR_LEFT_2, LOW);
  digitalWrite(MOTOR_RIGHT_1, LOW);
  digitalWrite(MOTOR_RIGHT_2, LOW);
  ledcWrite(0, 0);
  ledcWrite(1, 0);
  robot.direction = "stopped";
}

void patrol() {
  robot.expression = "thinking";
  displayEyes("thinking");
  robot.oledText = "Patrolling...";
  updateOLED();
  
  // Simple patrol pattern
  moveRobot("forward");
  delay(2000);
  
  float distance = readUltrasonic();
  if (distance < 20) {
    moveRobot("backward");
    delay(500);
    moveRobot("right");
    delay(1000);
  }
  
  moveRobot("right");
  delay(1500);
  moveRobot("forward");
  delay(2000);
  
  stopMotors();
  robot.expression = "happy";
  displayEyes("happy");
  robot.oledText = "Patrol done!";
  updateOLED();
}

void scan() {
  robot.expression = "thinking";
  displayEyes("thinking");
  robot.oledText = "Scanning...";
  updateOLED();
  
  // Rotate and scan
  moveRobot("right");
  delay(500);
  stopMotors();
  
  float distance = readUltrasonic();
  float smoke = readSmoke();
  
  robot.oledText = "D:" + String(distance, 1) + " S:" + String(smoke, 1);
  updateOLED();
  
  delay(2000);
  
  robot.expression = "neutral";
  displayEyes("neutral");
  robot.oledText = "Scan complete";
  updateOLED();
}

void sendCurrentStatus() {
  DynamicJsonDocument doc(512);
  doc["type"] = "status_update";
  doc["data"]["buzzer"] = robot.buzzer;
  doc["data"]["motors"]["direction"] = robot.direction;
  doc["data"]["oled"]["text"] = robot.oledText;
  doc["data"]["oled"]["expression"] = robot.expression;
  doc["data"]["sensors"]["ultrasonic"] = robot.ultrasonicEnabled;
  doc["data"]["sensors"]["smoke"] = robot.smokeEnabled;
  doc["data"]["thresholds"]["ultrasonicWarning"] = robot.ultrasonicWarning;
  doc["data"]["thresholds"]["ultrasonicDanger"] = robot.ultrasonicDanger;
  doc["data"]["thresholds"]["smokeSensitivity"] = robot.smokeSensitivity;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void setupRESTAPI() {
  // CORS headers
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Status endpoint
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
    DynamicJsonDocument doc(512);
    doc["distance"] = readUltrasonic();
    doc["smoke"] = readSmoke();
    doc["buzzer"] = robot.buzzer;
    doc["direction"] = robot.direction;
    doc["expression"] = robot.expression;
    doc["oled_text"] = robot.oledText;
    doc["timestamp"] = millis();
    
    String output;
    serializeJson(doc, output);
    request->send(200, "application/json", output);
  });
  
  // Sensor endpoint
  server.on("/sensor", HTTP_GET, [](AsyncWebServerRequest *request){
    DynamicJsonDocument doc(256);
    doc["ultrasonic"] = readUltrasonic();
    doc["smoke"] = readSmoke();
    doc["timestamp"] = millis();
    
    String output;
    serializeJson(doc, output);
    request->send(200, "application/json", output);
  });
  
  // Buzzer control
  server.on("/buzzer", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("state")) {
      String state = request->getParam("state")->value();
      robot.buzzer = (state == "on");
      digitalWrite(BUZZER_PIN, robot.buzzer ? HIGH : LOW);
      
      request->send(200, "text/plain", "Buzzer " + state);
    } else {
      request->send(400, "text/plain", "Missing state parameter");
    }
  });
  
  // OLED control
  server.on("/oled", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("text")) {
      robot.oledText = request->getParam("text")->value();
      updateOLED();
      request->send(200, "text/plain", "OLED updated");
    } else {
      request->send(400, "text/plain", "Missing text parameter");
    }
  });
  
  // Movement control
  server.on("/move", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("direction")) {
      String direction = request->getParam("direction")->value();
      moveRobot(direction);
      
      // Auto-stop after 2 seconds for safety
      if (direction != "stop") {
        delay(2000);
        stopMotors();
      }
      
      request->send(200, "text/plain", "Moving " + direction);
    } else {
      request->send(400, "text/plain", "Missing direction parameter");
    }
  });
}
