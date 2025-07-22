import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Navigation, 
  Clock, 
  Target,
  Route,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Waypoint {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'patrol' | 'checkpoint' | 'destination';
}

interface Mission {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'failed';
  progress: number;
  waypoints: Waypoint[];
  estimatedTime: number;
  actualTime?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const MissionsPage = () => {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: '1',
      name: 'Perimeter Patrol',
      status: 'active',
      progress: 65,
      waypoints: [
        { id: '1', x: 50, y: 50, name: 'Start Point', type: 'checkpoint' },
        { id: '2', x: 150, y: 50, name: 'Corner A', type: 'patrol' },
        { id: '3', x: 150, y: 150, name: 'Corner B', type: 'patrol' },
        { id: '4', x: 50, y: 150, name: 'Corner C', type: 'patrol' },
      ],
      estimatedTime: 15,
      actualTime: 9,
      priority: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Room Inspection',
      status: 'pending',
      progress: 0,
      waypoints: [
        { id: '5', x: 75, y: 75, name: 'Room Center', type: 'destination' },
      ],
      estimatedTime: 8,
      priority: 'medium',
      createdAt: new Date(),
    },
  ]);

  const [selectedMission, setSelectedMission] = useState<Mission | null>(missions[0]);

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const handleMissionControl = (action: 'start' | 'pause' | 'stop', missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { 
            ...mission, 
            status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'pending'
          }
        : mission
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mission List */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Active Missions
            </CardTitle>
            <Button size="sm" className="bg-blue-600/20 hover:bg-blue-600/40">
              <Plus className="w-4 h-4 mr-2" />
              New Mission
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {missions.map((mission) => (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMission?.id === mission.id 
                    ? 'bg-blue-600/20 border-blue-500/50' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30'
                }`}
                onClick={() => setSelectedMission(mission)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-200">{mission.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(mission.status)}`} />
                    <Badge variant="outline" className={getPriorityColor(mission.priority)}>
                      {mission.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Progress</span>
                    <span>{mission.progress}%</span>
                  </div>
                  <Progress value={mission.progress} className="h-1.5" />
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mission.actualTime || 0}/{mission.estimatedTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {mission.waypoints.length} waypoints
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {mission.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-green-400 border-green-400/30 hover:bg-green-400/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMissionControl('start', mission.id);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {mission.status === 'active' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-orange-400 border-orange-400/30 hover:bg-orange-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionControl('pause', mission.id);
                        }}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionControl('stop', mission.id);
                        }}
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    </>
                  )}
                  {mission.status === 'paused' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-green-400 border-green-400/30 hover:bg-green-400/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMissionControl('start', mission.id);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Mission Details & Map */}
      <div className="lg:col-span-2 space-y-6">
        {selectedMission ? (
          <>
            {/* Mission Map */}
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Mission Map - {selectedMission.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-800/50 rounded-lg h-64 overflow-hidden">
                  {/* Simple grid background */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#475569" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Waypoints */}
                  {selectedMission.waypoints.map((waypoint, index) => (
                    <motion.div
                      key={waypoint.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${waypoint.x}%`, 
                        top: `${waypoint.y}%` 
                      }}
                    >
                      <div className="relative">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          waypoint.type === 'checkpoint' ? 'bg-green-500 border-green-400' :
                          waypoint.type === 'patrol' ? 'bg-blue-500 border-blue-400' :
                          'bg-purple-500 border-purple-400'
                        } animate-pulse`} />
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-slate-900/90 px-2 py-1 rounded text-xs whitespace-nowrap">
                          {waypoint.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Path lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedMission.waypoints.map((waypoint, index) => {
                      if (index === selectedMission.waypoints.length - 1) return null;
                      const nextWaypoint = selectedMission.waypoints[index + 1];
                      return (
                        <motion.line
                          key={`${waypoint.id}-${nextWaypoint.id}`}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: index * 0.2, duration: 0.5 }}
                          x1={`${waypoint.x}%`}
                          y1={`${waypoint.y}%`}
                          x2={`${nextWaypoint.x}%`}
                          y2={`${nextWaypoint.y}%`}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Mission Status */}
            <Card className="bg-slate-900/50 neon-border">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Mission Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedMission.progress}%</div>
                    <div className="text-sm text-slate-400">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedMission.actualTime || 0}m</div>
                    <div className="text-sm text-slate-400">Elapsed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{selectedMission.estimatedTime}m</div>
                    <div className="text-sm text-slate-400">Estimated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{selectedMission.waypoints.length}</div>
                    <div className="text-sm text-slate-400">Waypoints</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-slate-900/50 neon-border h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Mission Selected</h3>
              <p>Select a mission from the list to view details and map.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MissionsPage;
