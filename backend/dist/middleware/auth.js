"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimit = exports.requireOwnership = exports.optionalAuth = exports.requireModerator = exports.requireAdmin = exports.requireRole = exports.authMiddleware = void 0;
const auth_1 = require("@/services/auth");
const database_1 = require("@/services/database");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const client_1 = require("@prisma/client");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.CustomError('Access token required', 401);
        }
        const token = authHeader.substring(7);
        const payload = auth_1.AuthService.verifyToken(token);
        const session = await database_1.db.prisma.session.findUnique({
            where: { id: payload.sessionId },
            include: { user: true },
        });
        if (!session || !session.isActive || session.expiresAt < new Date()) {
            (0, logger_1.logSecurity)('Attempt to use expired or invalid session', {
                sessionId: payload.sessionId,
                userId: payload.userId,
            });
            throw new errorHandler_1.CustomError('Session expired', 401);
        }
        if (!session.user.isActive) {
            (0, logger_1.logSecurity)('Attempt to access with inactive user account', {
                userId: payload.userId,
                email: payload.email,
            });
            throw new errorHandler_1.CustomError('Account is deactivated', 401);
        }
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            sessionId: payload.sessionId,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandler_1.CustomError('Authentication required', 401);
        }
        if (!roles.includes(req.user.role)) {
            (0, logger_1.logSecurity)('Unauthorized access attempt', {
                userId: req.user.id,
                requiredRoles: roles,
                userRole: req.user.role,
                endpoint: req.originalUrl,
            });
            throw new errorHandler_1.CustomError('Insufficient permissions', 403);
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)([client_1.UserRole.ADMIN]);
exports.requireModerator = (0, exports.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.MODERATOR]);
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const payload = auth_1.AuthService.verifyToken(token);
        const session = await database_1.db.prisma.session.findUnique({
            where: { id: payload.sessionId },
            include: { user: true },
        });
        if (session && session.isActive && session.expiresAt >= new Date() && session.user.isActive) {
            req.user = {
                id: payload.userId,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errorHandler_1.CustomError('Authentication required', 401);
            }
            if (req.user.role === client_1.UserRole.ADMIN) {
                return next();
            }
            const resourceId = req.params[resourceIdParam];
            if (!resourceId) {
                throw new errorHandler_1.CustomError('Resource ID required', 400);
            }
            const path = req.route.path;
            let isOwner = false;
            if (path.includes('/robots')) {
                const robot = await database_1.db.prisma.robot.findUnique({
                    where: { id: resourceId },
                    select: { ownerId: true },
                });
                isOwner = robot?.ownerId === req.user.id;
            }
            else if (path.includes('/automation')) {
                const routine = await database_1.db.prisma.automationRoutine.findUnique({
                    where: { id: resourceId },
                    select: { userId: true },
                });
                isOwner = routine?.userId === req.user.id;
            }
            else if (path.includes('/files')) {
                const file = await database_1.db.prisma.file.findUnique({
                    where: { id: resourceId },
                    select: { userId: true },
                });
                isOwner = file?.userId === req.user.id;
            }
            else if (path.includes('/users')) {
                isOwner = resourceId === req.user.id;
            }
            if (!isOwner) {
                (0, logger_1.logSecurity)('Unauthorized resource access attempt', {
                    userId: req.user.id,
                    resourceId,
                    resourceType: path,
                });
                throw new errorHandler_1.CustomError('Access denied', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireOwnership = requireOwnership;
const userRateLimit = (maxRequests, windowMs) => {
    const userRequests = new Map();
    return (req, res, next) => {
        if (!req.user) {
            return next();
        }
        const userId = req.user.id;
        const now = Date.now();
        const userLimit = userRequests.get(userId);
        if (!userLimit || now > userLimit.resetTime) {
            userRequests.set(userId, {
                count: 1,
                resetTime: now + windowMs,
            });
            return next();
        }
        if (userLimit.count >= maxRequests) {
            (0, logger_1.logSecurity)('User rate limit exceeded', {
                userId,
                count: userLimit.count,
                maxRequests,
            });
            throw new errorHandler_1.CustomError('Rate limit exceeded', 429);
        }
        userLimit.count++;
        next();
    };
};
exports.userRateLimit = userRateLimit;
//# sourceMappingURL=auth.js.map