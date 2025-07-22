import { User, UserRole } from '@prisma/client';
export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    sessionId: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export interface LoginData {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuthService {
    static generateTokens(user: User, sessionId: string): AuthTokens;
    static verifyToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): {
        userId: string;
        sessionId: string;
    };
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    static register(data: RegisterData): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    static login(data: LoginData): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    static refreshTokens(refreshToken: string): Promise<AuthTokens>;
    static logout(sessionId: string, refreshToken?: string): Promise<void>;
    private static createSession;
    private static storeRefreshToken;
    private static getTokenExpirationTime;
    static generateResetToken(): string;
    static generateVerificationToken(): string;
}
//# sourceMappingURL=auth.d.ts.map