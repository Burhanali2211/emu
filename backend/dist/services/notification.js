"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("@/services/database");
const email_1 = require("@/services/email");
const logger_1 = require("@/utils/logger");
class NotificationService {
    constructor(wsService) {
        this.wsService = wsService;
        this.emailService = new email_1.EmailService();
    }
    static getInstance(wsService) {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService(wsService);
        }
        return NotificationService.instance;
    }
    async createNotification(notificationData) {
        try {
            const notification = await database_1.db.prisma.notification.create({
                data: {
                    userId: notificationData.userId,
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type,
                    data: notificationData.data || {},
                },
            });
            const user = await database_1.db.prisma.user.findUnique({
                where: { id: notificationData.userId },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    preferences: true
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const preferences = user.preferences?.notifications || this.getDefaultPreferences();
            this.wsService.sendToUser(notificationData.userId, 'notification', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                data: notification.data,
                createdAt: notification.createdAt,
            });
            if (notificationData.sendEmail && preferences.emailAlerts) {
                await this.sendEmailNotification(user, notification);
            }
            if (notificationData.sendPush && preferences.pushNotifications) {
                await this.sendPushNotification(user, notification);
            }
            (0, logger_1.logInfo)('Notification created and sent', {
                notificationId: notification.id,
                userId: notificationData.userId,
                type: notificationData.type,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    async sendBulkNotification(userIds, title, message, type, data) {
        const promises = userIds.map(userId => this.createNotification({
            userId,
            title,
            message,
            type,
            data,
            sendEmail: type === 'ERROR' || type === 'WARNING',
            sendPush: true,
        }));
        await Promise.all(promises);
        (0, logger_1.logInfo)('Bulk notifications sent', { userCount: userIds.length, type });
    }
    async sendSystemNotification(title, message, type, data) {
        const users = await database_1.db.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true },
        });
        const userIds = users.map(user => user.id);
        await this.sendBulkNotification(userIds, title, message, type, data);
    }
    async sendRobotNotification(robotId, title, message, type, data) {
        const robot = await database_1.db.prisma.robot.findUnique({
            where: { id: robotId },
            select: { ownerId: true, name: true },
        });
        if (!robot) {
            throw new Error('Robot not found');
        }
        await this.createNotification({
            userId: robot.ownerId,
            title: `${robot.name}: ${title}`,
            message,
            type,
            data: { robotId, robotName: robot.name, ...data },
            sendEmail: type === 'ERROR' || type === 'WARNING',
            sendPush: true,
        });
    }
    async sendSecurityAlert(userId, event, details) {
        await this.createNotification({
            userId,
            title: 'Security Alert',
            message: `Security event detected: ${event}`,
            type: 'WARNING',
            data: { event, details, timestamp: new Date().toISOString() },
            sendEmail: true,
            sendPush: true,
        });
    }
    async sendMaintenanceNotification(title, message, scheduledTime) {
        await this.sendSystemNotification(title, message, 'INFO', {
            category: 'maintenance',
            scheduledTime: scheduledTime?.toISOString(),
        });
    }
    async getUserNotifications(userId, limit = 50, offset = 0, unreadOnly = false) {
        const where = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }
        const [notifications, totalCount, unreadCount] = await Promise.all([
            database_1.db.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            database_1.db.prisma.notification.count({ where: { userId } }),
            database_1.db.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            notifications,
            totalCount,
            unreadCount,
            hasMore: offset + limit < totalCount,
        };
    }
    async markAsRead(notificationId, userId) {
        await database_1.db.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
        (0, logger_1.logInfo)('Notification marked as read', { notificationId, userId });
    }
    async markAllAsRead(userId) {
        const result = await database_1.db.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        (0, logger_1.logInfo)('All notifications marked as read', { userId, count: result.count });
    }
    async deleteNotification(notificationId, userId) {
        await database_1.db.prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
        (0, logger_1.logInfo)('Notification deleted', { notificationId, userId });
    }
    async updatePreferences(userId, preferences) {
        await database_1.db.prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    notifications: preferences,
                },
            },
        });
        (0, logger_1.logInfo)('Notification preferences updated', { userId });
    }
    async getPreferences(userId) {
        const user = await database_1.db.prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true },
        });
        return user?.preferences?.notifications || this.getDefaultPreferences();
    }
    async sendEmailNotification(user, notification) {
        try {
            const subject = `Robot Platform: ${notification.title}`;
            const html = this.generateEmailTemplate(user, notification);
            await this.emailService.sendEmail({
                to: user.email,
                subject,
                html,
            });
            (0, logger_1.logInfo)('Email notification sent', {
                userId: user.id,
                email: user.email,
                notificationId: notification.id,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send email notification:', error);
        }
    }
    async sendPushNotification(user, notification) {
        try {
            (0, logger_1.logInfo)('Push notification would be sent', {
                userId: user.id,
                notificationId: notification.id,
                title: notification.title,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send push notification:', error);
        }
    }
    generateEmailTemplate(user, notification) {
        const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email;
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Robot Platform Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .notification { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; }
            .type-info { border-left: 4px solid #3b82f6; }
            .type-warning { border-left: 4px solid #f59e0b; }
            .type-error { border-left: 4px solid #ef4444; }
            .type-success { border-left: 4px solid #10b981; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Robot Platform</h1>
              <p>Notification Alert</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <div class="notification type-${notification.type.toLowerCase()}">
                <h3>${notification.title}</h3>
                <p>${notification.message}</p>
                <small>Received: ${new Date(notification.createdAt).toLocaleString()}</small>
              </div>
              <p>You can view all your notifications by logging into the Robot Platform dashboard.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Robot Platform. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    getDefaultPreferences() {
        return {
            emailAlerts: true,
            pushNotifications: true,
            robotAlerts: true,
            systemUpdates: true,
            securityAlerts: true,
            maintenanceAlerts: true,
        };
    }
    async cleanupOldNotifications(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await database_1.db.prisma.notification.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
                isRead: true,
            },
        });
        (0, logger_1.logInfo)('Old notifications cleaned up', { deletedCount: result.count });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.js.map