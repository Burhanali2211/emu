import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Radar, Thermometer, Activity, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { SensorData, CommandQueueItem } from '@/types/robot';

interface LiveMonitoringProps {
  sensorData: SensorData | null;
  isConnected: boolean;
  logs: string[];
  commandQueue?: CommandQueueItem[];
  onClearLogs?: () => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ sensorData, logs, commandQueue = [] }) => {
  const getDistanceColor = (distance: number) => {
    if (distance < 10) return 'text-red-400';
    if (distance < 25) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 neon-border p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2"><Radar className="w-4 h-4" /> Distance Sensor</h4>
        {sensorData ? (
          <>
            <div className={`text-2xl font-bold ${getDistanceColor(sensorData.ultrasonic)}`}>
              {sensorData.ultrasonic.toFixed(1)} cm
            </div>
            <Progress value={100 - sensorData.ultrasonic} className="mt-2 h-1" />
          </>
        ) : (
          <div className="text-gray-400">No data</div>
        )}
      </Card>

      <Card className="bg-slate-900/50 neon-border p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2"><Thermometer className="w-4 h-4" /> Air Quality</h4>
        {sensorData ? (
          <>
            <div className={`text-lg font-bold ${sensorData.smoke ? 'text-red-400' : 'text-green-400'}`}>
              {sensorData.smoke ? 'SMOKE DETECTED' : 'Air Clean'}
            </div>
            <Progress value={sensorData.smokeLevel} className="mt-2 h-1" />
          </>
        ) : (
          <div className="text-gray-400">No data</div>
        )}
      </Card>

      <Card className="bg-slate-900/50 neon-border p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Command Queue</h4>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {commandQueue.slice(-5).map((cmd) => (
            <div key={cmd.id} className="flex items-center gap-2 text-xs">
              {cmd.status === 'acknowledged' && <CheckCircle className="w-3 h-3 text-green-400" />}
              {cmd.status === 'failed' && <XCircle className="w-3 h-3 text-red-400" />}
              {cmd.status === 'sent' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
              {cmd.status === 'pending' && <Clock className="w-3 h-3 text-yellow-400" />}
              <span className="text-slate-300 truncate">{cmd.command.data.action || 'Unknown'}</span>
              <Badge variant="outline" className={`ml-auto text-xs ${
                cmd.status === 'acknowledged' ? 'border-green-500/50' : 
                cmd.status === 'failed' ? 'border-red-500/50' : 'border-slate-500/50'
              }`}>{cmd.status}</Badge>
            </div>
          ))}
          {commandQueue.length === 0 && <div className="text-xs text-slate-500">No recent commands</div>}
        </div>
      </Card>

      <Card className="bg-slate-900/50 neon-border p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Activity Log</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono">
          {logs.slice(-10).map((log, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-400">{log}</motion.div>
          ))}
          {logs.length === 0 && <div className="text-slate-500 italic">Awaiting activity...</div>}
        </div>
      </Card>
    </div>
  );
};
