import { Request, Response } from 'express';
import { WebSocketService } from '@/services/websocket';
import { NotificationService } from '@/services/notification';
import { FileService } from '@/services/file';
export declare const initializeVideoController: (wsService: WebSocketService, notificationService: NotificationService, fileService: FileService) => void;
export declare class VideoController {
    static startStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static stopStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static joinStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static leaveStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static startRecording: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static stopRecording: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getUserStreams: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getUserRecordings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getRobotCameras: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static changeStreamQuality: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getActiveStreams: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getStreamStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getStreamDetails: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getQualityOptions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static shareStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static accessSharedStream: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getVideoAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=video.d.ts.map