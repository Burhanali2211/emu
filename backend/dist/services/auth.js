"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("@/services/database");
const environment_1 = require("@/config/environment");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class AuthService {
    static generateTokens(user, sessionId) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            sessionId,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, environment_1.config.jwt.secret, { expiresIn: environment_1.config.jwt.expiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, sessionId }, environment_1.config.jwt.refreshSecret, { expiresIn: environment_1.config.jwt.refreshExpiresIn });
        const expiresIn = this.getTokenExpirationTime(environment_1.config.jwt.expiresIn);
        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        }
        catch (error) {
            throw new errorHandler_1.CustomError('Invalid or expired token', 401);
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, environment_1.config.jwt.refreshSecret);
        }
        catch (error) {
            throw new errorHandler_1.CustomError('Invalid or expired refresh token', 401);
        }
    }
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, environment_1.config.security.bcryptRounds);
    }
    static async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    static async register(data) {
        const existingUser = await database_1.db.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { username: data.username },
                ],
            },
        });
        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new errorHandler_1.CustomError('Email already registered', 400);
            }
            if (existingUser.username === data.username) {
                throw new errorHandler_1.CustomError('Username already taken', 400);
            }
        }
        const hashedPassword = await this.hashPassword(data.password);
        const user = await database_1.db.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
            },
        });
        const session = await this.createSession(user.id);
        const tokens = this.generateTokens(user, session.id);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        (0, logger_1.logSecurity)('User registered', { userId: user.id, email: user.email });
        return { user, tokens };
    }
    static async login(data) {
        const user = await database_1.db.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            (0, logger_1.logSecurity)('Login attempt with invalid email', { email: data.email, ip: data.ipAddress });
            throw new errorHandler_1.CustomError('Invalid credentials', 401);
        }
        if (!user.isActive) {
            (0, logger_1.logSecurity)('Login attempt with inactive account', { userId: user.id, email: user.email });
            throw new errorHandler_1.CustomError('Account is deactivated', 401);
        }
        const isPasswordValid = await this.comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            (0, logger_1.logSecurity)('Login attempt with invalid password', { userId: user.id, email: user.email, ip: data.ipAddress });
            throw new errorHandler_1.CustomError('Invalid credentials', 401);
        }
        const session = await this.createSession(user.id, data.ipAddress, data.userAgent);
        const tokens = this.generateTokens(user, session.id);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        await database_1.db.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        (0, logger_1.logSecurity)('User logged in', { userId: user.id, email: user.email, sessionId: session.id });
        return { user, tokens };
    }
    static async refreshTokens(refreshToken) {
        const { userId, sessionId } = this.verifyRefreshToken(refreshToken);
        const storedToken = await database_1.db.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
            throw new errorHandler_1.CustomError('Invalid or expired refresh token', 401);
        }
        const [user, session] = await Promise.all([
            database_1.db.prisma.user.findUnique({ where: { id: userId } }),
            database_1.db.prisma.session.findUnique({ where: { id: sessionId } }),
        ]);
        if (!user || !user.isActive) {
            throw new errorHandler_1.CustomError('User not found or inactive', 401);
        }
        if (!session || !session.isActive || session.expiresAt < new Date()) {
            throw new errorHandler_1.CustomError('Session expired', 401);
        }
        const tokens = this.generateTokens(user, sessionId);
        await Promise.all([
            database_1.db.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { isRevoked: true },
            }),
            this.storeRefreshToken(userId, tokens.refreshToken),
        ]);
        (0, logger_1.logInfo)('Tokens refreshed', { userId, sessionId });
        return tokens;
    }
    static async logout(sessionId, refreshToken) {
        await database_1.db.prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
        if (refreshToken) {
            await database_1.db.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { isRevoked: true },
            });
        }
        (0, logger_1.logSecurity)('User logged out', { sessionId });
    }
    static async createSession(userId, ipAddress, userAgent) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return database_1.db.prisma.session.create({
            data: {
                userId,
                token: crypto_1.default.randomBytes(32).toString('hex'),
                expiresAt,
                ipAddress,
                userAgent,
            },
            select: { id: true, expiresAt: true },
        });
    }
    static async storeRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await database_1.db.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }
    static getTokenExpirationTime(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 3600;
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 3600;
        }
    }
    static generateResetToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    static generateVerificationToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map