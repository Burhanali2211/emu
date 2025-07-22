import { Request, Response } from 'express';
export declare class FileController {
    static uploadFile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static uploadMultipleFiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getUserFiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getFile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getFileUrl: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteFile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getFileStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateFile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getRobotFiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static searchFiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getFileTypes: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static bulkDeleteFiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=file.d.ts.map