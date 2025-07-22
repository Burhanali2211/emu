import { useRobot } from '@/context/RobotContext';
import { Button } from '@/components/ui/button';
import { Wifi, Mic, MicOff, BatteryFull, BatteryMedium, BatteryLow, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Header = () => {
  const { isConnected, voice, sensorData } = useRobot();
  const batteryLevel = sensorData?.battery ?? 0;

  const getBatteryIcon = () => {
    if (batteryLevel > 60) return <BatteryFull className="text-green-400" />;
    if (batteryLevel > 20) return <BatteryMedium className="text-yellow-400" />;
    return <BatteryLow className="text-red-400" />;
  };

  return (
    <header className="flex items-center justify-end p-4 bg-slate-950/50 border-b border-slate-800 h-16">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getBatteryIcon()}
          <div className="w-20">
            <Progress value={batteryLevel} className="h-1.5" />
          </div>
        </div>

        <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${voice.isAwake ? 'bg-blue-500/30' : ''}`}>
          <Button onClick={voice.isListening ? voice.stopListening : voice.startListening} variant="outline" size="icon" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
            {voice.isListening ? <Mic className="w-4 h-4 text-green-400 animate-pulse-mic" /> : <MicOff className="w-4 h-4 text-red-400" />}
          </Button>
          <span className="text-sm text-slate-300 hidden sm:inline">
            {voice.isAwake ? "Listening..." : voice.isListening ? "Say 'Hey EMU'" : "Voice Muted"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
          <span className={`text-sm font-semibold hidden sm:inline ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
