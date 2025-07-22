"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_1 = require("@/services/auth");
const database_1 = require("@/services/database");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { email, username, password, firstName, lastName } = req.body;
    const { user, tokens } = await auth_1.AuthService.register({
        email,
        username,
        password,
        firstName,
        lastName,
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
            user: userWithoutPassword,
            tokens,
        },
    });
});
AuthController.login = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { email, password } = req.body;
    const { user, tokens } = await auth_1.AuthService.login({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        status: 'success',
        message: 'Login successful',
        data: {
            user: userWithoutPassword,
            tokens,
        },
    });
});
AuthController.refreshTokens = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new errorHandler_1.CustomError('Refresh token required', 400);
    }
    const tokens = await auth_1.AuthService.refreshTokens(refreshToken);
    res.json({
        status: 'success',
        message: 'Tokens refreshed successfully',
        data: { tokens },
    });
});
AuthController.logout = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.body;
    const sessionId = req.user?.sessionId;
    if (!sessionId) {
        throw new errorHandler_1.CustomError('Session not found', 400);
    }
    await auth_1.AuthService.logout(sessionId, refreshToken);
    res.json({
        status: 'success',
        message: 'Logout successful',
    });
});
AuthController.getProfile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const user = await database_1.db.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            isEmailVerified: true,
            lastLoginAt: true,
            preferences: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    robots: true,
                    automationRoutines: true,
                    files: true,
                },
            },
        },
    });
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    res.json({
        status: 'success',
        data: { user },
    });
});
AuthController.updateProfile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { firstName, lastName, preferences } = req.body;
    const updatedUser = await database_1.db.prisma.user.update({
        where: { id: req.user.id },
        data: {
            firstName,
            lastName,
            preferences,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            preferences: true,
            updatedAt: true,
        },
    });
    (0, logger_1.logInfo)('User profile updated', { userId: req.user.id });
    res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user: updatedUser },
    });
});
AuthController.changePassword = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { currentPassword, newPassword } = req.body;
    const user = await database_1.db.prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        throw new errorHandler_1.CustomError('User not found', 404);
    }
    const isCurrentPasswordValid = await auth_1.AuthService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        (0, logger_1.logSecurity)('Invalid current password in change password attempt', {
            userId: req.user.id,
        });
        throw new errorHandler_1.CustomError('Current password is incorrect', 400);
    }
    const hashedNewPassword = await auth_1.AuthService.hashPassword(newPassword);
    await database_1.db.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword },
    });
    await database_1.db.prisma.session.updateMany({
        where: {
            userId: req.user.id,
            id: { not: req.user.sessionId },
        },
        data: { isActive: false },
    });
    await database_1.db.prisma.refreshToken.updateMany({
        where: { userId: req.user.id },
        data: { isRevoked: true },
    });
    (0, logger_1.logSecurity)('Password changed successfully', { userId: req.user.id });
    res.json({
        status: 'success',
        message: 'Password changed successfully',
    });
});
AuthController.requestPasswordReset = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { email } = req.body;
    const user = await database_1.db.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.json({
            status: 'success',
            message: 'If the email exists, a password reset link has been sent',
        });
    }
    const resetToken = auth_1.AuthService.generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
    await database_1.db.prisma.user.update({
        where: { id: user.id },
        data: {
            preferences: {
                ...(user.preferences || {}),
                resetToken,
                resetTokenExpires: resetTokenExpires.toISOString(),
            },
        },
    });
    (0, logger_1.logSecurity)('Password reset requested', { userId: user.id, email });
    return res.json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent',
    });
});
AuthController.resetPassword = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { token, newPassword } = req.body;
    const user = await database_1.db.prisma.user.findFirst({
        where: {
            preferences: {
                path: ['resetToken'],
                equals: token,
            },
        },
    });
    if (!user) {
        throw new errorHandler_1.CustomError('Invalid or expired reset token', 400);
    }
    const preferences = user.preferences;
    const resetTokenExpires = new Date(preferences?.resetTokenExpires);
    if (!resetTokenExpires || resetTokenExpires < new Date()) {
        throw new errorHandler_1.CustomError('Reset token has expired', 400);
    }
    const hashedPassword = await auth_1.AuthService.hashPassword(newPassword);
    await database_1.db.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            preferences: {
                ...preferences,
                resetToken: null,
                resetTokenExpires: null,
            },
        },
    });
    await Promise.all([
        database_1.db.prisma.session.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        }),
        database_1.db.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { isRevoked: true },
        }),
    ]);
    (0, logger_1.logSecurity)('Password reset completed', { userId: user.id });
    res.json({
        status: 'success',
        message: 'Password reset successfully',
    });
});
AuthController.getSessions = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const sessions = await database_1.db.prisma.session.findMany({
        where: {
            userId: req.user.id,
            isActive: true,
            expiresAt: { gt: new Date() },
        },
        select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        status: 'success',
        data: { sessions },
    });
});
AuthController.revokeSession = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { sessionId } = req.params;
    if (sessionId === req.user.sessionId) {
        throw new errorHandler_1.CustomError('Cannot revoke current session', 400);
    }
    await database_1.db.prisma.session.updateMany({
        where: {
            id: sessionId,
            userId: req.user.id,
        },
        data: { isActive: false },
    });
    (0, logger_1.logSecurity)('Session revoked', { userId: req.user.id, revokedSessionId: sessionId });
    res.json({
        status: 'success',
        message: 'Session revoked successfully',
    });
});
//# sourceMappingURL=auth.js.map