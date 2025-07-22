import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HolographicCard } from '@/components/ui/holographic-card';
import { CircularGauge, BatteryGauge, TemperatureGauge } from '@/components/ui/circular-gauge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot, Cpu, AlertTriangle, Clock, Battery, Thermometer, Radar, Sun, Droplets, Zap,
  Wifi, HardDrive, MemoryStick, Activity, Shield, Navigation, MapPin, Target,
  Play, Pause, Square, RotateCcw, Home, Eye, Mic, Speaker, Settings,
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, AlertCircle,
  Radio, Signal, Bluetooth, Camera, Gamepad2, Compass, Route
} from 'lucide-react';
import { NetworkStatus } from '@/components/ui/network-status';
import { SensorChart, BatteryChart, TemperatureChart, DistanceChart } from '@/components/ui/sensor-chart';
import { AIChat } from '@/components/AIChat';
import { CommandQueueItem } from '@/types/robot';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Enhanced Stat Card with animations and better visuals
const StatCard = ({
  icon,
  title,
  value,
  colorClass = 'text-blue-400',
  trend,
  subtitle,
  variant = 'default'
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  colorClass?: string;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  variant?: 'default' | 'glow' | 'neon';
}) => (
  <HolographicCard variant={variant} className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
      <div className={`${colorClass} relative`}>
        {icon}
        {trend && (
          <div className="absolute -top-1 -right-1">
            {trend === 'up' && <TrendingUp size={12} className="text-green-400" />}
            {trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
            {trend === 'stable' && <Minus size={12} className="text-yellow-400" />}
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <motion.div
        className="text-2xl font-bold"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}
    </CardContent>
  </HolographicCard>
);

// System Health Monitor Component
const SystemHealthMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    network: 89,
    storage: 34
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        storage: Math.floor(Math.random() * 100)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HolographicCard variant="glow" className="p-6">
      <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        System Health
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">CPU</span>
            <span className="text-blue-400">{systemStats.cpu}%</span>
          </div>
          <Progress value={systemStats.cpu} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Memory</span>
            <span className="text-green-400">{systemStats.memory}%</span>
          </div>
          <Progress value={systemStats.memory} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Network</span>
            <span className="text-cyan-400">{systemStats.network}%</span>
          </div>
          <Progress value={systemStats.network} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Storage</span>
            <span className="text-purple-400">{systemStats.storage}%</span>
          </div>
          <Progress value={systemStats.storage} className="h-2" />
        </div>
      </div>
    </HolographicCard>
  );
};

// Enhanced Quick Actions with more features
const QuickActionCard = ({ onRun }: { onRun: (action: any) => void }) => {
  const [isEmergency, setIsEmergency] = useState(false);

  const quickActions = [
    { icon: <Route className="w-4 h-4" />, label: 'Patrol Area', action: { action: 'patrol', duration: 15000 }, color: 'blue' },
    { icon: <Radar className="w-4 h-4" />, label: 'Scan Environment', action: { action: 'scan', type: 'environment' }, color: 'cyan' },
    { icon: <Home className="w-4 h-4" />, label: 'Return Home', action: { action: 'move', direction: 'home' }, color: 'green' },
    { icon: <Eye className="w-4 h-4" />, label: 'Look Around', action: { action: 'expression', expression: 'surprised' }, color: 'purple' },
    { icon: <Mic className="w-4 h-4" />, label: 'Listen Mode', action: { action: 'expression', expression: 'listening' }, color: 'yellow' },
    { icon: <Speaker className="w-4 h-4" />, label: 'Announce', action: { action: 'buzzer', state: true, duration: 1000 }, color: 'orange' },
  ];

  return (
    <HolographicCard variant="neon" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Quick Actions
        </h3>
        <Button
          variant={isEmergency ? "destructive" : "outline"}
          size="sm"
          onClick={() => {
            setIsEmergency(!isEmergency);
            onRun({ action: 'move', direction: 'stop' });
          }}
          className="text-xs"
        >
          <Square className="w-3 h-3 mr-1" />
          {isEmergency ? 'STOPPED' : 'E-STOP'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            onClick={() => onRun(action.action)}
            className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 text-xs
              ${action.color === 'blue' ? 'bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/40' : ''}
              ${action.color === 'cyan' ? 'bg-cyan-600/20 border-cyan-500/30 hover:bg-cyan-600/40' : ''}
              ${action.color === 'green' ? 'bg-green-600/20 border-green-500/30 hover:bg-green-600/40' : ''}
              ${action.color === 'purple' ? 'bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/40' : ''}
              ${action.color === 'yellow' ? 'bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/40' : ''}
              ${action.color === 'orange' ? 'bg-orange-600/20 border-orange-500/30 hover:bg-orange-600/40' : ''}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isEmergency}
          >
            {action.icon}
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </HolographicCard>
  );
};

