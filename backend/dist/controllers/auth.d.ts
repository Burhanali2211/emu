import { Request, Response } from 'express';
export declare class AuthController {
    static register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static refreshTokens: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static requestPasswordReset: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getSessions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static revokeSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=auth.d.ts.map