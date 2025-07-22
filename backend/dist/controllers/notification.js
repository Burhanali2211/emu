"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = exports.initializeNotificationController = void 0;
const express_validator_1 = require("express-validator");
const notification_1 = require("@/services/notification");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
let notificationService;
const initializeNotificationController = (wsService) => {
    notificationService = notification_1.NotificationService.getInstance(wsService);
};
exports.initializeNotificationController = initializeNotificationController;
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
NotificationController.getNotifications = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, parseInt(limit), parseInt(offset), unreadOnly === 'true');
    res.json({
        status: 'success',
        data: result,
    });
});
NotificationController.getUnreadCount = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const result = await notificationService.getUserNotifications(req.user.id, 1, 0, true);
    res.json({
        status: 'success',
        data: { count: result.unreadCount },
    });
});
NotificationController.markAsRead = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);
    res.json({
        status: 'success',
        message: 'Notification marked as read',
    });
});
NotificationController.markAllAsRead = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    await notificationService.markAllAsRead(req.user.id);
    res.json({
        status: 'success',
        message: 'All notifications marked as read',
    });
});
NotificationController.deleteNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user.id);
    res.json({
        status: 'success',
        message: 'Notification deleted',
    });
});
NotificationController.createNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { userId, title, message, type, data, sendEmail, sendPush } = req.body;
    const targetUserId = userId || req.user.id;
    await notificationService.createNotification({
        userId: targetUserId,
        title,
        message,
        type,
        data,
        sendEmail,
        sendPush,
    });
    (0, logger_1.logInfo)('Notification created', {
        createdBy: req.user.id,
        targetUserId,
        type,
    });
    res.status(201).json({
        status: 'success',
        message: 'Notification created successfully',
    });
});
NotificationController.sendBulkNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { userIds, title, message, type, data } = req.body;
    await notificationService.sendBulkNotification(userIds, title, message, type, data);
    (0, logger_1.logInfo)('Bulk notification sent', {
        sentBy: req.user.id,
        userCount: userIds.length,
        type,
    });
    res.json({
        status: 'success',
        message: `Notification sent to ${userIds.length} users`,
    });
});
NotificationController.sendSystemNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { title, message, type, data } = req.body;
    await notificationService.sendSystemNotification(title, message, type, data);
    (0, logger_1.logInfo)('System notification sent', {
        sentBy: req.user.id,
        type,
    });
    res.json({
        status: 'success',
        message: 'System notification sent to all users',
    });
});
NotificationController.sendRobotNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { robotId, title, message, type, data } = req.body;
    await notificationService.sendRobotNotification(robotId, title, message, type, data);
    (0, logger_1.logInfo)('Robot notification sent', {
        sentBy: req.user.id,
        robotId,
        type,
    });
    res.json({
        status: 'success',
        message: 'Robot notification sent',
    });
});
NotificationController.getPreferences = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const preferences = await notificationService.getPreferences(req.user.id);
    res.json({
        status: 'success',
        data: { preferences },
    });
});
NotificationController.updatePreferences = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const preferences = req.body;
    await notificationService.updatePreferences(req.user.id, preferences);
    (0, logger_1.logInfo)('Notification preferences updated', { userId: req.user.id });
    res.json({
        status: 'success',
        message: 'Notification preferences updated',
    });
});
NotificationController.sendTestNotification = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    await notificationService.createNotification({
        userId: req.user.id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working correctly.',
        type: 'INFO',
        data: { test: true, timestamp: new Date().toISOString() },
        sendEmail: false,
        sendPush: true,
    });
    res.json({
        status: 'success',
        message: 'Test notification sent',
    });
});
NotificationController.getStatistics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const stats = {
        totalNotifications: 1247,
        unreadNotifications: 89,
        notificationsByType: {
            INFO: 856,
            WARNING: 234,
            ERROR: 89,
            SUCCESS: 68,
        },
        notificationsLast24h: 45,
        emailsSent: 234,
        pushNotificationsSent: 1013,
    };
    res.json({
        status: 'success',
        data: { statistics: stats },
    });
});
//# sourceMappingURL=notification.js.map