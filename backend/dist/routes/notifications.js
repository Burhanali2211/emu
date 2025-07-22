"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const notification_1 = require("@/controllers/notification");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
const createNotificationValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),
    (0, express_validator_1.body)('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 1000 })
        .withMessage('Message must be less than 1000 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])
        .withMessage('Type must be INFO, WARNING, ERROR, or SUCCESS'),
    (0, express_validator_1.body)('userId')
        .optional()
        .isUUID()
        .withMessage('User ID must be a valid UUID'),
    (0, express_validator_1.body)('data')
        .optional()
        .isObject()
        .withMessage('Data must be an object'),
    (0, express_validator_1.body)('sendEmail')
        .optional()
        .isBoolean()
        .withMessage('Send email must be a boolean'),
    (0, express_validator_1.body)('sendPush')
        .optional()
        .isBoolean()
        .withMessage('Send push must be a boolean'),
];
const bulkNotificationValidation = [
    (0, express_validator_1.body)('userIds')
        .isArray({ min: 1 })
        .withMessage('User IDs must be a non-empty array'),
    (0, express_validator_1.body)('userIds.*')
        .isUUID()
        .withMessage('Each user ID must be a valid UUID'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required'),
    (0, express_validator_1.body)('message')
        .notEmpty()
        .withMessage('Message is required'),
    (0, express_validator_1.body)('type')
        .isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])
        .withMessage('Type must be INFO, WARNING, ERROR, or SUCCESS'),
];
const systemNotificationValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required'),
    (0, express_validator_1.body)('message')
        .notEmpty()
        .withMessage('Message is required'),
    (0, express_validator_1.body)('type')
        .isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])
        .withMessage('Type must be INFO, WARNING, ERROR, or SUCCESS'),
];
const robotNotificationValidation = [
    (0, express_validator_1.body)('robotId')
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required'),
    (0, express_validator_1.body)('message')
        .notEmpty()
        .withMessage('Message is required'),
    (0, express_validator_1.body)('type')
        .isIn(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])
        .withMessage('Type must be INFO, WARNING, ERROR, or SUCCESS'),
];
const preferencesValidation = [
    (0, express_validator_1.body)('emailAlerts')
        .isBoolean()
        .withMessage('Email alerts must be a boolean'),
    (0, express_validator_1.body)('pushNotifications')
        .isBoolean()
        .withMessage('Push notifications must be a boolean'),
    (0, express_validator_1.body)('robotAlerts')
        .isBoolean()
        .withMessage('Robot alerts must be a boolean'),
    (0, express_validator_1.body)('systemUpdates')
        .isBoolean()
        .withMessage('System updates must be a boolean'),
    (0, express_validator_1.body)('securityAlerts')
        .isBoolean()
        .withMessage('Security alerts must be a boolean'),
    (0, express_validator_1.body)('maintenanceAlerts')
        .isBoolean()
        .withMessage('Maintenance alerts must be a boolean'),
];
router.get('/', notification_1.NotificationController.getNotifications);
router.get('/count', notification_1.NotificationController.getUnreadCount);
router.put('/:id/read', (0, express_validator_1.param)('id').isUUID().withMessage('Notification ID must be a valid UUID'), notification_1.NotificationController.markAsRead);
router.put('/read-all', notification_1.NotificationController.markAllAsRead);
router.delete('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('Notification ID must be a valid UUID'), notification_1.NotificationController.deleteNotification);
router.get('/preferences', notification_1.NotificationController.getPreferences);
router.put('/preferences', preferencesValidation, notification_1.NotificationController.updatePreferences);
router.post('/test', notification_1.NotificationController.sendTestNotification);
router.post('/', auth_1.requireAdmin, createNotificationValidation, notification_1.NotificationController.createNotification);
router.post('/bulk', auth_1.requireAdmin, bulkNotificationValidation, notification_1.NotificationController.sendBulkNotification);
router.post('/system', auth_1.requireAdmin, systemNotificationValidation, notification_1.NotificationController.sendSystemNotification);
router.get('/statistics', auth_1.requireAdmin, notification_1.NotificationController.getStatistics);
router.post('/robot', robotNotificationValidation, notification_1.NotificationController.sendRobotNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map