import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Plus, 
  Settings, 
  Activity, 
  Battery, 
  Wifi, 
  MapPin, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Robot {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'maintenance' | 'mission';
  battery: number;
  location: { x: number; y: number };
  currentTask?: string;
  uptime: number;
  lastSeen: Date;
  performance: number;
  alerts: number;
}

const FleetPage = () => {
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [robots] = useState<Robot[]>([
    {
      id: 'emu-001',
      name: 'EMU Primary',
      model: 'ESP32-WROOM',
      status: 'mission',
      battery: 78,
      location: { x: 45, y: 60 },
      currentTask: 'Perimeter Patrol',
      uptime: 14520,
      lastSeen: new Date(),
      performance: 92,
      alerts: 1,
    },
    {
      id: 'emu-002',
      name: 'EMU Secondary',
      model: 'ESP32-WROOM',
      status: 'online',
      battery: 95,
      location: { x: 80, y: 30 },
      uptime: 8640,
      lastSeen: new Date(Date.now() - 300000),
      performance: 88,
      alerts: 0,
    },
    {
      id: 'emu-003',
      name: 'EMU Backup',
      model: 'ESP32-WROOM',
      status: 'maintenance',
      battery: 45,
      location: { x: 20, y: 85 },
      uptime: 0,
      lastSeen: new Date(Date.now() - 3600000),
      performance: 0,
      alerts: 3,
    },
  ]);

  const performanceData = [
    { time: '00:00', 'EMU Primary': 92, 'EMU Secondary': 88, 'EMU Backup': 0 },
    { time: '04:00', 'EMU Primary': 89, 'EMU Secondary': 91, 'EMU Backup': 0 },
    { time: '08:00', 'EMU Primary': 94, 'EMU Secondary': 87, 'EMU Backup': 0 },
    { time: '12:00', 'EMU Primary': 91, 'EMU Secondary': 89, 'EMU Backup': 0 },
    { time: '16:00', 'EMU Primary': 93, 'EMU Secondary': 92, 'EMU Backup': 0 },
    { time: '20:00', 'EMU Primary': 92, 'EMU Secondary': 88, 'EMU Backup': 0 },
  ];

  const taskDistribution = [
    { task: 'Patrol', count: 12, duration: 180 },
    { task: 'Inspection', count: 8, duration: 120 },
    { task: 'Monitoring', count: 15, duration: 90 },
    { task: 'Maintenance', count: 3, duration: 60 },
  ];

  const getStatusColor = (status: Robot['status']) => {
    switch (status) {
      case 'online': return 'text-green-400 border-green-400';
      case 'mission': return 'text-blue-400 border-blue-400';
      case 'maintenance': return 'text-yellow-400 border-yellow-400';
      case 'offline': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: Robot['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'mission': return <Target className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'offline': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
  };

  const onlineRobots = robots.filter(r => r.status === 'online' || r.status === 'mission').length;
  const averageBattery = Math.round(robots.reduce((acc, r) => acc + r.battery, 0) / robots.length);
  const totalAlerts = robots.reduce((acc, r) => acc + r.alerts, 0);
  const averagePerformance = Math.round(robots.reduce((acc, r) => acc + r.performance, 0) / robots.length);

  return (
    <div className="space-y-6">
      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Robots</p>
                <p className="text-2xl font-bold text-green-400">{onlineRobots}/{robots.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Battery</p>
                <p className="text-2xl font-bold text-blue-400">{averageBattery}%</p>
              </div>
              <Battery className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance</p>
                <p className="text-2xl font-bold text-purple-400">{averagePerformance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Alerts</p>
                <p className={`text-2xl font-bold ${totalAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {totalAlerts}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${totalAlerts > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot List */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Fleet Robots
              </CardTitle>
              <Button size="sm" className="bg-blue-600/20 hover:bg-blue-600/40">
                <Plus className="w-4 h-4 mr-2" />
                Add Robot
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {robots.map((robot, index) => (
                <motion.div
                  key={robot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRobot?.id === robot.id 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                  }`}
                  onClick={() => setSelectedRobot(robot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-200">{robot.name}</h3>
                    <Badge variant="outline" className={getStatusColor(robot.status)}>
                      {getStatusIcon(robot.status)}
                      {robot.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Battery</span>
                      <span className="text-white">{robot.battery}%</span>
                    </div>
                    <Progress value={robot.battery} className="h-1.5" />
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatUptime(robot.uptime)}
                      </span>
                      {robot.alerts > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          {robot.alerts}
                        </span>
                      )}
                    </div>
                    
                    {robot.currentTask && (
                      <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {robot.currentTask}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Robot Details & Fleet Map */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRobot ? (
            <>
              {/* Robot Details */}
              <Card className="bg-slate-900/50 neon-border">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    {selectedRobot.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedRobot.battery}%</div>
                      <div className="text-sm text-slate-400">Battery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{selectedRobot.performance}%</div>
                      <div className="text-sm text-slate-400">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{formatUptime(selectedRobot.uptime)}</div>
                      <div className="text-sm text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{selectedRobot.alerts}</div>
                      <div className="text-sm text-slate-400">Alerts</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Model:</span>
                        <span className="ml-2 text-white">{selectedRobot.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <span className="ml-2 text-white capitalize">{selectedRobot.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Last Seen:</span>
                        <span className="ml-2 text-white">{selectedRobot.lastSeen.toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Current Task:</span>
                        <span className="ml-2 text-white">{selectedRobot.currentTask || 'None'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/30">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-400 border-green-400/30">
                        <Activity className="w-4 h-4 mr-2" />
                        Monitor
                      </Button>
                      <Button size="sm" variant="outline" className="text-purple-400 border-purple-400/30">
                        <Target className="w-4 h-4 mr-2" />
                        Assign Task
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fleet Map */}
              <Card className="bg-slate-900/50 neon-border">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Fleet Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-slate-800/50 rounded-lg h-64 overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="fleet-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#475569" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#fleet-grid)" />
                      </svg>
                    </div>
                    
                    {/* Robot positions */}
                    {robots.map((robot, index) => (
                      <motion.div
                        key={robot.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ 
                          left: `${robot.location.x}%`, 
                          top: `${robot.location.y}%` 
                        }}
                      >
                        <div className={`relative ${selectedRobot?.id === robot.id ? 'scale-125' : ''} transition-transform`}>
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            robot.status === 'online' ? 'bg-green-500 border-green-400' :
                            robot.status === 'mission' ? 'bg-blue-500 border-blue-400' :
                            robot.status === 'maintenance' ? 'bg-yellow-500 border-yellow-400' :
                            'bg-red-500 border-red-400'
                          } ${robot.status === 'online' || robot.status === 'mission' ? 'animate-pulse' : ''}`} />
                          <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-slate-900/90 px-2 py-1 rounded text-xs whitespace-nowrap">
                            {robot.name}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-slate-900/50 neon-border h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Robot Selected</h3>
                <p>Select a robot from the fleet to view details and position.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="text-blue-400">Fleet Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
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
                  <Line type="monotone" dataKey="EMU Primary" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="EMU Secondary" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="EMU Backup" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="text-blue-400">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="task" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetPage;
