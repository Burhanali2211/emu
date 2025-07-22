import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { useSensorHistory } from '@/hooks/useSensorHistory';
import { useGemini } from '@/hooks/useGemini';
import { toast } from "sonner";
import { RobotStatus, SensorData, CommandQueueItem, WebSocketMessage, Routine, GeminiResponse, ComponentStatus } from '@/types/robot';

interface RobotContextType {
  // Config
  config: { websocketUrl: string; geminiApiKey: string; };
  setConfig: React.Dispatch<React.SetStateAction<{ websocketUrl: string; geminiApiKey: string; }>>;
  saveConfig: () => void;
  // WebSocket
  isConnected: boolean;
  sensorData: SensorData | null;
  robotStatus: RobotStatus;
  wsError: string | null;
  commandQueue: CommandQueueItem[];
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => void;
  // Voice Control
  voice: {
    isListening: boolean;
    isAwake: boolean;
    startListening: () => void;
    stopListening: () => void;
    isSupported: boolean;
    error: string | null;
  };
  voiceCommand: string | null;
  clearVoiceCommand: () => void;
  // Sensor History
  sensorHistory: ReturnType<typeof useSensorHistory>['history'];
  // Gemini
  gemini: {
    sendMessage: (prompt: string) => Promise<GeminiResponse | null>;
    isLoading: boolean;
    error: string | null;
  };
  // App State
  robotExpression: RobotStatus['oled']['expression'];
  setRobotExpression: React.Dispatch<React.SetStateAction<RobotStatus['oled']['expression']>>;
  commandLogs: string[];
  addLog: (log: string) => void;
  // Routines
  routines: Routine[];
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  runRoutine: (routine: Routine) => void;
  // Component Toggles
  toggleComponent: (component: keyof ComponentStatus, enabled: boolean) => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export const RobotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState({ websocketUrl: 'ws://192.168.1.100:81', geminiApiKey: 'AIzaSyDl38_S6oxFQooMmv0HDqpek1Uh8dbzk3o' });
  const [robotExpression, setRobotExpression] = useState<RobotContextType['robotExpression']>('neutral');
  const [commandLogs, setCommandLogs] = useState<string[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('robotDashboardConfig');
    if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Ensure the hardcoded key is used if the saved one is empty or different
        if (!parsedConfig.geminiApiKey || parsedConfig.geminiApiKey !== 'AIzaSyDl38_S6oxFQooMmv0HDqpek1Uh8dbzk3o') {
            parsedConfig.geminiApiKey = 'AIzaSyDl38_S6oxFQooMmv0HDqpek1Uh8dbzk3o';
        }
        setConfig(parsedConfig);
    }
    const savedRoutines = localStorage.getItem('robotRoutines');
    if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
  }, []);

  const saveConfig = () => {
    localStorage.setItem('robotDashboardConfig', JSON.stringify(config));
    toast.success("Configuration saved!", { description: "You may need to reconnect for changes to apply." });
    addLog('Configuration updated');
  };

  const addLog = useCallback((log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCommandLogs(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 100));
  }, []);

  const { isConnected, sensorData, robotStatus, error: wsError, commandQueue, sendMessage: wsSendMessage } = useWebSocket(config.websocketUrl, addLog);
  const { history: sensorHistory } = useSensorHistory(sensorData);
  
  const sendMessage = useCallback((messageData: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
    const message = {
        ...messageData,
        timestamp: Date.now(),
        id: Date.now().toString()
    };
    wsSendMessage(message);
  }, [wsSendMessage]);

  const onWakeWord = useCallback(() => {
    setRobotExpression('listening');
    sendMessage({ type: 'command', data: { action: 'buzzer', state: true, duration: 150 } });
    toast("EMU is listening...", { icon: '🎤' });
  }, [sendMessage]);

  const onCommand = useCallback((command: string) => {
    addLog(`Voice command received: "${command}"`);
    setVoiceCommand(command);
  }, [addLog]);

  const clearVoiceCommand = () => setVoiceCommand(null);

  const onSleep = useCallback(() => {
    if (robotExpression === 'listening') {
      setRobotExpression('neutral');
    }
  }, [robotExpression]);

  const voice = useVoiceControl({ wakeWord: 'hey emu', onWakeWord, onCommand, onSleep });
  
  const geminiHook = useGemini(config.geminiApiKey);
  const geminiSendMessage = (prompt: string) => geminiHook.sendMessage(prompt, { sensorData, robotStatus });
  const gemini = { ...geminiHook, sendMessage: geminiSendMessage };
  
  useEffect(() => {
    if (sensorData) {
      if (sensorData.smoke) setRobotExpression('angry');
      else if (sensorData.ultrasonic < (robotStatus.thresholds.ultrasonicDanger || 10)) setRobotExpression('surprised');
    }
  }, [sensorData, robotStatus.thresholds.ultrasonicDanger]);
  
  const toggleComponent = (component: keyof ComponentStatus, enabled: boolean) => {
    sendMessage({
      type: 'command',
      data: {
        action: 'toggle_component',
        component,
        enabled,
      },
    });
    addLog(`${enabled ? 'Enabled' : 'Disabled'} ${component}`);
  };

  const saveRoutine = (routine: Routine) => {
    setRoutines(prev => {
      const existing = prev.findIndex(r => r.id === routine.id);
      const newRoutines = [...prev];
      if (existing > -1) newRoutines[existing] = routine;
      else newRoutines.push(routine);
      localStorage.setItem('robotRoutines', JSON.stringify(newRoutines));
      toast.success(`Routine "${routine.name}" saved!`);
      return newRoutines;
    });
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => {
      const newRoutines = prev.filter(r => r.id !== id);
      localStorage.setItem('robotRoutines', JSON.stringify(newRoutines));
      toast.info("Routine deleted.");
      return newRoutines;
    });
  };

  const runRoutine = (routine: Routine) => {
    addLog(`Running routine: ${routine.name}`);
    toast.info(`Running routine: ${routine.name}`);
    let delay = 0;
    routine.steps.forEach((step, index) => {
      setTimeout(() => {
        addLog(`Routine step ${index + 1}: ${step.action}`);
        sendMessage({ type: 'command', data: step });
      }, delay);
      delay += (step.duration || 1000) + 200;
    });
  };

  const value = {
    config, setConfig, saveConfig,
    isConnected, sensorData, robotStatus, wsError, commandQueue, sendMessage,
    voice, voiceCommand, clearVoiceCommand,
    sensorHistory,
    gemini,
    robotExpression, setRobotExpression,
    commandLogs, addLog,
    routines, saveRoutine, deleteRoutine, runRoutine,
    toggleComponent
  };

  return <RobotContext.Provider value={value}>{children}</RobotContext.Provider>;
};

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (context === undefined) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};
