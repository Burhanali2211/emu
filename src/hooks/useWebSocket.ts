import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, SensorData, RobotStatus, CommandQueueItem } from '@/types/robot';

export const useWebSocket = (url: string, addLog: (log: string) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>({
    ultrasonic: 0,
    smoke: false,
    smokeLevel: 0,
    battery: 100,
    timestamp: Date.now(),
    temperature: 25,
    humidity: 50,
    lightLevel: 50,
  });
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    buzzer: false,
    motors: { left: 0, right: 0, direction: 'stopped' },
    oled: { text: 'Hello! I\'m EMU 🤖', expression: 'neutral' },
    components: {
      motors: true,
      buzzer: true,
      oled: true,
      ultrasonic: true,
      smoke: true,
      dht: true,
      ldr: true,
      irReceiver: true,
      neopixel: true,
    },
    neopixel: {
      color: '#0064ff',
      brightness: 50,
      mode: 'static',
    },
    thresholds: { ultrasonicWarning: 25, ultrasonicDanger: 10, smokeSensitivity: 50 },
    uptime: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [commandQueue, setCommandQueue] = useState<CommandQueueItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!url) {
      setError("WebSocket URL is not configured.");
      return;
    }
    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        addLog('🚀 WebSocket connected to EMU');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'sensor_data':
              setSensorData(message.data);
              break;
            case 'status_update':
              setRobotStatus(prev => ({ ...prev, ...message.data }));
              break;
            case 'command_ack':
              setCommandQueue(prev => prev.map(cmd => 
                cmd.id === message.data.commandId ? { ...cmd, status: 'acknowledged' } : cmd
              ));
              break;
            case 'log':
              addLog(`[ROBOT] ${message.data}`);
              break;
            case 'error':
              setError(message.data.message);
              addLog(`[ROBOT ERROR] ${message.data.message}`);
              if (message.data.commandId) {
                setCommandQueue(prev => prev.map(cmd => 
                  cmd.id === message.data.commandId ? { ...cmd, status: 'failed' } : cmd
                ));
              }
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          addLog('Error parsing message from robot.');
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        addLog('🔌 WebSocket disconnected from EMU');
        setCommandQueue(prev => prev.map(cmd => 
          cmd.status === 'sent' ? { ...cmd, status: 'failed' } : cmd
        ));
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current.onerror = (err) => {
        setError('Connection lost to EMU robot. Check URL and robot status.');
        console.error('WebSocket error:', err);
      };
    } catch (err) {
      setError('Failed to connect to EMU robot. Invalid URL?');
    }
  }, [url, addLog]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    const commandId = message.id || Date.now().toString();
    const messageWithId = { ...message, id: commandId };

    const queueItem: CommandQueueItem = {
      id: commandId,
      command: messageWithId,
      status: 'pending',
      timestamp: Date.now(),
      retries: 0
    };
    setCommandQueue(prev => [...prev.slice(-19), queueItem]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageWithId));
      setCommandQueue(prev => prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, status: 'sent' } : cmd
      ));
    } else {
      setError('EMU robot not connected');
      setCommandQueue(prev => prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, status: 'failed' } : cmd
      ));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, sensorData, robotStatus, error, commandQueue, sendMessage };
};
