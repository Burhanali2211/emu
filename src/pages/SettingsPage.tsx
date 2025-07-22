import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Bot } from 'lucide-react';
import { ComponentStatus } from '@/types/robot';

const ComponentToggleCard = () => {
  const { robotStatus, toggleComponent } = useRobot();
  const components = robotStatus.components;

  return (
    <Card className="bg-slate-900/50 neon-border">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2"><Bot /> Enabled Components</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">Toggle which hardware components are active on your robot. The UI and firmware will adapt.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(components).map((key) => (
            <div key={key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <Label htmlFor={`toggle-${key}`} className="capitalize">{key}</Label>
              <Switch
                id={`toggle-${key}`}
                checked={components[key as keyof ComponentStatus]}
                onCheckedChange={(checked) => toggleComponent(key as keyof ComponentStatus, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  const { config, setConfig, saveConfig, sendMessage, robotStatus } = useRobot();

  const handleThresholdChange = (key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const newThresholds = { ...robotStatus.thresholds, [key]: numValue };
    sendMessage({ type: 'command', data: { action: 'set_thresholds', thresholds: newThresholds } });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ComponentToggleCard />
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400">Connection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ws-url">WebSocket URL</Label>
            <Input
              id="ws-url"
              value={config.websocketUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, websocketUrl: e.target.value }))}
              placeholder="ws://192.168.1.100:81"
              className="bg-slate-800/50 border-blue-500/30"
            />
          </div>
          <div>
            <Label htmlFor="gemini-key">Gemini AI API Key</Label>
            <Input
              id="gemini-key"
              type="password"
              value={config.geminiApiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
              placeholder="Enter your Gemini API key"
              className="bg-slate-800/50 border-blue-500/30"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveConfig}><Save className="mr-2 h-4 w-4" /> Save Connection</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400">Robot Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="thresh-danger">Ultrasonic Danger (cm)</Label>
              <Input id="thresh-danger" type="number" defaultValue={robotStatus.thresholds.ultrasonicDanger} onBlur={(e) => handleThresholdChange('ultrasonicDanger', e.target.value)} className="bg-slate-800/50 border-blue-500/30" />
            </div>
            <div>
              <Label htmlFor="thresh-warn">Ultrasonic Warning (cm)</Label>
              <Input id="thresh-warn" type="number" defaultValue={robotStatus.thresholds.ultrasonicWarning} onBlur={(e) => handleThresholdChange('ultrasonicWarning', e.target.value)} className="bg-slate-800/50 border-blue-500/30" />
            </div>
            <div>
              <Label htmlFor="thresh-smoke">Smoke Sensitivity</Label>
              <Input id="thresh-smoke" type="number" defaultValue={robotStatus.thresholds.smokeSensitivity} onBlur={(e) => handleThresholdChange('smokeSensitivity', e.target.value)} className="bg-slate-800/50 border-blue-500/30" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Note: Robot will confirm parameter updates. Changes may take a moment to reflect.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
