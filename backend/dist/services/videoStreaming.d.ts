import { WebSocketService } from '@/services/websocket';
import { NotificationService } from '@/services/notification';
import { FileService } from '@/services/file';
export interface VideoStream {
    streamId: string;
    robotId: string;
    userId: string;
    cameraId: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    resolution: string;
    fps: number;
    bitrate: number;
    isActive: boolean;
    startTime: Date;
    viewers: Set<string>;
    recordingPath?: string;
    isRecording: boolean;
}
export interface CameraConfig {
    cameraId: string;
    name: string;
    type: 'main' | 'secondary' | 'thermal' | 'depth';
    resolution: string;
    maxFps: number;
    capabilities: string[];
    position?: {
        x: number;
        y: number;
        z: number;
    };
    orientation?: {
        pitch: number;
        yaw: number;
        roll: number;
    };
}
export interface StreamQuality {
    name: string;
    resolution: string;
    fps: number;
    bitrate: number;
    codec: string;
}
export declare class VideoStreamingService {
    private static instance;
    private activeStreams;
    private wsService;
    private notificationService;
    private fileService;
    private recordingsDir;
    private qualitySettings;
    constructor(wsService: WebSocketService, notificationService: NotificationService, fileService: FileService);
    static getInstance(wsService: WebSocketService, notificationService: NotificationService, fileService: FileService): VideoStreamingService;
    startStream(robotId: string, userId: string, cameraId: string, quality?: 'low' | 'medium' | 'high' | 'ultra'): Promise<VideoStream>;
    stopStream(streamId: string, userId: string): Promise<void>;
    joinStream(streamId: string, userId: string): Promise<VideoStream>;
    leaveStream(streamId: string, userId: string): void;
    startRecording(streamId: string, userId: string): Promise<string>;
    stopRecording(streamId: string, userId: string): Promise<string>;
    getUserStreams(userId: string): Promise<any[]>;
    getUserRecordings(userId: string): Promise<any[]>;
    getRobotCameras(robotId: string, userId: string): Promise<CameraConfig[]>;
    changeStreamQuality(streamId: string, userId: string, quality: 'low' | 'medium' | 'high' | 'ultra'): Promise<void>;
    private processRecording;
    private ensureRecordingsDir;
    getActiveStreams(): VideoStream[];
    getStreamStatistics(): any;
    cleanupInactiveStreams(): void;
    initialize(): Promise<void>;
}
//# sourceMappingURL=videoStreaming.d.ts.map