// Robot Status Visualization Component
const RobotStatusDisplay = ({ robotStatus, sensorData }: { robotStatus: any, sensorData: any }) => {
  const getStatusColor = (status: boolean) => status ? 'text-green-400' : 'text-red-400';
  const getStatusIcon = (status: boolean) => status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;

  return (
    <HolographicCard variant="pulse" className="p-6">
      <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" />
        Robot Status
      </h3>

      <div className="space-y-4">
        {/* Component Status Grid */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(robotStatus.components).map(([component, status]) => (
            <div key={component} className="flex items-center gap-2 text-xs">
              <div className={getStatusColor(status as boolean)}>
                {getStatusIcon(status as boolean)}
              </div>
              <span className="capitalize text-slate-300">{component}</span>
            </div>
          ))}
        </div>

        {/* Movement Status */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Movement</span>
            <Badge variant="outline" className="text-xs">
              {robotStatus.motors.direction.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Left Motor:</span>
              <span className="text-blue-400">{robotStatus.motors.left}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Right Motor:</span>
              <span className="text-blue-400">{robotStatus.motors.right}%</span>
            </div>
          </div>
        </div>

        {/* NeoPixel Status */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">LED Status</span>
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: robotStatus.neopixel.color }}
            />
          </div>
          <div className="text-xs text-slate-400">
            Mode: {robotStatus.neopixel.mode} | Brightness: {robotStatus.neopixel.brightness}%
          </div>
        </div>
      </div>
    </HolographicCard>
  );
};

// Enhanced Command Queue with better visualization
const CommandQueueList = ({ queue }: { queue: CommandQueueItem[] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acknowledged': return 'text-green-400';
      case 'sent': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged': return <CheckCircle className="w-3 h-3" />;
      case 'sent': return <Activity className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <HolographicCard variant="glow" className="p-6">
      <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Command Queue
        <Badge variant="outline" className="ml-auto text-xs">
          {queue.length} items
        </Badge>
      </h3>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {queue.length > 0 ? queue.slice(-8).reverse().map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <div className={getStatusColor(c.status)}>
                  {getStatusIcon(c.status)}
                </div>
                <span className="text-sm text-slate-300">
                  {c.command.data.action || 'command'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs capitalize ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(c.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Queue is empty</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HolographicCard>
  );
};

// Live Activity Feed Component
const LiveActivityFeed = ({ commandLogs }: { commandLogs: string[] }) => {
  return (
    <HolographicCard variant="neon" className="p-6">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
        <Radio className="w-5 h-5" />
        Live Activity
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {commandLogs.slice(-10).reverse().map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xs text-slate-300 p-2 rounded bg-slate-800/30 border-l-2 border-cyan-400/50"
            >
              <span className="text-cyan-400 mr-2">
                {new Date().toLocaleTimeString()}
              </span>
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </HolographicCard>
  );
};

// Enhanced Mission Control Component
const MissionControl = ({ onRun }: { onRun: (action: any) => void }) => {
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [missionProgress, setMissionProgress] = useState(0);

  const missions = [
    {
      id: 'patrol',
      name: 'Security Patrol',
      description: 'Patrol designated areas and report anomalies',
      icon: <Shield className="w-4 h-4" />,
      duration: '15 min',
      priority: 'high'
    },
    {
      id: 'explore',
      name: 'Area Mapping',
      description: 'Map unknown territory and create navigation data',
      icon: <MapPin className="w-4 h-4" />,
      duration: '30 min',
      priority: 'medium'
    },
    {
      id: 'monitor',
      name: 'Environmental Monitor',
      description: 'Monitor air quality, temperature, and humidity',
      icon: <Thermometer className="w-4 h-4" />,
      duration: '60 min',
      priority: 'low'
    },
    {
      id: 'guard',
      name: 'Guard Mode',
      description: 'Stay alert for intruders and unusual activity',
      icon: <Eye className="w-4 h-4" />,
      duration: 'Continuous',
      priority: 'high'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const startMission = (missionId: string) => {
    setActiveMission(missionId);
    setMissionProgress(0);
    onRun({ action: 'mission', type: missionId });

    // Simulate mission progress
    const interval = setInterval(() => {
      setMissionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveMission(null);
          return 0;
        }
        return prev + 10;
      });
    }, 1000);
  };

  return (
    <HolographicCard variant="pulse" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Mission Control
        </h3>
        {activeMission && (
          <Badge variant="outline" className="text-xs animate-pulse">
            Active: {missions.find(m => m.id === activeMission)?.name}
          </Badge>
        )}
      </div>

      {activeMission && (
        <div className="mb-4 p-3 bg-purple-600/20 border border-purple-400/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Mission Progress</span>
            <span className="text-sm text-purple-400">{missionProgress}%</span>
          </div>
          <Progress value={missionProgress} className="h-2" />
        </div>
      )}

      <div className="space-y-3">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedMission === mission.id
                ? 'bg-purple-600/30 border-purple-400/50'
                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/30'
            } ${activeMission === mission.id ? 'ring-2 ring-purple-400/50' : ''}`}
            onClick={() => setSelectedMission(mission.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="text-purple-400">{mission.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-medium text-slate-200">{mission.name}</div>
                  <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(mission.priority)}`}>
                    {mission.priority}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mb-1">{mission.description}</div>
                <div className="text-xs text-slate-500">Duration: {mission.duration}</div>
              </div>
              {selectedMission === mission.id && !activeMission && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    startMission(mission.id);
                  }}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              {activeMission === mission.id && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMission(null);
                    setMissionProgress(0);
                  }}
                  className="text-xs"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Mission Actions */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRun({ action: 'return_home' })}
            className="text-xs"
          >
            <Home className="w-3 h-3 mr-1" />
            Return Home
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRun({ action: 'emergency_stop' })}
            className="text-xs"
          >
            <Square className="w-3 h-3 mr-1" />
            Emergency Stop
          </Button>
        </div>
      </div>
    </HolographicCard>
  );
};

