import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Cpu, AlertTriangle, Clock, Battery, Thermometer, Radar, Sun, Droplets, Zap } from 'lucide-react';
import { AIChat } from '@/components/AIChat';
import { CommandQueueItem } from '@/types/robot';

const StatCard = ({ icon, title, value, colorClass = 'text-blue-400' }: { icon: React.ReactNode, title: string, value: string | number, colorClass?: string }) => (
  <Card className="bg-slate-900/50 neon-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
      <div className={colorClass}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ onRun }: { onRun: (action: any) => void }) => (
    <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
            <CardTitle className="text-blue-400">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
            <button onClick={() => onRun({ action: 'patrol', duration: 15000 })} className="p-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/40 transition-colors">Patrol Area</button>
            <button onClick={() => onRun({ action: 'scan', type: 'environment' })} className="p-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/40 transition-colors">Scan Surroundings</button>
            <button onClick={() => onRun({ action: 'move', direction: 'stop' })} className="p-2 bg-red-600/20 rounded-lg hover:bg-red-600/40 transition-colors">Emergency Stop</button>
            <button onClick={() => onRun({ action: 'expression', expression: 'happy' })} className="p-2 bg-green-600/20 rounded-lg hover:bg-green-600/40 transition-colors">Be Happy</button>
        </CardContent>
    </Card>
);

const CommandQueueList = ({ queue }: { queue: CommandQueueItem[] }) => (
    <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
            <CardTitle className="text-blue-400">Command Queue</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2 text-sm">
                {queue.length > 0 ? queue.slice(-5).reverse().map(c => (
                    <li key={c.id} className="flex justify-between items-center">
                        <span>{c.command.data.action || 'command'}</span>
                        <span className="text-xs capitalize text-slate-400">{c.status}</span>
                    </li>
                )) : <li className="text-slate-500">Queue is empty.</li>}
            </ul>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
  const { isConnected, robotStatus, sensorData, commandQueue, sendMessage, addLog } = useRobot();

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={<Zap size={24} />} title="Status" value={isConnected ? 'Online' : 'Offline'} colorClass={isConnected ? 'text-green-400' : 'text-red-400'} />
          <StatCard icon={<Clock size={24} />} title="Uptime" value={formatUptime(robotStatus.uptime)} />
          <StatCard icon={<Battery size={24} />} title="Battery" value={`${sensorData?.battery ?? 0}%`} colorClass={ (sensorData?.battery ?? 0) < 20 ? 'text-red-400' : 'text-green-400'} />
          <StatCard icon={<Bot size={24} />} title="Mode" value="AI Assisted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {robotStatus.components.ultrasonic && <StatCard icon={<Radar size={24} />} title="Distance" value={`${sensorData?.ultrasonic.toFixed(1) ?? 0} cm`} colorClass={ (sensorData?.ultrasonic ?? 100) < 10 ? 'text-yellow-400' : 'text-blue-400'} />}
            {robotStatus.components.smoke && <StatCard icon={<Thermometer size={24} />} title="Air Quality" value={sensorData?.smoke ? 'Alert' : 'Good'} colorClass={sensorData?.smoke ? 'text-red-400' : 'text-green-400'} />}
            {robotStatus.components.dht && <StatCard icon={<Thermometer size={24} />} title="Temperature" value={`${sensorData?.temperature?.toFixed(1) ?? 0}°C`} />}
            {robotStatus.components.dht && <StatCard icon={<Droplets size={24} />} title="Humidity" value={`${sensorData?.humidity?.toFixed(1) ?? 0}%`} />}
            {robotStatus.components.ldr && <StatCard icon={<Sun size={24} />} title="Light Level" value={`${sensorData?.lightLevel ?? 0}`} />}
        </div>
        {sensorData?.smoke && robotStatus.components.smoke && (
            <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg flex items-center gap-4 animate-pulse">
                <AlertTriangle className="text-red-400" size={32} />
                <div>
                    <h3 className="font-bold text-red-300">SMOKE DETECTED</h3>
                    <p className="text-sm text-red-400">Immediate attention required. Air quality is hazardous.</p>
                </div>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard onRun={handleQuickAction} />
            <CommandQueueList queue={commandQueue} />
        </div>
      </div>
      <div className="lg:col-span-1">
        <AIChat />
      </div>
    </div>
  );
};

export default DashboardPage;
