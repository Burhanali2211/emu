import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorChart } from '@/components/analytics/SensorChart';
import { LogTable } from '@/components/analytics/LogTable';

const AnalyticsPage = () => {
  const { sensorHistory, commandLogs } = useRobot();

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400">Live Sensor Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-2 text-center text-slate-300">Ultrasonic Distance (cm)</h4>
            <SensorChart data={sensorHistory.ultrasonic} dataKey="value" color="#3b82f6" />
          </div>
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-2 text-center text-slate-300">Smoke Level</h4>
            <SensorChart data={sensorHistory.smoke} dataKey="value" color="#f59e0b" />
          </div>
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-2 text-center text-slate-300">Battery (%)</h4>
            <SensorChart data={sensorHistory.battery} dataKey="value" color="#22c55e" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="text-blue-400">Command & Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTable logs={commandLogs} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
