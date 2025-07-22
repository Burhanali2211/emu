import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Clock,
  Database,
  Share,
  Eye,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface Report {
  id: string;
  name: string;
  type: 'performance' | 'usage' | 'maintenance' | 'mission' | 'custom';
  status: 'ready' | 'generating' | 'scheduled';
  lastGenerated: Date;
  size: string;
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  schedule?: 'daily' | 'weekly' | 'monthly';
}

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState<string>('');
  const [format, setFormat] = useState<string>('pdf');

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Daily Performance Report',
      type: 'performance',
      status: 'ready',
      lastGenerated: new Date(Date.now() - 3600000),
      size: '2.4 MB',
      format: 'pdf',
      schedule: 'daily',
    },
    {
      id: '2',
      name: 'Weekly Mission Summary',
      type: 'mission',
      status: 'ready',
      lastGenerated: new Date(Date.now() - 86400000),
      size: '1.8 MB',
      format: 'xlsx',
      schedule: 'weekly',
    },
    {
      id: '3',
      name: 'System Usage Analytics',
      type: 'usage',
      status: 'generating',
      lastGenerated: new Date(Date.now() - 172800000),
      size: '3.2 MB',
      format: 'csv',
    },
    {
      id: '4',
      name: 'Maintenance Log',
      type: 'maintenance',
      status: 'scheduled',
      lastGenerated: new Date(Date.now() - 259200000),
      size: '0.9 MB',
      format: 'pdf',
      schedule: 'monthly',
    },
  ]);

  const performanceData = [
    { date: '2024-01-15', uptime: 98.5, efficiency: 92, errors: 2 },
    { date: '2024-01-16', uptime: 99.2, efficiency: 94, errors: 1 },
    { date: '2024-01-17', uptime: 97.8, efficiency: 89, errors: 4 },
    { date: '2024-01-18', uptime: 99.8, efficiency: 96, errors: 0 },
    { date: '2024-01-19', uptime: 98.9, efficiency: 93, errors: 1 },
    { date: '2024-01-20', uptime: 99.5, efficiency: 95, errors: 1 },
    { date: '2024-01-21', uptime: 98.2, efficiency: 91, errors: 3 },
  ];

  const usageData = [
    { name: 'Patrol Missions', value: 45, color: '#3b82f6' },
    { name: 'Monitoring', value: 30, color: '#10b981' },
    { name: 'Maintenance', value: 15, color: '#f59e0b' },
    { name: 'Idle Time', value: 10, color: '#6b7280' },
  ];

  const missionStats = [
    { type: 'Completed', count: 156, trend: '+12%' },
    { type: 'In Progress', count: 8, trend: '+2%' },
    { type: 'Failed', count: 3, trend: '-5%' },
    { type: 'Scheduled', count: 24, trend: '+8%' },
  ];

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'text-green-400 border-green-400';
      case 'generating': return 'text-yellow-400 border-yellow-400';
      case 'scheduled': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'usage': return <BarChart3 className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'mission': return <FileText className="w-4 h-4" />;
      case 'custom': return <PieChart className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleGenerateReport = () => {
    console.log('Generating report...', { reportType, format, dateRange });
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {missionStats.map((stat, index) => (
          <motion.div
            key={stat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 neon-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.type}</p>
                    <p className="text-2xl font-bold text-white">{stat.count}</p>
                    <p className={`text-sm ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend} from last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-800/50 border-blue-500/30">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Analysis</SelectItem>
                    <SelectItem value="usage">Usage Statistics</SelectItem>
                    <SelectItem value="maintenance">Maintenance Log</SelectItem>
                    <SelectItem value="mission">Mission Summary</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-slate-800/50 border-blue-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-slate-800/50 border-blue-500/30"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-slate-800/50 border-blue-500/30"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateReport}
                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Existing Reports */}
          <Card className="bg-slate-900/50 neon-border mt-6">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReport?.id === report.id 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <span className="font-medium text-slate-200 text-sm">{report.name}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{report.size}</span>
                    <span>{report.lastGenerated.toLocaleDateString()}</span>
                  </div>
                  
                  {report.schedule && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                        {report.schedule}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Trends */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #3b82f6',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} name="Uptime %" />
                    <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="Efficiency %" />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage Distribution */}
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #3b82f6',
                          borderRadius: '8px'
                        }}
                      />
                      <RechartsPieChart data={usageData} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                        {usageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {usageData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Actions */}
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Report Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">{selectedReport.name}</h4>
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>Type: {selectedReport.type}</p>
                        <p>Format: {selectedReport.format.toUpperCase()}</p>
                        <p>Size: {selectedReport.size}</p>
                        <p>Last Generated: {selectedReport.lastGenerated.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600/20 text-green-400 border-green-400/30 hover:bg-green-600/30"
                        onClick={() => handleDownloadReport(selectedReport.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-blue-400 border-blue-400/30">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-purple-400 border-purple-400/30">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a report to view actions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
