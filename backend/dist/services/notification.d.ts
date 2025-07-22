import { NotificationType } from '@prisma/client';
import { WebSocketService } from '@/services/websocket';
export interface NotificationData {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
    sendEmail?: boolean;
    sendPush?: boolean;
}
export interface NotificationPreferences {
    emailAlerts: boolean;
    pushNotifications: boolean;
    robotAlerts: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
    maintenanceAlerts: boolean;
}
export declare class NotificationService {
    private static instance;
    private wsService;
    private emailService;
    constructor(wsService: WebSocketService);
    static getInstance(wsService: WebSocketService): NotificationService;
    createNotification(notificationData: NotificationData): Promise<void>;
    sendBulkNotification(userIds: string[], title: string, message: string, type: NotificationType, data?: any): Promise<void>;
    sendSystemNotification(title: string, message: string, type: NotificationType, data?: any): Promise<void>;
    sendRobotNotification(robotId: string, title: string, message: string, type: NotificationType, data?: any): Promise<void>;
    sendSecurityAlert(userId: string, event: string, details: any): Promise<void>;
    sendMaintenanceNotification(title: string, message: string, scheduledTime?: Date): Promise<void>;
    getUserNotifications(userId: string, limit?: number, offset?: number, unreadOnly?: boolean): Promise<{
        notifications: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            userId: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            isRead: boolean;
        }[];
        totalCount: number;
        unreadCount: number;
        hasMore: boolean;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>;
    getPreferences(userId: string): Promise<NotificationPreferences>;
    private sendEmailNotification;
    private sendPushNotification;
    private generateEmailTemplate;
    private getDefaultPreferences;
    cleanupOldNotifications(daysToKeep?: number): Promise<void>;
}
//# sourceMappingURL=notification.d.ts.map