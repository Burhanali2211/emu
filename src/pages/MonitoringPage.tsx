import { useState, useEffect } from 'react';
import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Wifi, 
  Battery,
  Shield,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  component: string;
  resolved: boolean;
}

const MonitoringPage = () => {
  const { robotStatus, sensorData, isConnected } = useRobot();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High CPU temperature detected',
      timestamp: new Date(Date.now() - 300000),
      component: 'ESP32',
      resolved: false,
    },
    {
      id: '2',
      type: 'info',
      message: 'System maintenance completed',
      timestamp: new Date(Date.now() - 600000),
      component: 'System',
      resolved: true,
    },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { time: '10:00', cpu: 45, memory: 62, network: 78 },
    { time: '10:05', cpu: 52, memory: 58, network: 82 },
    { time: '10:10', cpu: 48, memory: 65, network: 75 },
    { time: '10:15', cpu: 55, memory: 61, network: 88 },
    { time: '10:20', cpu: 42, memory: 59, network: 79 },
    { time: '10:25', cpu: 38, memory: 63, network: 85 },
  ]);

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'good',
      trend: 'stable',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      name: 'Memory',
      value: 62,
      unit: '%',
      status: 'warning',
      trend: 'up',
      icon: <HardDrive className="w-5 h-5" />,
    },
    {
      name: 'Temperature',
      value: sensorData?.temperature || 28,
      unit: '°C',
      status: (sensorData?.temperature || 28) > 35 ? 'warning' : 'good',
      trend: 'stable',
      icon: <Thermometer className="w-5 h-5" />,
    },
    {
      name: 'Network',
      value: 85,
      unit: '%',
      status: 'good',
      trend: 'up',
      icon: <Wifi className="w-5 h-5" />,
    },
    {
      name: 'Battery',
      value: sensorData?.battery || 0,
      unit: '%',
      status: (sensorData?.battery || 0) < 20 ? 'critical' : (sensorData?.battery || 0) < 50 ? 'warning' : 'good',
      trend: 'down',
      icon: <Battery className="w-5 h-5" />,
    },
    {
      name: 'Uptime',
      value: Math.floor(robotStatus.uptime / 3600),
      unit: 'hrs',
      status: 'good',
      trend: 'up',
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 border-green-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      case 'critical': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const systemHealth = systemMetrics.filter(metric => metric.status === 'critical').length === 0 ? 
    systemMetrics.filter(metric => metric.status === 'warning').length === 0 ? 'excellent' : 'good' : 'poor';

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Health</p>
                <p className={`text-2xl font-bold ${
                  systemHealth === 'excellent' ? 'text-green-400' :
                  systemHealth === 'good' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
                </p>
              </div>
              <Shield className={`w-8 h-8 ${
                systemHealth === 'excellent' ? 'text-green-400' :
                systemHealth === 'good' ? 'text-yellow-400' : 'text-red-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connection</p>
                <p className={`text-2xl font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
              <Wifi className={`w-8 h-8 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Alerts</p>
                <p className={`text-2xl font-bold ${
                  activeAlerts.length === 0 ? 'text-green-400' : 
                  activeAlerts.length < 3 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {activeAlerts.length}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${
                activeAlerts.length === 0 ? 'text-green-400' : 
                activeAlerts.length < 3 ? 'text-yellow-400' : 'text-red-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round((systemMetrics.reduce((acc, metric) => acc + (100 - metric.value), 0) / systemMetrics.length))}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="font-medium text-slate-200">{metric.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      {metric.value}{metric.unit}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.trend === 'up' ? 'text-red-400' :
                      metric.trend === 'down' ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      {metric.trend}
                    </div>
                  </div>
                  
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'critical' ? '[&>div]:bg-red-500' :
                      metric.status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #3b82f6',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="memory" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="network" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts at this time. System is running smoothly.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    alert.resolved 
                      ? 'bg-slate-800/30 border-slate-700/50 opacity-60' 
                      : alert.type === 'error' 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : alert.type === 'warning'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className={`font-medium ${alert.resolved ? 'text-slate-400' : 'text-slate-200'}`}>
                        {alert.message}
                      </p>
                      <p className="text-sm text-slate-500">
                        {alert.component} • {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringPage;
