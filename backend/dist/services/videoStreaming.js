"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStreamingService = void 0;
const database_1 = require("@/services/database");
const logger_1 = require("@/utils/logger");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class VideoStreamingService {
    constructor(wsService, notificationService, fileService) {
        this.activeStreams = new Map();
        this.qualitySettings = {
            low: {
                name: 'Low (480p)',
                resolution: '854x480',
                fps: 15,
                bitrate: 500,
                codec: 'libx264',
            },
            medium: {
                name: 'Medium (720p)',
                resolution: '1280x720',
                fps: 30,
                bitrate: 1500,
                codec: 'libx264',
            },
            high: {
                name: 'High (1080p)',
                resolution: '1920x1080',
                fps: 30,
                bitrate: 3000,
                codec: 'libx264',
            },
            ultra: {
                name: 'Ultra (4K)',
                resolution: '3840x2160',
                fps: 30,
                bitrate: 8000,
                codec: 'libx265',
            },
        };
        this.wsService = wsService;
        this.notificationService = notificationService;
        this.fileService = fileService;
        this.recordingsDir = path_1.default.join(process.cwd(), 'recordings');
        this.ensureRecordingsDir();
    }
    static getInstance(wsService, notificationService, fileService) {
        if (!VideoStreamingService.instance) {
            VideoStreamingService.instance = new VideoStreamingService(wsService, notificationService, fileService);
        }
        return VideoStreamingService.instance;
    }
    async startStream(robotId, userId, cameraId, quality = 'medium') {
        try {
            const robot = await database_1.db.prisma.robot.findFirst({
                where: { id: robotId, ownerId: userId },
            });
            if (!robot) {
                throw new Error('Robot not found or access denied');
            }
            const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const qualityConfig = this.qualitySettings[quality];
            const stream = {
                streamId,
                robotId,
                userId,
                cameraId,
                quality,
                resolution: qualityConfig.resolution,
                fps: qualityConfig.fps,
                bitrate: qualityConfig.bitrate,
                isActive: true,
                startTime: new Date(),
                viewers: new Set([userId]),
                isRecording: false,
            };
            this.activeStreams.set(streamId, stream);
            this.wsService.sendToRobot(robotId, 'video:start', {
                streamId,
                cameraId,
                quality: qualityConfig,
            });
            await database_1.db.prisma.videoStream.create({
                data: {
                    id: streamId,
                    robotId,
                    userId,
                    cameraId,
                    quality,
                    resolution: qualityConfig.resolution,
                    fps: qualityConfig.fps,
                    bitrate: qualityConfig.bitrate,
                    startTime: stream.startTime,
                    isActive: true,
                },
            });
            (0, logger_1.logInfo)('Video stream started', {
                streamId,
                robotId,
                userId,
                cameraId,
                quality,
            });
            return stream;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Start video stream', robotId, userId });
            throw error;
        }
    }
    async stopStream(streamId, userId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            if (stream.userId !== userId) {
                throw new Error('Access denied');
            }
            stream.isActive = false;
            if (stream.isRecording) {
                await this.stopRecording(streamId, userId);
            }
            this.wsService.sendToRobot(stream.robotId, 'video:stop', {
                streamId,
                cameraId: stream.cameraId,
            });
            await database_1.db.prisma.videoStream.update({
                where: { id: streamId },
                data: {
                    isActive: false,
                    endTime: new Date(),
                },
            });
            stream.viewers.forEach(viewerId => {
                this.wsService.sendToUser(viewerId, 'video:stream-ended', {
                    streamId,
                    reason: 'stopped_by_owner',
                });
            });
            this.activeStreams.delete(streamId);
            (0, logger_1.logInfo)('Video stream stopped', { streamId, userId });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Stop video stream', streamId });
            throw error;
        }
    }
    async joinStream(streamId, userId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            if (!stream.isActive) {
                throw new Error('Stream is not active');
            }
            const robot = await database_1.db.prisma.robot.findFirst({
                where: {
                    id: stream.robotId,
                    OR: [
                        { ownerId: userId },
                        { sharedWith: { some: { userId } } },
                    ],
                },
            });
            if (!robot) {
                throw new Error('Access denied');
            }
            stream.viewers.add(userId);
            if (stream.userId !== userId) {
                await this.notificationService.createNotification({
                    userId: stream.userId,
                    title: 'New Stream Viewer',
                    message: `Someone joined your video stream for ${robot.name}`,
                    type: 'INFO',
                    data: { streamId, viewerId: userId, robotId: stream.robotId },
                });
            }
            (0, logger_1.logInfo)('User joined video stream', { streamId, userId, viewerCount: stream.viewers.size });
            return stream;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Join video stream', streamId, userId });
            throw error;
        }
    }
    leaveStream(streamId, userId) {
        const stream = this.activeStreams.get(streamId);
        if (stream) {
            stream.viewers.delete(userId);
            (0, logger_1.logInfo)('User left video stream', { streamId, userId, viewerCount: stream.viewers.size });
        }
    }
    async startRecording(streamId, userId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            if (stream.userId !== userId) {
                throw new Error('Only stream owner can start recording');
            }
            if (stream.isRecording) {
                throw new Error('Recording already in progress');
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `recording_${stream.robotId}_${stream.cameraId}_${timestamp}.mp4`;
            const recordingPath = path_1.default.join(this.recordingsDir, filename);
            stream.recordingPath = recordingPath;
            stream.isRecording = true;
            this.wsService.sendToRobot(stream.robotId, 'video:start-recording', {
                streamId,
                recordingPath,
                quality: this.qualitySettings[stream.quality],
            });
            await database_1.db.prisma.videoRecording.create({
                data: {
                    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    streamId,
                    robotId: stream.robotId,
                    userId,
                    filename,
                    filePath: recordingPath,
                    startTime: new Date(),
                    isActive: true,
                },
            });
            (0, logger_1.logInfo)('Recording started', { streamId, recordingPath });
            return recordingPath;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Start recording', streamId });
            throw error;
        }
    }
    async stopRecording(streamId, userId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            if (stream.userId !== userId) {
                throw new Error('Only stream owner can stop recording');
            }
            if (!stream.isRecording || !stream.recordingPath) {
                throw new Error('No active recording');
            }
            const recordingPath = stream.recordingPath;
            stream.isRecording = false;
            stream.recordingPath = undefined;
            this.wsService.sendToRobot(stream.robotId, 'video:stop-recording', {
                streamId,
            });
            await database_1.db.prisma.videoRecording.updateMany({
                where: {
                    streamId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                    endTime: new Date(),
                },
            });
            await this.processRecording(recordingPath, userId, stream.robotId);
            (0, logger_1.logInfo)('Recording stopped', { streamId, recordingPath });
            return recordingPath;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Stop recording', streamId });
            throw error;
        }
    }
    async getUserStreams(userId) {
        const streams = await database_1.db.prisma.videoStream.findMany({
            where: { userId },
            include: {
                robot: {
                    select: { name: true },
                },
            },
            orderBy: { startTime: 'desc' },
            take: 50,
        });
        return streams.map(stream => ({
            ...stream,
            isCurrentlyActive: this.activeStreams.has(stream.id),
            viewerCount: this.activeStreams.get(stream.id)?.viewers.size || 0,
        }));
    }
    async getUserRecordings(userId) {
        const recordings = await database_1.db.prisma.videoRecording.findMany({
            where: { userId },
            include: {
                robot: {
                    select: { name: true },
                },
            },
            orderBy: { startTime: 'desc' },
            take: 50,
        });
        return recordings;
    }
    async getRobotCameras(robotId, userId) {
        const robot = await database_1.db.prisma.robot.findFirst({
            where: { id: robotId, ownerId: userId },
        });
        if (!robot) {
            throw new Error('Robot not found or access denied');
        }
        const capabilities = robot.capabilities;
        const cameras = capabilities?.cameras || [];
        return cameras.map((camera) => ({
            cameraId: camera.id,
            name: camera.name,
            type: camera.type,
            resolution: camera.resolution,
            maxFps: camera.maxFps,
            capabilities: camera.capabilities,
            position: camera.position,
            orientation: camera.orientation,
        }));
    }
    async changeStreamQuality(streamId, userId, quality) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            if (stream.userId !== userId) {
                throw new Error('Only stream owner can change quality');
            }
            const qualityConfig = this.qualitySettings[quality];
            stream.quality = quality;
            stream.resolution = qualityConfig.resolution;
            stream.fps = qualityConfig.fps;
            stream.bitrate = qualityConfig.bitrate;
            this.wsService.sendToRobot(stream.robotId, 'video:change-quality', {
                streamId,
                quality: qualityConfig,
            });
            (0, logger_1.logInfo)('Stream quality changed', { streamId, quality });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Change stream quality', streamId });
            throw error;
        }
    }
    async processRecording(recordingPath, userId, robotId) {
        try {
            await promises_1.default.access(recordingPath);
            const stats = await promises_1.default.stat(recordingPath);
            const fileBuffer = await promises_1.default.readFile(recordingPath);
            const mockFile = {
                originalname: path_1.default.basename(recordingPath),
                mimetype: 'video/mp4',
                size: stats.size,
                path: recordingPath,
            };
            await this.fileService.uploadFile(mockFile, {
                userId,
                robotId,
                type: 'VIDEO',
                description: 'Robot video recording',
                isPublic: false,
            });
            (0, logger_1.logInfo)('Recording processed and uploaded', { recordingPath, userId, robotId });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Process recording', recordingPath });
        }
    }
    async ensureRecordingsDir() {
        try {
            await promises_1.default.access(this.recordingsDir);
        }
        catch {
            await promises_1.default.mkdir(this.recordingsDir, { recursive: true });
        }
    }
    getActiveStreams() {
        return Array.from(this.activeStreams.values());
    }
    getStreamStatistics() {
        const streams = Array.from(this.activeStreams.values());
        return {
            totalActiveStreams: streams.length,
            totalViewers: streams.reduce((total, stream) => total + stream.viewers.size, 0),
            recordingStreams: streams.filter(stream => stream.isRecording).length,
            qualityDistribution: streams.reduce((dist, stream) => {
                dist[stream.quality] = (dist[stream.quality] || 0) + 1;
                return dist;
            }, {}),
        };
    }
    cleanupInactiveStreams() {
        const now = new Date();
        const timeout = 60 * 60 * 1000;
        for (const [streamId, stream] of this.activeStreams.entries()) {
            const timeSinceStart = now.getTime() - stream.startTime.getTime();
            if (timeSinceStart > timeout && stream.viewers.size === 0) {
                this.stopStream(streamId, stream.userId);
            }
        }
    }
    async initialize() {
        setInterval(() => {
            this.cleanupInactiveStreams();
        }, 10 * 60 * 1000);
        (0, logger_1.logInfo)('Video streaming service initialized');
    }
}
exports.VideoStreamingService = VideoStreamingService;
//# sourceMappingURL=videoStreaming.js.map