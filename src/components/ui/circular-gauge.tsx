import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number;
  max?: number;
  min?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  unit?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  max = 100,
  min = 0,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#1e293b',
  label,
  unit = '',
  showValue = true,
  animated = true,
  className = '',
}) => {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const center = size / 2;

  // Dynamic color based on value
  const getColor = () => {
    if (percentage >= 80) return '#ef4444'; // red
    if (percentage >= 60) return '#f59e0b'; // yellow
    if (percentage >= 40) return '#10b981'; // green
    return color;
  };

  const dynamicColor = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={dynamicColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? strokeDasharray : strokeDashoffset}
          animate={animated ? { strokeDashoffset } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 6px ${dynamicColor}40)`,
          }}
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={dynamicColor}
          strokeWidth={strokeWidth / 2}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? strokeDasharray : strokeDashoffset}
          animate={animated ? { strokeDashoffset } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="opacity-50"
          style={{
            filter: `blur(2px)`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showValue && (
          <motion.div
            initial={animated ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-white font-bold"
            style={{ fontSize: size * 0.15 }}
          >
            {Math.round(normalizedValue)}{unit}
          </motion.div>
        )}
        {label && (
          <motion.div
            initial={animated ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="text-slate-400 text-xs mt-1"
            style={{ fontSize: size * 0.08 }}
          >
            {label}
          </motion.div>
        )}
      </div>
      
      {/* Percentage indicator */}
      <div 
        className="absolute text-xs font-medium text-slate-300"
        style={{
          top: '10%',
          right: '10%',
          fontSize: size * 0.08,
        }}
      >
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

// Preset gauge variants
export const BatteryGauge: React.FC<Omit<CircularGaugeProps, 'color' | 'label' | 'unit'>> = (props) => (
  <CircularGauge
    {...props}
    label="Battery"
    unit="%"
    color="#10b981"
  />
);

export const TemperatureGauge: React.FC<Omit<CircularGaugeProps, 'color' | 'label' | 'unit' | 'max'>> = (props) => (
  <CircularGauge
    {...props}
    label="Temperature"
    unit="°C"
    max={60}
    color="#f59e0b"
  />
);

export const SignalGauge: React.FC<Omit<CircularGaugeProps, 'color' | 'label' | 'unit'>> = (props) => (
  <CircularGauge
    {...props}
    label="Signal"
    unit="%"
    color="#3b82f6"
  />
);
