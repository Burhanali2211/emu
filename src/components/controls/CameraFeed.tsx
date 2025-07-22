import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoOff } from 'lucide-react';

export const CameraFeed = () => {
  return (
    <Card className="bg-slate-900/50 neon-border">
      <CardHeader>
        <CardTitle className="text-blue-400">Live Camera Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-500">
            <VideoOff className="mx-auto h-12 w-12" />
            <p className="mt-2">No camera signal</p>
            <p className="text-xs">Camera feature coming soon!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
