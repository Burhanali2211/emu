import { useState, useEffect, useCallback } from 'react';
import { SensorData, RobotStatus, ComponentStatus } from '@/types/robot';

interface SimulationConfig {
  enabled: boolean;
  updateInterval: number;
  realisticVariation: boolean;
  componentFailureChance: number;
}

interface SystemStats {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  temperature: number;
  uptime: number;
}

export const useDataSimulation = (isConnected: boolean, config: SimulationConfig = {
  enabled: true,
  updateInterval: 1000,
  realisticVariation: true,
  componentFailureChance: 0.02
}) => {
  const [simulatedSensorData, setSimulatedSensorData] = useState<SensorData>({
    ultrasonic: 50,
    smoke: false,
    smokeLevel: 0,
    battery: 85,
    timestamp: Date.now(),
    temperature: 24.5,
    humidity: 45,
    lightLevel: 300,
    irCommand: undefined
  });

  const [simulatedRobotStatus, setSimulatedRobotStatus] = useState<RobotStatus>({
    buzzer: false,
    motors: { left: 0, right: 0, direction: 'stopped' },
    oled: { text: 'EMU Robot Online 🤖', expression: 'neutral' },
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
      color: '#00ff64',
      brightness: 75,
      mode: 'static',
    },
    thresholds: { 
      ultrasonicWarning: 25, 
      ultrasonicDanger: 10, 
      smokeSensitivity: 50 
    },
    uptime: 0,
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 45,
    memory: 62,
    network: 89,
    storage: 34,
    temperature: 42,
    uptime: 0
  });

  const [missionStatus, setMissionStatus] = useState<{
    active: boolean;
    type: string | null;
    progress: number;
    eta: number;
  }>({
    active: false,
    type: null,
    progress: 0,
    eta: 0
  });

  // Realistic sensor value generators
  const generateRealisticValue = useCallback((
    currentValue: number, 
    min: number, 
    max: number, 
    volatility: number = 0.1
  ) => {
    if (!config.realisticVariation) return currentValue;
    
    const change = (Math.random() - 0.5) * volatility * (max - min);
    const newValue = currentValue + change;
    return Math.max(min, Math.min(max, newValue));
  }, [config.realisticVariation]);

  // Simulate component failures
  const simulateComponentFailure = useCallback((components: ComponentStatus): ComponentStatus => {
    if (!config.realisticVariation) return components;
    
    const newComponents = { ...components };
    Object.keys(newComponents).forEach(key => {
      if (Math.random() < config.componentFailureChance) {
        newComponents[key as keyof ComponentStatus] = !newComponents[key as keyof ComponentStatus];
      }
    });
    return newComponents;
  }, [config.realisticVariation, config.componentFailureChance]);

  // Simulate realistic battery drain
  const simulateBatteryDrain = useCallback((currentBattery: number, isActive: boolean) => {
    const drainRate = isActive ? 0.05 : 0.01; // Faster drain when active
    const newBattery = Math.max(0, currentBattery - drainRate);
    
    // Simulate charging when battery is very low
    if (newBattery < 10 && Math.random() < 0.1) {
      return Math.min(100, newBattery + 2);
    }
    
    return newBattery;
  }, []);

  // Simulate environmental changes
  const simulateEnvironmentalChanges = useCallback(() => {
    const timeOfDay = new Date().getHours();
    const isNight = timeOfDay < 6 || timeOfDay > 20;
    
    return {
      baseTemperature: isNight ? 20 : 25,
      baseLightLevel: isNight ? 50 : 400,
      baseHumidity: isNight ? 60 : 40
    };
  }, []);

  // Main simulation update loop
  useEffect(() => {
    if (!config.enabled || isConnected) return;

    const interval = setInterval(() => {
      const env = simulateEnvironmentalChanges();
      
      setSimulatedSensorData(prev => ({
        ...prev,
        ultrasonic: generateRealisticValue(prev.ultrasonic, 5, 200, 0.2),
        battery: simulateBatteryDrain(prev.battery, missionStatus.active),
        temperature: generateRealisticValue(prev.temperature || env.baseTemperature, 15, 35, 0.05),
        humidity: generateRealisticValue(prev.humidity || env.baseHumidity, 20, 80, 0.1),
        lightLevel: generateRealisticValue(prev.lightLevel || env.baseLightLevel, 0, 1000, 0.3),
        smokeLevel: generateRealisticValue(prev.smokeLevel, 0, 100, 0.15),
        smoke: prev.smokeLevel > 70,
        timestamp: Date.now()
      }));

      setSimulatedRobotStatus(prev => ({
        ...prev,
        components: simulateComponentFailure(prev.components),
        uptime: prev.uptime + 1,
        motors: missionStatus.active ? {
          left: Math.floor(Math.random() * 100),
          right: Math.floor(Math.random() * 100),
          direction: ['forward', 'backward', 'left', 'right'][Math.floor(Math.random() * 4)] as any
        } : { left: 0, right: 0, direction: 'stopped' },
        oled: {
          ...prev.oled,
          expression: missionStatus.active ? 
            ['thinking', 'excited', 'surprised'][Math.floor(Math.random() * 3)] as any :
            'neutral'
        }
      }));

      setSystemStats(prev => ({
        cpu: generateRealisticValue(prev.cpu, 10, 95, 0.2),
        memory: generateRealisticValue(prev.memory, 20, 90, 0.15),
        network: generateRealisticValue(prev.network, 60, 100, 0.1),
        storage: generateRealisticValue(prev.storage, 20, 80, 0.05),
        temperature: generateRealisticValue(prev.temperature, 35, 65, 0.1),
        uptime: prev.uptime + 1
      }));

      // Update mission progress
      if (missionStatus.active) {
        setMissionStatus(prev => ({
          ...prev,
          progress: Math.min(100, prev.progress + Math.random() * 5),
          eta: Math.max(0, prev.eta - 1)
        }));
      }
    }, config.updateInterval);

    return () => clearInterval(interval);
  }, [
    config.enabled, 
    config.updateInterval, 
    isConnected, 
    generateRealisticValue, 
    simulateComponentFailure, 
    simulateBatteryDrain, 
    simulateEnvironmentalChanges,
    missionStatus.active
  ]);

  // Mission control functions
  const startMission = useCallback((type: string, duration: number = 300) => {
    setMissionStatus({
      active: true,
      type,
      progress: 0,
      eta: duration
    });
  }, []);

  const stopMission = useCallback(() => {
    setMissionStatus({
      active: false,
      type: null,
      progress: 0,
      eta: 0
    });
  }, []);

  // Emergency simulation functions
  const triggerEmergency = useCallback((type: 'smoke' | 'low_battery' | 'obstacle') => {
    switch (type) {
      case 'smoke':
        setSimulatedSensorData(prev => ({ ...prev, smoke: true, smokeLevel: 85 }));
        break;
      case 'low_battery':
        setSimulatedSensorData(prev => ({ ...prev, battery: 5 }));
        break;
      case 'obstacle':
        setSimulatedSensorData(prev => ({ ...prev, ultrasonic: 3 }));
        break;
    }
  }, []);

  const clearEmergency = useCallback(() => {
    setSimulatedSensorData(prev => ({
      ...prev,
      smoke: false,
      smokeLevel: Math.random() * 30,
      ultrasonic: 50 + Math.random() * 100
    }));
  }, []);

  return {
    simulatedSensorData,
    simulatedRobotStatus,
    systemStats,
    missionStatus,
    startMission,
    stopMission,
    triggerEmergency,
    clearEmergency,
    isSimulating: config.enabled && !isConnected
  };
};
