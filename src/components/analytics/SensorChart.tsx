import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SensorChartProps {
  data: Array<{ timestamp: number; value: any }>;
  dataKey: string;
  color: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({ data, dataKey, color }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTimestamp} 
            fontSize={10} 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <YAxis 
            fontSize={10} 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(10, 20, 40, 0.8)', 
              borderColor: 'rgba(59, 130, 246, 0.5)',
              color: '#fff'
            }}
            labelFormatter={formatTimestamp}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
