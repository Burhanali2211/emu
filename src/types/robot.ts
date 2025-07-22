export interface SensorData {
  ultrasonic: number;
  smoke: boolean;
  smokeLevel: number;
  battery: number;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  lightLevel?: number;
  irCommand?: string;
}

export interface ComponentStatus {
  motors: boolean;
  buzzer: boolean;
  oled: boolean;
  ultrasonic: boolean;
  smoke: boolean;
  dht: boolean;
  ldr: boolean;
  irReceiver: boolean;
  neopixel: boolean;
}

export interface RobotStatus {
  buzzer: boolean;
  motors: {
    left: number;
    right: number;
    direction: 'forward' | 'backward' | 'left' | 'right' | 'stopped';
  };
  oled: {
    text: string;
    expression: 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' | 'blink' | 'thinking' | 'excited' | 'listening';
  };
  components: ComponentStatus;
  neopixel: {
    color: string;
    brightness: number;
    mode: 'static' | 'rainbow' | 'off';
  };
  thresholds: {
    ultrasonicWarning: number;
    ultrasonicDanger: number;
    smokeSensitivity: number;
  };
  uptime: number;
}

export interface WebSocketMessage {
  type: 'sensor_data' | 'status_update' | 'command' | 'error' | 'command_ack' | 'log';
  data: any;
  timestamp: number;
  id?: string;
}

export interface GeminiResponse {
  responseText: string;
  oledText: string;
  emotion: 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' | 'thinking' | 'excited' | 'listening';
  action: {
    type: string;
    parameters: any;
  } | null;
}

export interface CommandQueueItem {
  id: string;
  command: WebSocketMessage;
  status: 'pending' | 'sent' | 'acknowledged' | 'failed';
  timestamp: number;
  retries: number;
}

export interface SensorHistory {
  ultrasonic: Array<{ timestamp: number; value: number }>;
  smoke: Array<{ timestamp: number; value: number; detected: boolean }>;
  battery: Array<{ timestamp: number; value: number }>;
  temperature: Array<{ timestamp: number; value: number }>;
  humidity: Array<{ timestamp: number; value: number }>;
  lightLevel: Array<{ timestamp: number; value: number }>;
}

export interface RoutineStep {
  action: 'move' | 'buzzer' | 'oled' | 'expression' | 'wait' | 'neopixel';
  direction?: 'forward' | 'backward' | 'left' | 'right' | 'stop';
  state?: boolean;
  text?: string;
  expression?: RobotStatus['oled']['expression'];
  duration?: number;
  color?: string;
  brightness?: number;
  mode?: 'static' | 'rainbow' | 'off';
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: RoutineStep[];
  trigger: {
    type: 'manual' | 'time' | 'event';
    value?: string;
  };
}
