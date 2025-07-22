import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Bluetooth, Radio, Signal, Globe } from 'lucide-react';
import { HolographicCard } from './holographic-card';
import { Badge } from './badge';

interface NetworkStatusProps {
  isConnected: boolean;
  signalStrength?: number;
  networkType?: 'wifi' | 'bluetooth' | 'cellular' | 'ethernet';
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isConnected,
  signalStrength = 0,
  networkType = 'wifi',
  className = ''
}) => {
  const [latency, setLatency] = useState(0);
  const [dataRate, setDataRate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 50) + 10);
      setDataRate(Math.floor(Math.random() * 100) + 50);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNetworkIcon = () => {
    switch (networkType) {
      case 'wifi': return <Wifi className="w-5 h-5" />;
      case 'bluetooth': return <Bluetooth className="w-5 h-5" />;
      case 'cellular': return <Radio className="w-5 h-5" />;
      case 'ethernet': return <Globe className="w-5 h-5" />;
      default: return <Wifi className="w-5 h-5" />;
    }
  };

  const getSignalBars = () => {
    const bars = [];
    const strength = Math.floor((signalStrength / 100) * 4);
    
    for (let i = 0; i < 4; i++) {
      bars.push(
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            i < strength ? 'bg-green-400' : 'bg-slate-600'
          }`}
          style={{ height: `${(i + 1) * 4 + 4}px` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      );
    }
    return bars;
  };

  return (
    <HolographicCard variant="glow" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? getNetworkIcon() : <WifiOff className="w-5 h-5" />}
          </div>
          <span className="text-sm font-medium text-slate-200">
            {networkType.charAt(0).toUpperCase() + networkType.slice(1)}
          </span>
        </div>
        
        <Badge 
          variant={isConnected ? "default" : "destructive"}
          className="text-xs"
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {isConnected && (
        <div className="space-y-3">
          {/* Signal Strength */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Signal</span>
            <div className="flex items-center gap-1">
              <div className="flex items-end gap-0.5 h-5">
                {getSignalBars()}
              </div>
              <span className="text-xs text-green-400 ml-2">{signalStrength}%</span>
            </div>
          </div>

          {/* Latency */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Latency</span>
            <span className="text-xs text-blue-400">{latency}ms</span>
          </div>

          {/* Data Rate */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Data Rate</span>
            <span className="text-xs text-cyan-400">{dataRate} KB/s</span>
          </div>

          {/* Connection Quality Indicator */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Quality</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </HolographicCard>
  );
};

// Preset network status components
export const WiFiStatus: React.FC<Omit<NetworkStatusProps, 'networkType'>> = (props) => (
  <NetworkStatus {...props} networkType="wifi" />
);

export const BluetoothStatus: React.FC<Omit<NetworkStatusProps, 'networkType'>> = (props) => (
  <NetworkStatus {...props} networkType="bluetooth" />
);

export const CellularStatus: React.FC<Omit<NetworkStatusProps, 'networkType'>> = (props) => (
  <NetworkStatus {...props} networkType="cellular" />
);
