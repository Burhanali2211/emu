"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const cloud_1 = require("@/controllers/cloud");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
const remoteSessionValidation = [
    (0, express_validator_1.body)('robotId')
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('deviceInfo')
        .isObject()
        .withMessage('Device info must be an object'),
];
const metricsValidation = [
    (0, express_validator_1.body)('metrics')
        .isArray({ min: 1 })
        .withMessage('Metrics must be a non-empty array'),
    (0, express_validator_1.body)('metrics.*.metricName')
        .notEmpty()
        .withMessage('Metric name is required'),
    (0, express_validator_1.body)('metrics.*.value')
        .isNumeric()
        .withMessage('Metric value must be numeric'),
    (0, express_validator_1.body)('metrics.*.unit')
        .notEmpty()
        .withMessage('Metric unit is required'),
];
const cloudNotificationValidation = [
    (0, express_validator_1.body)('topicArn')
        .notEmpty()
        .withMessage('Topic ARN is required'),
    (0, express_validator_1.body)('message')
        .notEmpty()
        .withMessage('Message is required'),
    (0, express_validator_1.body)('subject')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Subject must be less than 100 characters'),
];
const queueMessageValidation = [
    (0, express_validator_1.body)('queueUrl')
        .isURL()
        .withMessage('Queue URL must be a valid URL'),
    (0, express_validator_1.body)('message')
        .isObject()
        .withMessage('Message must be an object'),
];
router.post('/sync', cloud_1.CloudController.syncUserData);
router.get('/data', (0, express_validator_1.query)('dataType').notEmpty().withMessage('Data type is required'), (0, express_validator_1.query)('robotId').optional().isUUID().withMessage('Robot ID must be a valid UUID'), cloud_1.CloudController.getCloudData);
router.get('/sync-status', cloud_1.CloudController.getSyncStatus);
router.post('/force-sync', cloud_1.CloudController.forceSync);
router.post('/remote-session', remoteSessionValidation, cloud_1.CloudController.createRemoteSession);
router.delete('/remote-session/:sessionId', (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'), cloud_1.CloudController.endRemoteSession);
router.get('/remote-sessions', cloud_1.CloudController.getActiveSessions);
router.put('/remote-session/:sessionId/activity', (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'), cloud_1.CloudController.updateSessionActivity);
router.post('/metrics', metricsValidation, cloud_1.CloudController.publishMetrics);
router.post('/notification', auth_1.requireAdmin, cloudNotificationValidation, cloud_1.CloudController.sendCloudNotification);
router.post('/queue-message', auth_1.requireAdmin, queueMessageValidation, cloud_1.CloudController.sendQueueMessage);
router.get('/config', cloud_1.CloudController.getCloudConfig);
router.post('/test-connectivity', cloud_1.CloudController.testCloudConnectivity);
exports.default = router;
//# sourceMappingURL=cloud.js.map