const DashboardPage = () => {
  const { isConnected, robotStatus, sensorData, commandQueue, sendMessage, addLog, commandLogs, sensorHistory } = useRobot();

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const handleQuickAction = (action: any) => {
    sendMessage({ type: 'command', data: action });
    addLog(`Quick Action: ${action.action}`);
  };

  const getBatteryTrend = () => {
    if ((sensorData?.battery ?? 0) > 80) return 'up';
    if ((sensorData?.battery ?? 0) < 20) return 'down';
    return 'stable';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <motion.h1
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          EMU Robot Dashboard
        </motion.h1>
        <motion.p
          className="text-slate-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Advanced robotic control and monitoring system
        </motion.p>
      </div>

      {/* Critical Alert */}
      <AnimatePresence>
        {sensorData?.smoke && robotStatus.components.smoke && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 bg-red-500/20 border border-red-500/50 p-4 rounded-lg flex items-center gap-4 animate-pulse"
          >
            <AlertTriangle className="text-red-400" size={32} />
            <div>
              <h3 className="font-bold text-red-300">SMOKE DETECTED</h3>
              <p className="text-sm text-red-400">Immediate attention required. Air quality is hazardous.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Stats and Controls */}
        <div className="xl:col-span-2 space-y-6">
          {/* Primary Status Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              icon={<Zap size={24} />}
              title="Connection"
              value={isConnected ? 'Online' : 'Offline'}
              colorClass={isConnected ? 'text-green-400' : 'text-red-400'}
              variant="glow"
              trend={isConnected ? 'up' : 'down'}
              subtitle={isConnected ? 'Connected' : 'Disconnected'}
            />
            <StatCard
              icon={<Clock size={24} />}
              title="Uptime"
              value={formatUptime(robotStatus.uptime)}
              variant="neon"
              trend="up"
              subtitle="System runtime"
            />
            <StatCard
              icon={<Battery size={24} />}
              title="Battery"
              value={`${sensorData?.battery ?? 0}%`}
              colorClass={(sensorData?.battery ?? 0) < 20 ? 'text-red-400' : 'text-green-400'}
              variant="pulse"
              trend={getBatteryTrend()}
              subtitle={`${(sensorData?.battery ?? 0) < 20 ? 'Low' : 'Good'} level`}
            />
            <StatCard
              icon={<Bot size={24} />}
              title="Mode"
              value="AI Assisted"
              variant="glow"
              trend="stable"
              subtitle="Autonomous mode"
            />
          </motion.div>

          {/* Sensor Gauges */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HolographicCard variant="glow" className="p-6 flex flex-col items-center">
              <BatteryGauge
                value={sensorData?.battery ?? 0}
                size={120}
                animated={true}
              />
            </HolographicCard>

            {robotStatus.components.dht && (
              <HolographicCard variant="neon" className="p-6 flex flex-col items-center">
                <TemperatureGauge
                  value={sensorData?.temperature ?? 0}
                  size={120}
                  animated={true}
                />
              </HolographicCard>
            )}

            {robotStatus.components.ultrasonic && (
              <HolographicCard variant="pulse" className="p-6 flex flex-col items-center">
                <CircularGauge
                  value={sensorData?.ultrasonic ?? 0}
                  max={200}
                  size={120}
                  color="#8b5cf6"
                  label="Distance"
                  unit="cm"
                  animated={true}
                />
              </HolographicCard>
            )}
          </motion.div>

          {/* Additional Sensor Data */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {robotStatus.components.smoke && (
              <StatCard
                icon={<AlertTriangle size={20} />}
                title="Air Quality"
                value={sensorData?.smoke ? 'Alert' : 'Good'}
                colorClass={sensorData?.smoke ? 'text-red-400' : 'text-green-400'}
                trend={sensorData?.smoke ? 'down' : 'up'}
              />
            )}
            {robotStatus.components.dht && (
              <StatCard
                icon={<Droplets size={20} />}
                title="Humidity"
                value={`${sensorData?.humidity?.toFixed(1) ?? 0}%`}
                trend="stable"
              />
            )}
            {robotStatus.components.ldr && (
              <StatCard
                icon={<Sun size={20} />}
                title="Light Level"
                value={`${sensorData?.lightLevel ?? 0}`}
                trend="stable"
              />
            )}
            <StatCard
              icon={<Signal size={20} />}
              title="Signal"
              value="Strong"
              colorClass="text-green-400"
              trend="up"
            />
          </motion.div>

          {/* System Health Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SystemHealthMonitor />
          </motion.div>

          {/* Sensor Charts */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {sensorHistory?.battery && (
              <BatteryChart
                data={sensorHistory.battery}
                type="area"
                height={180}
              />
            )}
            {sensorHistory?.temperature && robotStatus.components.dht && (
              <TemperatureChart
                data={sensorHistory.temperature}
                type="line"
                height={180}
              />
            )}
            {sensorHistory?.ultrasonic && robotStatus.components.ultrasonic && (
              <DistanceChart
                data={sensorHistory.ultrasonic}
                type="area"
                height={180}
              />
            )}
            {sensorHistory?.humidity && robotStatus.components.dht && (
              <SensorChart
                data={sensorHistory.humidity}
                title="Humidity"
                unit="%"
                color="#06b6d4"
                type="line"
                height={180}
              />
            )}
          </motion.div>

          {/* Network Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <NetworkStatus
              isConnected={isConnected}
              signalStrength={85}
              networkType="wifi"
            />
          </motion.div>
        </div>

        {/* Middle Column - Controls and Status */}
        <div className="space-y-6">
          {/* Robot Status Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RobotStatusDisplay robotStatus={robotStatus} sensorData={sensorData} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActionCard onRun={handleQuickAction} />
          </motion.div>

          {/* Mission Control */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MissionControl onRun={handleQuickAction} />
          </motion.div>
        </div>

        {/* Right Column - Activity and AI */}
        <div className="space-y-6">
          {/* Command Queue */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CommandQueueList queue={commandQueue} />
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <LiveActivityFeed commandLogs={commandLogs} />
          </motion.div>

          {/* AI Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AIChat />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
