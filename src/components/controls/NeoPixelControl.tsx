import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRobot } from '@/context/RobotContext';
import { Lightbulb } from 'lucide-react';

export const NeoPixelControl = () => {
  const { sendMessage, robotStatus, addLog } = useRobot();
  const neopixelStatus = robotStatus.neopixel;

  const handleColorChange = (color: string) => {
    sendMessage({ type: 'command', data: { action: 'neopixel', mode: 'static', color } });
    addLog(`NeoPixel color set to ${color}`);
  };

  const handleBrightnessChange = (brightness: number) => {
    sendMessage({ type: 'command', data: { action: 'neopixel', brightness } });
    addLog(`NeoPixel brightness set to ${brightness}`);
  };

  const handleModeChange = (mode: 'static' | 'rainbow' | 'off') => {
    sendMessage({ type: 'command', data: { action: 'neopixel', mode } });
    addLog(`NeoPixel mode set to ${mode}`);
  };

  return (
    <Card className="bg-slate-900/50 neon-border">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <Lightbulb /> NeoPixel RGB Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="np-color">Color</Label>
          <Input
            id="np-color"
            type="color"
            value={neopixelStatus.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
        </div>
        <div>
          <Label htmlFor="np-brightness">Brightness ({neopixelStatus.brightness})</Label>
          <Input
            id="np-brightness"
            type="range"
            min="0"
            max="255"
            value={neopixelStatus.brightness}
            onMouseUp={(e) => handleBrightnessChange(parseInt((e.target as HTMLInputElement).value))}
            onChange={(_e) => {
              // This can be used for live preview if firmware supports it
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant={neopixelStatus.mode === 'static' ? 'default' : 'outline'} onClick={() => handleModeChange('static')}>Static</Button>
          <Button variant={neopixelStatus.mode === 'rainbow' ? 'default' : 'outline'} onClick={() => handleModeChange('rainbow')}>Rainbow</Button>
          <Button variant={neopixelStatus.mode === 'off' ? 'destructive' : 'outline'} onClick={() => handleModeChange('off')}>Off</Button>
        </div>
      </CardContent>
    </Card>
  );
};
