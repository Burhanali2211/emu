import { Request, Response } from 'express';
import { WebSocketService } from '@/services/websocket';
export declare const initializeNotificationController: (wsService: WebSocketService) => void;
export declare class NotificationController {
    static getNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getUnreadCount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static markAllAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendBulkNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendSystemNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendRobotNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getPreferences: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updatePreferences: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendTestNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=notification.d.ts.map