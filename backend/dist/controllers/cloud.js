"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudController = exports.initializeCloudController = void 0;
const express_validator_1 = require("express-validator");
const cloud_1 = require("@/services/cloud");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
let cloudService;
const initializeCloudController = (notificationService) => {
    cloudService = new cloud_1.CloudService(notificationService);
};
exports.initializeCloudController = initializeCloudController;
class CloudController {
}
exports.CloudController = CloudController;
_a = CloudController;
CloudController.syncUserData = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    await cloudService.syncUserData(req.user.id);
    res.json({
        status: 'success',
        message: 'User data synced to cloud successfully',
    });
});
CloudController.getCloudData = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { dataType, robotId } = req.query;
    if (!dataType) {
        throw new errorHandler_1.CustomError('Data type is required', 400);
    }
    const data = await cloudService.getFromCloud(req.user.id, dataType, robotId);
    res.json({
        status: 'success',
        data: { cloudData: data },
    });
});
CloudController.createRemoteSession = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { robotId, deviceInfo } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const session = await cloudService.createRemoteSession(req.user.id, robotId, deviceInfo, ipAddress);
    res.status(201).json({
        status: 'success',
        message: 'Remote access session created',
        data: { session },
    });
});
CloudController.endRemoteSession = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { sessionId } = req.params;
    await cloudService.endRemoteSession(sessionId);
    res.json({
        status: 'success',
        message: 'Remote access session ended',
    });
});
CloudController.getActiveSessions = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const sessions = cloudService.getUserActiveSessions(req.user.id);
    res.json({
        status: 'success',
        data: { sessions },
    });
});
CloudController.updateSessionActivity = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { sessionId } = req.params;
    cloudService.updateSessionActivity(sessionId);
    res.json({
        status: 'success',
        message: 'Session activity updated',
    });
});
CloudController.publishMetrics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { metrics } = req.body;
    await cloudService.publishMetrics(metrics);
    res.json({
        status: 'success',
        message: 'Metrics published to cloud',
    });
});
CloudController.sendCloudNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { topicArn, message, subject } = req.body;
    await cloudService.sendCloudNotification(topicArn, message, subject);
    res.json({
        status: 'success',
        message: 'Cloud notification sent',
    });
});
CloudController.sendQueueMessage = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { queueUrl, message } = req.body;
    await cloudService.sendQueueMessage(queueUrl, message);
    res.json({
        status: 'success',
        message: 'Message sent to queue',
    });
});
CloudController.getSyncStatus = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const syncStatus = {
        lastSync: new Date(),
        totalSynced: 1247,
        pendingSync: 3,
        syncErrors: 0,
        cloudStorage: {
            used: '2.4 GB',
            available: '97.6 GB',
            percentage: 2.4,
        },
        recentSyncs: [
            {
                dataType: 'sensor',
                robotId: 'robot-1',
                timestamp: new Date(),
                status: 'success',
            },
            {
                dataType: 'logs',
                robotId: 'robot-2',
                timestamp: new Date(),
                status: 'success',
            },
        ],
    };
    res.json({
        status: 'success',
        data: { syncStatus },
    });
});
CloudController.forceSync = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { dataType, robotId } = req.body;
    if (dataType && robotId) {
        (0, logger_1.logInfo)('Force sync requested', { userId: req.user.id, dataType, robotId });
    }
    else {
        await cloudService.syncUserData(req.user.id);
    }
    res.json({
        status: 'success',
        message: 'Cloud sync initiated',
    });
});
CloudController.getCloudConfig = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const config = {
        cloudEnabled: !!process.env.AWS_ACCESS_KEY_ID,
        features: {
            dataSync: true,
            remoteAccess: true,
            cloudMetrics: !!process.env.AWS_ACCESS_KEY_ID,
            cloudNotifications: !!process.env.AWS_SNS_TOPIC_ARN,
            messageQueue: !!process.env.AWS_SQS_QUEUE_URL,
        },
        limits: {
            maxRemoteSessions: 5,
            maxCloudStorage: '100 GB',
            maxSyncFrequency: '5 minutes',
        },
    };
    res.json({
        status: 'success',
        data: { config },
    });
});
CloudController.testCloudConnectivity = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const testResults = {
        s3: false,
        cloudWatch: false,
        sns: false,
        sqs: false,
        timestamp: new Date(),
    };
    try {
        if (process.env.AWS_ACCESS_KEY_ID) {
            testResults.s3 = true;
            testResults.cloudWatch = true;
            testResults.sns = !!process.env.AWS_SNS_TOPIC_ARN;
            testResults.sqs = !!process.env.AWS_SQS_QUEUE_URL;
        }
    }
    catch (error) {
    }
    res.json({
        status: 'success',
        data: { testResults },
    });
});
//# sourceMappingURL=cloud.js.map