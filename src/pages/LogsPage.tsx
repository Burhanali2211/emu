import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Database,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  category: 'system' | 'network' | 'mission' | 'sensor' | 'user';
  message: string;
  details?: string;
  source: string;
}

const LogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      level: 'error',
      category: 'system',
      message: 'Failed to connect to sensor DHT22',
      details: 'Connection timeout after 5 seconds. Check wiring and power supply.',
      source: 'SensorManager',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000),
      level: 'warning',
      category: 'network',
      message: 'High network latency detected',
      details: 'Average latency: 250ms. Consider switching to a different network.',
      source: 'NetworkMonitor',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000),
      level: 'info',
      category: 'mission',
      message: 'Mission "Perimeter Patrol" completed successfully',
      details: 'Duration: 15 minutes, Waypoints visited: 4, No obstacles detected.',
      source: 'MissionController',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1200000),
      level: 'debug',
      category: 'sensor',
      message: 'Ultrasonic sensor reading: 45.2cm',
      source: 'UltrasonicSensor',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1500000),
      level: 'info',
      category: 'user',
      message: 'User initiated manual control mode',
      details: 'Control session started from dashboard interface.',
      source: 'UserInterface',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1800000),
      level: 'warning',
      category: 'system',
      message: 'Battery level below 20%',
      details: 'Current battery level: 18%. Consider charging soon.',
      source: 'PowerManager',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 2100000),
      level: 'error',
      category: 'network',
      message: 'WebSocket connection lost',
      details: 'Connection dropped unexpectedly. Attempting to reconnect...',
      source: 'WebSocketClient',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 2400000),
      level: 'info',
      category: 'system',
      message: 'System startup completed',
      details: 'All components initialized successfully. Ready for operation.',
      source: 'SystemManager',
    },
  ]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400 border-red-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      case 'info': return 'text-blue-400 border-blue-400';
      case 'debug': return 'text-gray-400 border-gray-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryColor = (category: LogEntry['category']) => {
    switch (category) {
      case 'system': return 'text-purple-400 border-purple-400';
      case 'network': return 'text-green-400 border-green-400';
      case 'mission': return 'text-blue-400 border-blue-400';
      case 'sensor': return 'text-yellow-400 border-yellow-400';
      case 'user': return 'text-pink-400 border-pink-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const logCounts = {
    total: logs.length,
    error: logs.filter(log => log.level === 'error').length,
    warning: logs.filter(log => log.level === 'warning').length,
    info: logs.filter(log => log.level === 'info').length,
    debug: logs.filter(log => log.level === 'debug').length,
  };

  const handleExportLogs = () => {
    console.log('Exporting logs...');
  };

  const handleClearLogs = () => {
    console.log('Clearing logs...');
  };

  return (
    <div className="space-y-6">
      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{logCounts.total}</div>
              <div className="text-sm text-slate-400">Total Logs</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{logCounts.error}</div>
              <div className="text-sm text-slate-400">Errors</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{logCounts.warning}</div>
              <div className="text-sm text-slate-400">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{logCounts.info}</div>
              <div className="text-sm text-slate-400">Info</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 neon-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{logCounts.debug}</div>
              <div className="text-sm text-slate-400">Debug</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Search Logs</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search messages, sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Log Level</label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-blue-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-blue-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleExportLogs}
                  className="w-full bg-green-600/20 text-green-400 border-green-400/30 hover:bg-green-600/30"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button 
                  onClick={handleClearLogs}
                  className="w-full bg-red-600/20 text-red-400 border-red-400/30 hover:bg-red-600/30"
                  variant="outline"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Log Details */}
          {selectedLog && (
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Log Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getLevelIcon(selectedLog.level)}
                    <Badge variant="outline" className={getLevelColor(selectedLog.level)}>
                      {selectedLog.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(selectedLog.category)}>
                      {selectedLog.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Timestamp:</span>
                      <div className="text-white">{selectedLog.timestamp.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Source:</span>
                      <div className="text-white">{selectedLog.source}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Message:</span>
                      <div className="text-white">{selectedLog.message}</div>
                    </div>
                    {selectedLog.details && (
                      <div>
                        <span className="text-slate-400">Details:</span>
                        <div className="text-white bg-slate-800/50 p-2 rounded mt-1">
                          {selectedLog.details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Log List */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                System Logs ({filteredLogs.length})
              </CardTitle>
              <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/30">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
                  <p>No logs match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedLog?.id === log.id 
                          ? 'bg-blue-600/20 border-blue-500/50' 
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          <span className="font-medium text-slate-200 text-sm">{log.message}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(log.category)}>
                            {log.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span>{log.source}</span>
                      </div>
                      
                      {log.details && selectedLog?.id !== log.id && (
                        <div className="mt-2 text-xs text-slate-500 truncate">
                          {log.details}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
