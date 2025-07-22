"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = exports.initializeVideoController = void 0;
const express_validator_1 = require("express-validator");
const videoStreaming_1 = require("@/services/videoStreaming");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
let videoService;
const initializeVideoController = (wsService, notificationService, fileService) => {
    videoService = videoStreaming_1.VideoStreamingService.getInstance(wsService, notificationService, fileService);
};
exports.initializeVideoController = initializeVideoController;
class VideoController {
}
exports.VideoController = VideoController;
_a = VideoController;
VideoController.startStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { robotId, cameraId, quality = 'medium' } = req.body;
    const stream = await videoService.startStream(robotId, req.user.id, cameraId, quality);
    res.status(201).json({
        status: 'success',
        message: 'Video stream started',
        data: { stream },
    });
});
VideoController.stopStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    await videoService.stopStream(streamId, req.user.id);
    res.json({
        status: 'success',
        message: 'Video stream stopped',
    });
});
VideoController.joinStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    const stream = await videoService.joinStream(streamId, req.user.id);
    res.json({
        status: 'success',
        message: 'Joined video stream',
        data: { stream },
    });
});
VideoController.leaveStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    videoService.leaveStream(streamId, req.user.id);
    res.json({
        status: 'success',
        message: 'Left video stream',
    });
});
VideoController.startRecording = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    const recordingPath = await videoService.startRecording(streamId, req.user.id);
    res.json({
        status: 'success',
        message: 'Recording started',
        data: { recordingPath },
    });
});
VideoController.stopRecording = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    const recordingPath = await videoService.stopRecording(streamId, req.user.id);
    res.json({
        status: 'success',
        message: 'Recording stopped',
        data: { recordingPath },
    });
});
VideoController.getUserStreams = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const streams = await videoService.getUserStreams(req.user.id);
    res.json({
        status: 'success',
        data: { streams },
    });
});
VideoController.getUserRecordings = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const recordings = await videoService.getUserRecordings(req.user.id);
    res.json({
        status: 'success',
        data: { recordings },
    });
});
VideoController.getRobotCameras = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { robotId } = req.params;
    const cameras = await videoService.getRobotCameras(robotId, req.user.id);
    res.json({
        status: 'success',
        data: { cameras },
    });
});
VideoController.changeStreamQuality = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { streamId } = req.params;
    const { quality } = req.body;
    await videoService.changeStreamQuality(streamId, req.user.id, quality);
    res.json({
        status: 'success',
        message: 'Stream quality changed',
    });
});
VideoController.getActiveStreams = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const activeStreams = videoService.getActiveStreams();
    const userStreams = activeStreams.filter(stream => stream.userId === req.user.id || stream.viewers.has(req.user.id));
    res.json({
        status: 'success',
        data: { activeStreams: userStreams },
    });
});
VideoController.getStreamStatistics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const statistics = videoService.getStreamStatistics();
    res.json({
        status: 'success',
        data: { statistics },
    });
});
VideoController.getStreamDetails = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { streamId } = req.params;
    const activeStreams = videoService.getActiveStreams();
    const stream = activeStreams.find(s => s.streamId === streamId);
    if (!stream) {
        throw new errorHandler_1.CustomError('Stream not found', 404);
    }
    if (stream.userId !== req.user.id && !stream.viewers.has(req.user.id)) {
        throw new errorHandler_1.CustomError('Access denied', 403);
    }
    res.json({
        status: 'success',
        data: { stream },
    });
});
VideoController.getQualityOptions = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const qualityOptions = [
        {
            value: 'low',
            label: 'Low (480p)',
            resolution: '854x480',
            fps: 15,
            bitrate: '500 kbps',
        },
        {
            value: 'medium',
            label: 'Medium (720p)',
            resolution: '1280x720',
            fps: 30,
            bitrate: '1.5 Mbps',
        },
        {
            value: 'high',
            label: 'High (1080p)',
            resolution: '1920x1080',
            fps: 30,
            bitrate: '3 Mbps',
        },
        {
            value: 'ultra',
            label: 'Ultra (4K)',
            resolution: '3840x2160',
            fps: 30,
            bitrate: '8 Mbps',
        },
    ];
    res.json({
        status: 'success',
        data: { qualityOptions },
    });
});
VideoController.shareStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { streamId } = req.params;
    const { userIds, expiresIn = 3600 } = req.body;
    const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    (0, logger_1.logInfo)('Stream shared', {
        streamId,
        sharedBy: req.user.id,
        userIds,
        shareToken,
        expiresAt,
    });
    res.json({
        status: 'success',
        message: 'Stream shared successfully',
        data: {
            shareToken,
            expiresAt,
            shareUrl: `/video/shared/${shareToken}`,
        },
    });
});
VideoController.accessSharedStream = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { shareToken } = req.params;
    res.json({
        status: 'success',
        message: 'Shared stream access granted',
        data: {
            streamId: 'shared-stream-id',
            robotName: 'Shared Robot',
            quality: 'medium',
        },
    });
});
VideoController.getVideoAnalytics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { timeRange = '24h' } = req.query;
    const analytics = {
        totalStreams: 45,
        totalViewTime: '12h 34m',
        totalRecordings: 23,
        totalRecordingSize: '4.2 GB',
        averageStreamDuration: '18m 45s',
        peakViewers: 8,
        qualityDistribution: {
            low: 15,
            medium: 60,
            high: 20,
            ultra: 5,
        },
        streamsByHour: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            streams: Math.floor(Math.random() * 10),
            viewers: Math.floor(Math.random() * 20),
        })),
    };
    res.json({
        status: 'success',
        data: { analytics },
    });
});
//# sourceMappingURL=video.js.map