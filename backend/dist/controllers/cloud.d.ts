import { Request, Response } from 'express';
import { NotificationService } from '@/services/notification';
export declare const initializeCloudController: (notificationService: NotificationService) => void;
export declare class CloudController {
    static syncUserData: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getCloudData: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createRemoteSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static endRemoteSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getActiveSessions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateSessionActivity: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static publishMetrics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendCloudNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendQueueMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSyncStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static forceSync: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getCloudConfig: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static testCloudConnectivity: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=cloud.d.ts.map