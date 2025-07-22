import { useState, useEffect, useCallback } from 'react';
import { SensorData, SensorHistory } from '@/types/robot';

export const useSensorHistory = (sensorData: SensorData | null, maxPoints: number = 100) => {
  const [history, setHistory] = useState<SensorHistory>({
    ultrasonic: [],
    smoke: [],
    battery: [],
    temperature: [],
    humidity: [],
    lightLevel: [],
  });

  useEffect(() => {
    if (sensorData) {
      setHistory(prev => ({
        ultrasonic: [
          ...prev.ultrasonic.slice(-(maxPoints - 1)),
          { timestamp: sensorData.timestamp, value: sensorData.ultrasonic }
        ],
        smoke: [
          ...prev.smoke.slice(-(maxPoints - 1)),
          { 
            timestamp: sensorData.timestamp, 
            value: sensorData.smokeLevel,
            detected: sensorData.smoke
          }
        ],
        battery: [
          ...prev.battery.slice(-(maxPoints - 1)),
          { timestamp: sensorData.timestamp, value: sensorData.battery }
        ],
        temperature: sensorData.temperature !== undefined ? [
          ...prev.temperature.slice(-(maxPoints - 1)),
          { timestamp: sensorData.timestamp, value: sensorData.temperature }
        ] : prev.temperature,
        humidity: sensorData.humidity !== undefined ? [
          ...prev.humidity.slice(-(maxPoints - 1)),
          { timestamp: sensorData.timestamp, value: sensorData.humidity }
        ] : prev.humidity,
        lightLevel: sensorData.lightLevel !== undefined ? [
          ...prev.lightLevel.slice(-(maxPoints - 1)),
          { timestamp: sensorData.timestamp, value: sensorData.lightLevel }
        ] : prev.lightLevel,
      }));
    }
  }, [sensorData, maxPoints]);

  const clearHistory = useCallback(() => {
    setHistory({
      ultrasonic: [],
      smoke: [],
      battery: [],
      temperature: [],
      humidity: [],
      lightLevel: [],
    });
  }, []);

  return {
    history,
    clearHistory,
  };
};
