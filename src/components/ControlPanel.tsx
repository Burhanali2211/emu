import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX, Power, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRobot } from '@/context/RobotContext';

export const ControlPanel: React.FC = () => {
    const { sendMessage, robotStatus, isConnected } = useRobot();

  const handleMovement = (direction: string) => {
    sendMessage({ type: 'command', data: { action: 'move', direction, duration: direction === 'stop' ? 0 : 1000 } });
  };

  const handleBuzzer = () => {
    sendMessage({ type: 'command', data: { action: 'buzzer', state: !robotStatus.buzzer } });
  };

  const handleSensorToggle = (sensor: 'ultrasonic' | 'smoke') => {
    sendMessage({ type: 'command', data: { action: 'sensor_toggle', sensor, enabled: !robotStatus.components[sensor] } });
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <Card className="bg-slate-900/50 neon-border h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-400 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Manual Control
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-blue-300 mb-2 text-center">Movement</h4>
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            <div />
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button onMouseDown={() => handleMovement('forward')} onMouseUp={() => handleMovement('stop')} disabled={!isConnected} className="w-full bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-100 aspect-square"><ArrowUp /></Button>
            </motion.div>
            <div />
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button onMouseDown={() => handleMovement('left')} onMouseUp={() => handleMovement('stop')} disabled={!isConnected} className="w-full bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-100 aspect-square"><ArrowLeft /></Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button onClick={() => handleMovement('stop')} disabled={!isConnected} className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 text-red-100 aspect-square"><Power /></Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button onMouseDown={() => handleMovement('right')} onMouseUp={() => handleMovement('stop')} disabled={!isConnected} className="w-full bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-100 aspect-square"><ArrowRight /></Button>
            </motion.div>
            <div />
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button onMouseDown={() => handleMovement('backward')} onMouseUp={() => handleMovement('stop')} disabled={!isConnected} className="w-full bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-100 aspect-square"><ArrowDown /></Button>
            </motion.div>
            <div />
          </div>
        </div>

        <Separator className="bg-blue-500/30" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Buzzer</span>
            <Button onClick={handleBuzzer} disabled={!isConnected} size="sm" variant="outline" className={`w-20 ${robotStatus.buzzer ? 'border-yellow-500/30 text-yellow-300' : 'border-slate-500/30'}`}>
              {robotStatus.buzzer ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {robotStatus.buzzer ? 'On' : 'Off'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Ultrasonic</span>
            <Switch checked={robotStatus?.components?.ultrasonic} onCheckedChange={() => handleSensorToggle('ultrasonic')} disabled={!isConnected} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Smoke Detector</span>
            <Switch checked={robotStatus?.components?.smoke} onCheckedChange={() => handleSensorToggle('smoke')} disabled={!isConnected} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
