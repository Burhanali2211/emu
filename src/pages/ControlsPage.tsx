import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ControlPanel } from '@/components/ControlPanel';
import { CameraFeed } from '@/components/controls/CameraFeed';
import { NeoPixelControl } from '@/components/controls/NeoPixelControl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Send } from 'lucide-react';

const OledControlCard = () => {
    const { sendMessage, addLog, robotStatus } = useRobot();
    const [text, setText] = useState('');

    if (!robotStatus.components.oled) return null;

    const handleSend = () => {
        if (!text) return;
        sendMessage({ type: 'command', data: { action: 'oled', text }});
        addLog(`OLED text set: "${text}"`);
        setText('');
    };

    return (
        <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
                <CardTitle className="text-blue-400">OLED Display Control</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Text to display..."
                        className="bg-slate-800/50 border-blue-500/30"
                    />
                    <Button onClick={handleSend}><Send /></Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ControlsPage = () => {
  const { robotStatus } = useRobot();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <CameraFeed />
        <OledControlCard />
        {robotStatus.components.neopixel && <NeoPixelControl />}
      </div>
      <div className="lg:col-span-1">
        <ControlPanel />
      </div>
    </div>
  );
};

export default ControlsPage;
