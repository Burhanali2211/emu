import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, Cable, Power, Bot, Lightbulb } from 'lucide-react';

const hardwareSections = [
  {
    title: 'Core Components',
    icon: <Cpu className="text-blue-400" />,
    pins: [
      { component: 'ESP32 Dev Module', pin: 'Core', notes: 'WROOM-32 with dual-core processor & WiFi' },
      { component: 'OLED Display (SSD1306)', pin: 'SDA: 21, SCL: 22', notes: 'I2C interface for the face' },
      { component: 'Power Supply', pin: 'VIN & GND', notes: '5V input recommended for stability' },
    ],
  },
  {
    title: 'Actuators (Outputs)',
    icon: <Bot className="text-purple-400" />,
    pins: [
      { component: 'Left Motor (IN1)', pin: 'GPIO 12', notes: 'PWM Channel 0' },
      { component: 'Left Motor (IN2)', pin: 'GPIO 14', notes: 'Direction Control' },
      { component: 'Right Motor (IN3)', pin: 'GPIO 27', notes: 'PWM Channel 1' },
      { component: 'Right Motor (IN4)', pin: 'GPIO 26', notes: 'Direction Control' },
      { component: 'Buzzer', pin: 'GPIO 4', notes: 'For sound notifications' },
    ],
  },
  {
    title: 'Sensors (Inputs)',
    icon: <Cable className="text-green-400" />,
    pins: [
      { component: 'Ultrasonic Sensor (Trig)', pin: 'GPIO 5', notes: 'Sends ultrasonic pulse' },
      { component: 'Ultrasonic Sensor (Echo)', pin: 'GPIO 18', notes: 'Receives echo pulse' },
      { component: 'Smoke/Gas Sensor (Analog)', pin: 'GPIO 36 (VP)', notes: 'Reads air quality' },
      { component: 'Battery Voltage', pin: 'GPIO 39 (VN)', notes: 'Reads battery level via voltage divider' },
    ],
  },
  {
    title: 'Optional Components',
    icon: <Lightbulb className="text-yellow-400" />,
    pins: [
      { component: 'DHT11/22 Sensor', pin: 'GPIO 25', notes: 'Temperature & Humidity Data' },
      { component: 'Photoresistor (LDR)', pin: 'GPIO 34', notes: 'Analog light level reading' },
      { component: 'IR Receiver', pin: 'GPIO 35', notes: 'Receives IR remote commands' },
      { component: 'NeoPixel LED Strip (Data)', pin: 'GPIO 23', notes: 'Addressable RGB LEDs' },
    ],
  },
];

const HardwarePage = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100">Hardware Configuration</h1>
        <p className="text-slate-400 mt-2">A guide to wiring your EMU robot's ESP32 controller.</p>
      </div>

      {hardwareSections.map((section) => (
        <Card key={section.title} className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              {section.icon}
              <span className="text-slate-200">{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Component</TableHead>
                  <TableHead className="w-[25%]">ESP32 Pin</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.pins.map((item) => (
                  <TableRow key={item.component}>
                    <TableCell className="font-medium">{item.component}</TableCell>
                    <TableCell><code className="bg-slate-700/50 text-blue-300 px-2 py-1 rounded">{item.pin}</code></TableCell>
                    <TableCell className="text-slate-400">{item.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-slate-900/50 neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Power className="text-yellow-400" />
            <span className="text-slate-200">Expansion & Power</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>
            <strong>Powering Your Robot:</strong> Use a stable 5V power source connected to the VIN pin. The ESP32's onboard regulator will provide 3.3V for the components. Powering motors directly from the ESP32 is not recommended; use a motor driver (like L298N or DRV8833) with its own power supply. NeoPixels should also have their own 5V power source.
          </p>
          <p>
            <strong>Adding More Sensors:</strong> The ESP32 has many free pins! You can add more sensors (e.g., temperature, light) by connecting them to available GPIO pins and modifying the Arduino firmware to read and send their data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HardwarePage;
