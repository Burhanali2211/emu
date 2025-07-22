"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class DatabaseService {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        this.setupEventListeners();
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    setupEventListeners() {
        logger_1.logger.info('Database event listeners initialized');
    }
    async connect() {
        try {
            await this.prisma.$connect();
            logger_1.logger.info('✅ Database connected successfully');
            await this.prisma.$queryRaw `SELECT 1`;
            logger_1.logger.info('✅ Database connection test passed');
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Database connection' });
            throw new Error('Failed to connect to database');
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            logger_1.logger.info('✅ Database disconnected successfully');
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Database disconnection' });
        }
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Database health check' });
            return false;
        }
    }
    async transaction(fn) {
        return this.prisma.$transaction(fn);
    }
    async cleanup() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const deletedSensorData = await this.prisma.sensorData.deleteMany({
                where: {
                    timestamp: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            const deletedActivityLogs = await this.prisma.activityLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            const deletedRobotLogs = await this.prisma.robotLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            const deletedSessions = await this.prisma.session.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            const deletedRefreshTokens = await this.prisma.refreshToken.deleteMany({
                where: {
                    OR: [
                        {
                            expiresAt: {
                                lt: new Date(),
                            },
                        },
                        {
                            isRevoked: true,
                        },
                    ],
                },
            });
            logger_1.logger.info('Database cleanup completed', {
                deletedSensorData: deletedSensorData.count,
                deletedActivityLogs: deletedActivityLogs.count,
                deletedRobotLogs: deletedRobotLogs.count,
                deletedSessions: deletedSessions.count,
                deletedRefreshTokens: deletedRefreshTokens.count,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Database cleanup' });
        }
    }
    async getStats() {
        try {
            const [userCount, robotCount, sensorDataCount, automationRoutineCount, notificationCount, fileCount,] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.robot.count(),
                this.prisma.sensorData.count(),
                this.prisma.automationRoutine.count(),
                this.prisma.notification.count(),
                this.prisma.file.count(),
            ]);
            return {
                users: userCount,
                robots: robotCount,
                sensorData: sensorDataCount,
                automationRoutines: automationRoutineCount,
                notifications: notificationCount,
                files: fileCount,
            };
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Database stats' });
            return {};
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.db = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map