import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Video, 
  Download, 
  Play, 
  Pause, 
  Square, 
  Image as ImageIcon,
  Trash2,
  Share,
  Eye,
  Calendar,
  Clock,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  name: string;
  thumbnail: string;
  url: string;
  size: number;
  duration?: number;
  timestamp: Date;
  tags: string[];
}

const MediaPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'video',
      name: 'Patrol_Mission_001.mp4',
      thumbnail: '/api/placeholder/200/150',
      url: '/api/placeholder/video',
      size: 15.2,
      duration: 120,
      timestamp: new Date(Date.now() - 3600000),
      tags: ['patrol', 'mission', 'outdoor'],
    },
    {
      id: '2',
      type: 'image',
      name: 'Obstacle_Detection_001.jpg',
      thumbnail: '/api/placeholder/200/150',
      url: '/api/placeholder/200/150',
      size: 2.1,
      timestamp: new Date(Date.now() - 7200000),
      tags: ['obstacle', 'detection', 'safety'],
    },
    {
      id: '3',
      type: 'video',
      name: 'Room_Scan_002.mp4',
      thumbnail: '/api/placeholder/200/150',
      url: '/api/placeholder/video',
      size: 8.7,
      duration: 45,
      timestamp: new Date(Date.now() - 10800000),
      tags: ['scan', 'indoor', 'mapping'],
    },
    {
      id: '4',
      type: 'image',
      name: 'System_Status_Screenshot.png',
      thumbnail: '/api/placeholder/200/150',
      url: '/api/placeholder/200/150',
      size: 0.8,
      timestamp: new Date(Date.now() - 14400000),
      tags: ['screenshot', 'status', 'system'],
    },
  ]);

  const filteredMedia = mediaItems.filter(item => 
    filter === 'all' || 
    (filter === 'images' && item.type === 'image') ||
    (filter === 'videos' && item.type === 'video')
  );

  const totalSize = mediaItems.reduce((acc, item) => acc + item.size, 0);
  const videoCount = mediaItems.filter(item => item.type === 'video').length;
  const imageCount = mediaItems.filter(item => item.type === 'image').length;

  const handleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop video recording
  };

  const handleScreenshot = () => {
    // In a real implementation, this would capture a screenshot
    console.log('Taking screenshot...');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Media Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* Recording Controls */}
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Capture Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleRecording}
              className={`w-full ${
                isRecording 
                  ? 'bg-red-600/20 text-red-400 border-red-400/30 hover:bg-red-600/30' 
                  : 'bg-blue-600/20 text-blue-400 border-blue-400/30 hover:bg-blue-600/30'
              }`}
              variant="outline"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            <Button
              onClick={handleScreenshot}
              className="w-full bg-green-600/20 text-green-400 border-green-400/30 hover:bg-green-600/30"
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Screenshot
            </Button>

            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-red-400"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Files</span>
                <span className="text-white">{mediaItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Videos</span>
                <span className="text-white">{videoCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Images</span>
                <span className="text-white">{imageCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Size</span>
                <span className="text-white">{formatFileSize(totalSize * 1024 * 1024)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Controls */}
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader>
            <CardTitle className="text-blue-400">Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { key: 'all', label: 'All Media', count: mediaItems.length },
                { key: 'videos', label: 'Videos', count: videoCount },
                { key: 'images', label: 'Images', count: imageCount },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <span>{filterOption.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {filterOption.count}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Gallery */}
      <div className="lg:col-span-3 space-y-6">
        {selectedMedia ? (
          /* Media Viewer */
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                {selectedMedia.type === 'video' ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                {selectedMedia.name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMedia(null)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Media Display */}
                <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                  {selectedMedia.type === 'video' ? (
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-auto max-h-96"
                      poster={selectedMedia.thumbnail}
                    >
                      <source src={selectedMedia.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  )}
                </div>

                {/* Media Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type</span>
                    <p className="text-white capitalize">{selectedMedia.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Size</span>
                    <p className="text-white">{formatFileSize(selectedMedia.size * 1024 * 1024)}</p>
                  </div>
                  {selectedMedia.duration && (
                    <div>
                      <span className="text-slate-400">Duration</span>
                      <p className="text-white">{formatDuration(selectedMedia.duration)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Created</span>
                    <p className="text-white">{selectedMedia.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="text-slate-400 text-sm">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMedia.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/30">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-400 border-green-400/30">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-400 border-red-400/30">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Media Grid */
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Media Gallery ({filteredMedia.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Media Found</h3>
                  <p>Start recording or take screenshots to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMedia.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="relative">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                            {item.type}
                          </Badge>
                        </div>
                        {item.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(item.duration)}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-slate-200 truncate">{item.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                          <span>{formatFileSize(item.size * 1024 * 1024)}</span>
                          <span>{item.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
