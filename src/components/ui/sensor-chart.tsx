import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { HolographicCard } from './holographic-card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensorChartProps {
  data: Array<{ timestamp: number; value: number }>;
  title: string;
  unit?: string;
  color?: string;
  type?: 'line' | 'area';
  height?: number;
  showTrend?: boolean;
  maxDataPoints?: number;
  className?: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({
  data,
  title,
  unit = '',
  color = '#3b82f6',
  type = 'line',
  height = 200,
  showTrend = true,
  maxDataPoints = 50,
  className = ''
}) => {
  const chartData = useMemo(() => {
    const limitedData = data.slice(-maxDataPoints);
    return limitedData.map((point, index) => ({
      ...point,
      time: new Date(point.timestamp).toLocaleTimeString(),
      index
    }));
  }, [data, maxDataPoints]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 'stable';
    const recent = chartData.slice(-5);
    const avg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
    const previous = chartData.slice(-10, -5);
    const prevAvg = previous.length > 0 
      ? previous.reduce((sum, point) => sum + point.value, 0) / previous.length 
      : avg;
    
    if (avg > prevAvg * 1.05) return 'up';
    if (avg < prevAvg * 0.95) return 'down';
    return 'stable';
  }, [chartData]);

  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 border border-slate-600 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-slate-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-blue-400 text-sm font-medium">
            {`${title}: ${payload[0].value.toFixed(2)}${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <HolographicCard variant="neon" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
          {showTrend && getTrendIcon()}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {currentValue.toFixed(1)}{unit}
          </Badge>
          {showTrend && (
            <span className={`text-xs ${getTrendColor()}`}>
              {trend.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="text-slate-400">Current</div>
            <div className="text-white font-medium">{currentValue.toFixed(1)}{unit}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Min</div>
            <div className="text-blue-400 font-medium">{minValue.toFixed(1)}{unit}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Max</div>
            <div className="text-red-400 font-medium">{maxValue.toFixed(1)}{unit}</div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#1e293b' }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#1e293b' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </HolographicCard>
  );
};

// Preset chart components for common sensors
export const BatteryChart: React.FC<Omit<SensorChartProps, 'title' | 'unit' | 'color'>> = (props) => (
  <SensorChart {...props} title="Battery Level" unit="%" color="#10b981" />
);

export const TemperatureChart: React.FC<Omit<SensorChartProps, 'title' | 'unit' | 'color'>> = (props) => (
  <SensorChart {...props} title="Temperature" unit="°C" color="#f59e0b" />
);

export const DistanceChart: React.FC<Omit<SensorChartProps, 'title' | 'unit' | 'color'>> = (props) => (
  <SensorChart {...props} title="Distance" unit="cm" color="#8b5cf6" />
);

export const HumidityChart: React.FC<Omit<SensorChartProps, 'title' | 'unit' | 'color'>> = (props) => (
  <SensorChart {...props} title="Humidity" unit="%" color="#06b6d4" />
);
