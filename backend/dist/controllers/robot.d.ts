import { Request, Response } from 'express';
import { WebSocketService } from '@/services/websocket';
import { NotificationService } from '@/services/notification';
export declare const initializeRobotController: (wsService: WebSocketService, notificationService: NotificationService) => void;
export declare class RobotController {
    static getUserRobots: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createRobot: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getRobotDetails: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateRobot: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteRobot: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendCommand: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendBulkCommand: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSensorData: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getRobotLogs: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createRobotGroup: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getRobotGroups: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static sendGroupCommand: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static emergencyStopAll: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getPlatformStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateHeartbeat: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getConnectedRobots: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=robot.d.ts.map