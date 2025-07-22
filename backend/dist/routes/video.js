"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const video_1 = require("@/controllers/video");
const router = (0, express_1.Router)();
const startStreamValidation = [
    (0, express_validator_1.body)('robotId')
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('cameraId')
        .notEmpty()
        .withMessage('Camera ID is required'),
    (0, express_validator_1.body)('quality')
        .optional()
        .isIn(['low', 'medium', 'high', 'ultra'])
        .withMessage('Quality must be low, medium, high, or ultra'),
];
const qualityChangeValidation = [
    (0, express_validator_1.param)('streamId')
        .notEmpty()
        .withMessage('Stream ID is required'),
    (0, express_validator_1.body)('quality')
        .isIn(['low', 'medium', 'high', 'ultra'])
        .withMessage('Quality must be low, medium, high, or ultra'),
];
const shareStreamValidation = [
    (0, express_validator_1.param)('streamId')
        .notEmpty()
        .withMessage('Stream ID is required'),
    (0, express_validator_1.body)('userIds')
        .optional()
        .isArray()
        .withMessage('User IDs must be an array'),
    (0, express_validator_1.body)('userIds.*')
        .optional()
        .isUUID()
        .withMessage('Each user ID must be a valid UUID'),
    (0, express_validator_1.body)('expiresIn')
        .optional()
        .isInt({ min: 60, max: 86400 })
        .withMessage('Expires in must be between 60 and 86400 seconds'),
];
router.post('/stream', startStreamValidation, video_1.VideoController.startStream);
router.delete('/stream/:streamId', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.stopStream);
router.post('/stream/:streamId/join', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.joinStream);
router.post('/stream/:streamId/leave', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.leaveStream);
router.get('/stream/:streamId', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.getStreamDetails);
router.put('/stream/:streamId/quality', qualityChangeValidation, video_1.VideoController.changeStreamQuality);
router.post('/stream/:streamId/recording/start', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.startRecording);
router.post('/stream/:streamId/recording/stop', (0, express_validator_1.param)('streamId').notEmpty().withMessage('Stream ID is required'), video_1.VideoController.stopRecording);
router.get('/streams', video_1.VideoController.getUserStreams);
router.get('/recordings', video_1.VideoController.getUserRecordings);
router.get('/active-streams', video_1.VideoController.getActiveStreams);
router.get('/robot/:robotId/cameras', (0, express_validator_1.param)('robotId').isUUID().withMessage('Robot ID must be a valid UUID'), video_1.VideoController.getRobotCameras);
router.post('/stream/:streamId/share', shareStreamValidation, video_1.VideoController.shareStream);
router.get('/shared/:shareToken', (0, express_validator_1.param)('shareToken').notEmpty().withMessage('Share token is required'), video_1.VideoController.accessSharedStream);
router.get('/quality-options', video_1.VideoController.getQualityOptions);
router.get('/statistics', video_1.VideoController.getStreamStatistics);
router.get('/analytics', (0, express_validator_1.query)('timeRange').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Time range must be 1h, 24h, 7d, or 30d'), video_1.VideoController.getVideoAnalytics);
exports.default = router;
//# sourceMappingURL=video.js.map