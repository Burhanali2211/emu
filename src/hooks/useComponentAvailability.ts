import { useState, useEffect, useCallback } from 'react';
import { ComponentStatus, SensorData } from '@/types/robot';

interface ComponentHealth {
  status: 'online' | 'offline' | 'degraded' | 'error';
  lastSeen: number;
  errorCount: number;
  responseTime: number;
  reliability: number; // 0-100%
}

interface ComponentAvailability {
  [key: string]: ComponentHealth;
}

interface AvailabilityConfig {
  timeoutThreshold: number; // ms
  maxErrorCount: number;
  reliabilityThreshold: number; // %
  checkInterval: number; // ms
}

export const useComponentAvailability = (
  isConnected: boolean,
  sensorData: SensorData | null,
  robotComponents: ComponentStatus,
  config: AvailabilityConfig = {
    timeoutThreshold: 5000,
    maxErrorCount: 3,
    reliabilityThreshold: 80,
    checkInterval: 1000
  }
) => {
  const [availability, setAvailability] = useState<ComponentAvailability>({});
  const [lastDataTimestamp, setLastDataTimestamp] = useState<number>(Date.now());

  // Initialize component availability
  useEffect(() => {
    const initialAvailability: ComponentAvailability = {};
    
    Object.keys(robotComponents).forEach(component => {
      initialAvailability[component] = {
        status: 'offline',
        lastSeen: 0,
        errorCount: 0,
        responseTime: 0,
        reliability: 100
      };
    });

    setAvailability(initialAvailability);
  }, [robotComponents]);

  // Update component health based on data reception
  const updateComponentHealth = useCallback((componentName: string, isWorking: boolean, responseTime: number = 0) => {
    setAvailability(prev => {
      const current = prev[componentName] || {
        status: 'offline',
        lastSeen: 0,
        errorCount: 0,
        responseTime: 0,
        reliability: 100
      };

      const now = Date.now();
      let newStatus: ComponentHealth['status'] = 'offline';
      let newErrorCount = current.errorCount;
      let newReliability = current.reliability;

      if (isWorking) {
        newStatus = 'online';
        newErrorCount = Math.max(0, current.errorCount - 1); // Reduce error count on success
        newReliability = Math.min(100, current.reliability + 1); // Improve reliability
      } else {
        newErrorCount = current.errorCount + 1;
        newReliability = Math.max(0, current.reliability - 5); // Decrease reliability
        
        if (newErrorCount >= config.maxErrorCount) {
          newStatus = 'error';
        } else if (newReliability < config.reliabilityThreshold) {
          newStatus = 'degraded';
        } else {
          newStatus = 'offline';
        }
      }

      return {
        ...prev,
        [componentName]: {
          status: newStatus,
          lastSeen: isWorking ? now : current.lastSeen,
          errorCount: newErrorCount,
          responseTime: responseTime,
          reliability: newReliability
        }
      };
    });
  }, [config.maxErrorCount, config.reliabilityThreshold]);

  // Check sensor data freshness and component functionality
  useEffect(() => {
    if (!isConnected || !sensorData) {
      // Mark all components as offline when disconnected
      setAvailability(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(component => {
          updated[component] = {
            ...updated[component],
            status: 'offline'
          };
        });
        return updated;
      });
      return;
    }

    const now = Date.now();
    const dataAge = now - (sensorData.timestamp || 0);

    // Update data timestamp
    if (sensorData.timestamp && sensorData.timestamp > lastDataTimestamp) {
      setLastDataTimestamp(sensorData.timestamp);
    }

    // Check individual sensor components
    const sensorChecks = [
      { name: 'ultrasonic', working: typeof sensorData.ultrasonic === 'number' && sensorData.ultrasonic >= 0 },
      { name: 'smoke', working: typeof sensorData.smoke === 'boolean' && typeof sensorData.smokeLevel === 'number' },
      { name: 'dht', working: typeof sensorData.temperature === 'number' && typeof sensorData.humidity === 'number' },
      { name: 'ldr', working: typeof sensorData.lightLevel === 'number' && sensorData.lightLevel >= 0 },
      { name: 'irReceiver', working: sensorData.irCommand !== undefined || true }, // IR is optional
    ];

    sensorChecks.forEach(({ name, working }) => {
      updateComponentHealth(name, working && dataAge < config.timeoutThreshold, dataAge);
    });

    // Check other components based on robot status
    Object.keys(robotComponents).forEach(component => {
      if (!sensorChecks.find(s => s.name === component)) {
        updateComponentHealth(component, robotComponents[component as keyof ComponentStatus], dataAge);
      }
    });

  }, [isConnected, sensorData, robotComponents, lastDataTimestamp, updateComponentHealth, config.timeoutThreshold]);

  // Periodic health check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setAvailability(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(component => {
          const timeSinceLastSeen = now - updated[component].lastSeen;
          
          // Mark as offline if no data received for too long
          if (timeSinceLastSeen > config.timeoutThreshold && updated[component].status === 'online') {
            updated[component] = {
              ...updated[component],
              status: 'offline'
            };
          }
        });
        
        return updated;
      });
    }, config.checkInterval);

    return () => clearInterval(interval);
  }, [config.timeoutThreshold, config.checkInterval]);

  // Helper functions
  const getComponentStatus = useCallback((componentName: string): ComponentHealth['status'] => {
    return availability[componentName]?.status || 'offline';
  }, [availability]);

  const getComponentReliability = useCallback((componentName: string): number => {
    return availability[componentName]?.reliability || 0;
  }, [availability]);

  const isComponentAvailable = useCallback((componentName: string): boolean => {
    const status = getComponentStatus(componentName);
    return status === 'online' || status === 'degraded';
  }, [getComponentStatus]);

  const getAvailableComponents = useCallback((): string[] => {
    return Object.keys(availability).filter(component => isComponentAvailable(component));
  }, [availability, isComponentAvailable]);

  const getOfflineComponents = useCallback((): string[] => {
    return Object.keys(availability).filter(component => !isComponentAvailable(component));
  }, [availability, isComponentAvailable]);

  const getSystemHealth = useCallback(): { overall: number; status: string } => {
    const components = Object.values(availability);
    if (components.length === 0) return { overall: 0, status: 'unknown' };

    const totalReliability = components.reduce((sum, comp) => sum + comp.reliability, 0);
    const overall = totalReliability / components.length;

    let status = 'excellent';
    if (overall < 50) status = 'critical';
    else if (overall < 70) status = 'poor';
    else if (overall < 85) status = 'good';

    return { overall, status };
  }, [availability]);

  const getComponentDiagnostics = useCallback((componentName: string) => {
    const component = availability[componentName];
    if (!component) return null;

    return {
      ...component,
      timeSinceLastSeen: Date.now() - component.lastSeen,
      isHealthy: component.status === 'online' && component.reliability > config.reliabilityThreshold,
      needsAttention: component.status === 'degraded' || component.errorCount > 0
    };
  }, [availability, config.reliabilityThreshold]);

  return {
    availability,
    getComponentStatus,
    getComponentReliability,
    isComponentAvailable,
    getAvailableComponents,
    getOfflineComponents,
    getSystemHealth,
    getComponentDiagnostics,
    updateComponentHealth
  };
};
