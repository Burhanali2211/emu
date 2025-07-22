import { useState, useEffect } from 'react';
import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  Globe, 
  Router, 
  Signal, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetworkConnection {
  id: string;
  name: string;
  type: 'wifi' | 'ethernet' | 'cellular';
  status: 'connected' | 'disconnected' | 'connecting';
  signalStrength: number;
  speed: number;
  latency: number;
  dataUsage: { sent: number; received: number };
}

const NetworkPage = () => {
  const { isConnected } = useRobot();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);

  const [connections] = useState<NetworkConnection[]>([
    {
      id: '1',
      name: 'RobotNet_5G',
      type: 'wifi',
      status: 'connected',
      signalStrength: 85,
      speed: 150.5,
      latency: 12,
      dataUsage: { sent: 2.4, received: 8.7 },
    },
    {
      id: '2',
      name: 'Backup_WiFi',
      type: 'wifi',
      status: 'disconnected',
      signalStrength: 65,
      speed: 0,
      latency: 0,
      dataUsage: { sent: 0, received: 0 },
    },
    {
      id: '3',
      name: 'Ethernet_LAN',
      type: 'ethernet',
      status: 'disconnected',
      signalStrength: 100,
      speed: 0,
      latency: 0,
      dataUsage: { sent: 0, received: 0 },
    },
  ]);

  const [networkMetrics] = useState([
    { time: '10:00', latency: 12, throughput: 150, packetLoss: 0.1 },
    { time: '10:05', latency: 15, throughput: 145, packetLoss: 0.2 },
    { time: '10:10', latency: 11, throughput: 155, packetLoss: 0.0 },
    { time: '10:15', latency: 18, throughput: 140, packetLoss: 0.3 },
    { time: '10:20', latency: 13, throughput: 148, packetLoss: 0.1 },
    { time: '10:25', latency: 14, throughput: 152, packetLoss: 0.1 },
  ]);

  const activeConnection = connections.find(conn => conn.status === 'connected');
  const totalDataUsage = connections.reduce((acc, conn) => ({
    sent: acc.sent + conn.dataUsage.sent,
    received: acc.received + conn.dataUsage.received,
  }), { sent: 0, received: 0 });

  const getConnectionIcon = (type: NetworkConnection['type']) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-5 h-5" />;
      case 'ethernet': return <Router className="w-5 h-5" />;
      case 'cellular': return <Signal className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: NetworkConnection['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400 border-green-400';
      case 'connecting': return 'text-yellow-400 border-yellow-400';
      case 'disconnected': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    if (strength >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleScanNetworks = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleConnect = (connectionId: string) => {
    console.log('Connecting to:', connectionId);
  };

  const handleDisconnect = (connectionId: string) => {
    console.log('Disconnecting from:', connectionId);
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connection Status</p>
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
                <p className="text-sm text-slate-400">Signal Strength</p>
                <p className={`text-2xl font-bold ${getSignalStrengthColor(activeConnection?.signalStrength || 0)}`}>
                  {activeConnection?.signalStrength || 0}%
                </p>
              </div>
              <Signal className={`w-8 h-8 ${getSignalStrengthColor(activeConnection?.signalStrength || 0)}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Network Speed</p>
                <p className="text-2xl font-bold text-blue-400">
                  {activeConnection?.speed || 0} Mbps
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Latency</p>
                <p className="text-2xl font-bold text-purple-400">
                  {activeConnection?.latency || 0}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Networks */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Available Networks
              </CardTitle>
              <Button 
                size="sm" 
                onClick={handleScanNetworks}
                disabled={isScanning}
                className="bg-blue-600/20 hover:bg-blue-600/40"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {connections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedConnection?.id === connection.id 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                  }`}
                  onClick={() => setSelectedConnection(connection)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(connection.type)}
                      <span className="font-medium text-slate-200">{connection.name}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(connection.status)}>
                      {connection.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Signal</span>
                      <span className={getSignalStrengthColor(connection.signalStrength)}>
                        {connection.signalStrength}%
                      </span>
                    </div>
                    <Progress value={connection.signalStrength} className="h-1.5" />
                    
                    {connection.status === 'connected' && (
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{connection.speed} Mbps</span>
                        <span>{connection.latency}ms</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {connection.status === 'disconnected' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-green-400 border-green-400/30 hover:bg-green-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(connection.id);
                        }}
                      >
                        Connect
                      </Button>
                    )}
                    {connection.status === 'connected' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnect(connection.id);
                        }}
                      >
                        Disconnect
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Network Details & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Details */}
          {selectedConnection ? (
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  {getConnectionIcon(selectedConnection.type)}
                  {selectedConnection.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedConnection.signalStrength}%</div>
                    <div className="text-sm text-slate-400">Signal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedConnection.speed} Mbps</div>
                    <div className="text-sm text-slate-400">Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{selectedConnection.latency}ms</div>
                    <div className="text-sm text-slate-400">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {(selectedConnection.dataUsage.sent + selectedConnection.dataUsage.received).toFixed(1)}GB
                    </div>
                    <div className="text-sm text-slate-400">Data Usage</div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="ml-2 text-white capitalize">{selectedConnection.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="ml-2 text-white capitalize">{selectedConnection.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Data Sent:</span>
                    <span className="ml-2 text-white">{selectedConnection.dataUsage.sent.toFixed(1)} GB</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Data Received:</span>
                    <span className="ml-2 text-white">{selectedConnection.dataUsage.received.toFixed(1)} GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/50 neon-border">
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center text-slate-400">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Network Selected</h3>
                  <p>Select a network to view detailed information.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Performance Chart */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={networkMetrics}>
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
                    <Line type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={2} name="Latency (ms)" />
                    <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} name="Throughput (Mbps)" />
                    <Line type="monotone" dataKey="packetLoss" stroke="#ef4444" strokeWidth={2} name="Packet Loss (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage Summary */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Data Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{totalDataUsage.sent.toFixed(1)} GB</div>
                  <div className="text-sm text-slate-400">Total Sent</div>
                  <div className="mt-2 text-xs text-slate-500">↑ +12% from last week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{totalDataUsage.received.toFixed(1)} GB</div>
                  <div className="text-sm text-slate-400">Total Received</div>
                  <div className="mt-2 text-xs text-slate-500">↓ -5% from last week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {(totalDataUsage.sent + totalDataUsage.received).toFixed(1)} GB
                  </div>
                  <div className="text-sm text-slate-400">Total Usage</div>
                  <div className="mt-2 text-xs text-slate-500">→ +3% from last week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
