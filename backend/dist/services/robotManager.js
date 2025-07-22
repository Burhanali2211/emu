"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotManagerService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("@/services/database");
const logger_1 = require("@/utils/logger");
class RobotManagerService {
    constructor(wsService, notificationService) {
        this.connectedRobots = new Map();
        this.robotGroups = new Map();
        this.commandQueue = new Map();
        this.wsService = wsService;
        this.notificationService = notificationService;
        this.initializeHeartbeat();
    }
    static getInstance(wsService, notificationService) {
        if (!RobotManagerService.instance) {
            RobotManagerService.instance = new RobotManagerService(wsService, notificationService);
        }
        return RobotManagerService.instance;
    }
    async registerRobot(robotId, socketId, ipAddress, capabilities, configuration) {
        try {
            const robot = await database_1.db.prisma.robot.update({
                where: { id: robotId },
                data: {
                    status: client_1.RobotStatus.ONLINE,
                    lastSeen: new Date(),
                    capabilities,
                    configuration,
                },
            });
            const connection = {
                robotId,
                socketId,
                ipAddress,
                lastSeen: new Date(),
                status: client_1.RobotStatus.ONLINE,
                capabilities,
                configuration,
            };
            this.connectedRobots.set(robotId, connection);
            if (!this.commandQueue.has(robotId)) {
                this.commandQueue.set(robotId, []);
            }
            await this.notificationService.sendRobotNotification(robotId, 'Robot Connected', `${robot.name} has connected successfully`, 'SUCCESS', { ipAddress, capabilities });
            this.wsService.sendToRobot(robotId, 'robot:status', {
                robotId,
                status: client_1.RobotStatus.ONLINE,
                lastSeen: new Date(),
                capabilities,
            });
            (0, logger_1.logRobot)(robotId, 'Robot registered', { ipAddress, socketId });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Robot registration', robotId });
            throw error;
        }
    }
    async unregisterRobot(robotId) {
        try {
            const connection = this.connectedRobots.get(robotId);
            if (!connection)
                return;
            await database_1.db.prisma.robot.update({
                where: { id: robotId },
                data: {
                    status: client_1.RobotStatus.OFFLINE,
                    lastSeen: new Date(),
                },
            });
            this.connectedRobots.delete(robotId);
            await this.notificationService.sendRobotNotification(robotId, 'Robot Disconnected', 'Robot has disconnected from the platform', 'WARNING');
            this.wsService.sendToRobot(robotId, 'robot:status', {
                robotId,
                status: client_1.RobotStatus.OFFLINE,
                lastSeen: new Date(),
            });
            (0, logger_1.logRobot)(robotId, 'Robot unregistered');
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Robot unregistration', robotId });
        }
    }
    async sendCommand(command) {
        try {
            const connection = this.connectedRobots.get(command.robotId);
            if (!connection) {
                this.queueCommand(command);
                return false;
            }
            this.wsService.sendToRobot(command.robotId, 'robot:command', {
                command: command.command,
                parameters: command.parameters,
                priority: command.priority || 'normal',
                timestamp: new Date().toISOString(),
                userId: command.userId,
            });
            await database_1.db.prisma.robotLog.create({
                data: {
                    robotId: command.robotId,
                    userId: command.userId,
                    level: 'INFO',
                    message: `Command sent: ${command.command}`,
                    data: {
                        command: command.command,
                        parameters: command.parameters,
                        priority: command.priority,
                    },
                },
            });
            (0, logger_1.logRobot)(command.robotId, `Command sent: ${command.command}`, {
                userId: command.userId,
                parameters: command.parameters,
            });
            return true;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Send command', robotId: command.robotId });
            return false;
        }
    }
    async sendBulkOperation(operation) {
        const results = {
            successful: [],
            failed: [],
            queued: [],
        };
        const promises = operation.robotIds.map(async (robotId) => {
            try {
                const command = {
                    robotId,
                    command: operation.operation,
                    parameters: operation.parameters,
                    userId: operation.userId,
                    priority: 'normal',
                };
                const sent = await this.sendCommand(command);
                if (sent) {
                    results.successful.push(robotId);
                }
                else {
                    results.queued.push(robotId);
                }
            }
            catch (error) {
                results.failed.push(robotId);
                (0, logger_1.logError)(error, { context: 'Bulk operation', robotId });
            }
        });
        await Promise.all(promises);
        (0, logger_1.logInfo)('Bulk operation completed', {
            operation: operation.operation,
            userId: operation.userId,
            results,
        });
        return results;
    }
    async getUserRobots(userId) {
        const robots = await database_1.db.prisma.robot.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: {
                        sensorData: true,
                        robotLogs: true,
                        files: true,
                    },
                },
            },
            orderBy: { lastSeen: 'desc' },
        });
        return robots.map(robot => ({
            ...robot,
            isConnected: this.connectedRobots.has(robot.id),
            connection: this.connectedRobots.get(robot.id) || null,
        }));
    }
    async getRobotDetails(robotId, userId) {
        const robot = await database_1.db.prisma.robot.findFirst({
            where: { id: robotId, ownerId: userId },
            include: {
                sensorData: {
                    orderBy: { timestamp: 'desc' },
                    take: 100,
                },
                robotLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
                files: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!robot) {
            throw new Error('Robot not found');
        }
        const connection = this.connectedRobots.get(robotId);
        const queuedCommands = this.commandQueue.get(robotId) || [];
        return {
            ...robot,
            isConnected: !!connection,
            connection,
            queuedCommands: queuedCommands.length,
            realTimeStatus: connection ? {
                lastSeen: connection.lastSeen,
                ipAddress: connection.ipAddress,
                capabilities: connection.capabilities,
            } : null,
        };
    }
    async createRobotGroup(userId, name, description, robotIds) {
        const robots = await database_1.db.prisma.robot.findMany({
            where: { id: { in: robotIds }, ownerId: userId },
        });
        if (robots.length !== robotIds.length) {
            throw new Error('Some robots not found or not owned by user');
        }
        const group = {
            id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            robotIds,
            userId,
            configuration: {},
        };
        this.robotGroups.set(group.id, group);
        (0, logger_1.logInfo)('Robot group created', { groupId: group.id, userId, robotCount: robotIds.length });
        return group;
    }
    getUserRobotGroups(userId) {
        return Array.from(this.robotGroups.values()).filter(group => group.userId === userId);
    }
    async sendGroupCommand(groupId, command, parameters, userId) {
        const group = this.robotGroups.get(groupId);
        if (!group || group.userId !== userId) {
            throw new Error('Robot group not found');
        }
        const operation = {
            robotIds: group.robotIds,
            operation: command,
            parameters,
            userId,
        };
        return this.sendBulkOperation(operation);
    }
    async getPlatformStatistics() {
        const [totalRobots, onlineRobots, totalUsers, totalCommands, totalSensorData,] = await Promise.all([
            database_1.db.prisma.robot.count(),
            database_1.db.prisma.robot.count({ where: { status: client_1.RobotStatus.ONLINE } }),
            database_1.db.prisma.user.count({ where: { isActive: true } }),
            database_1.db.prisma.robotLog.count(),
            database_1.db.prisma.sensorData.count(),
        ]);
        return {
            totalRobots,
            onlineRobots,
            offlineRobots: totalRobots - onlineRobots,
            totalUsers,
            totalCommands,
            totalSensorData,
            connectedRobots: this.connectedRobots.size,
            queuedCommands: Array.from(this.commandQueue.values()).reduce((total, queue) => total + queue.length, 0),
            robotGroups: this.robotGroups.size,
        };
    }
    queueCommand(command) {
        const queue = this.commandQueue.get(command.robotId) || [];
        queue.push({
            ...command,
            timeout: command.timeout || 300000,
        });
        this.commandQueue.set(command.robotId, queue);
        (0, logger_1.logRobot)(command.robotId, `Command queued: ${command.command}`, {
            queueLength: queue.length,
        });
    }
    async processQueuedCommands(robotId) {
        const queue = this.commandQueue.get(robotId);
        if (!queue || queue.length === 0)
            return;
        (0, logger_1.logRobot)(robotId, `Processing ${queue.length} queued commands`);
        for (const command of queue) {
            const now = Date.now();
            const commandTime = new Date(command.timeout || 0).getTime();
            if (now - commandTime > (command.timeout || 300000)) {
                (0, logger_1.logRobot)(robotId, `Command expired: ${command.command}`);
                continue;
            }
            await this.sendCommand(command);
        }
        this.commandQueue.set(robotId, []);
    }
    initializeHeartbeat() {
        setInterval(() => {
            this.checkRobotHeartbeats();
        }, 30000);
    }
    async checkRobotHeartbeats() {
        const now = new Date();
        const timeout = 60000;
        for (const [robotId, connection] of this.connectedRobots.entries()) {
            const timeSinceLastSeen = now.getTime() - connection.lastSeen.getTime();
            if (timeSinceLastSeen > timeout) {
                (0, logger_1.logRobot)(robotId, 'Robot heartbeat timeout, marking as offline');
                await this.unregisterRobot(robotId);
            }
        }
    }
    updateRobotHeartbeat(robotId) {
        const connection = this.connectedRobots.get(robotId);
        if (connection) {
            connection.lastSeen = new Date();
            this.connectedRobots.set(robotId, connection);
        }
    }
    getConnectedRobots() {
        return Array.from(this.connectedRobots.values());
    }
    async emergencyStopAll(userId) {
        const userRobots = await this.getUserRobots(userId);
        const robotIds = userRobots.map(robot => robot.id);
        await this.sendBulkOperation({
            robotIds,
            operation: 'stop',
            parameters: { emergency: true },
            userId,
        });
        await this.notificationService.createNotification({
            userId,
            title: 'Emergency Stop Activated',
            message: `Emergency stop sent to ${robotIds.length} robots`,
            type: 'WARNING',
            data: { robotIds, timestamp: new Date().toISOString() },
            sendEmail: true,
            sendPush: true,
        });
        (0, logger_1.logInfo)('Emergency stop activated', { userId, robotCount: robotIds.length });
    }
}
exports.RobotManagerService = RobotManagerService;
//# sourceMappingURL=robotManager.js.map