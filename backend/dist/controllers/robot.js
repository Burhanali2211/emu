"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotController = exports.initializeRobotController = void 0;
const express_validator_1 = require("express-validator");
const robotManager_1 = require("@/services/robotManager");
const database_1 = require("@/services/database");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
let robotManager;
const initializeRobotController = (wsService, notificationService) => {
    robotManager = robotManager_1.RobotManagerService.getInstance(wsService, notificationService);
};
exports.initializeRobotController = initializeRobotController;
class RobotController {
}
exports.RobotController = RobotController;
_a = RobotController;
RobotController.getUserRobots = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const robots = await robotManager.getUserRobots(req.user.id);
    res.json({
        status: 'success',
        data: { robots },
    });
});
RobotController.createRobot = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { name, description, ipAddress, macAddress, capabilities, configuration } = req.body;
    if (macAddress) {
        const existingRobot = await database_1.db.prisma.robot.findUnique({
            where: { macAddress },
        });
        if (existingRobot) {
            throw new errorHandler_1.CustomError('Robot with this MAC address already exists', 400);
        }
    }
    const robot = await database_1.db.prisma.robot.create({
        data: {
            name,
            description,
            ipAddress,
            macAddress,
            capabilities: capabilities || {},
            configuration: configuration || {},
            ownerId: req.user.id,
            status: client_1.RobotStatus.OFFLINE,
        },
    });
    (0, logger_1.logRobot)(robot.id, 'Robot created', { userId: req.user.id });
    res.status(201).json({
        status: 'success',
        message: 'Robot created successfully',
        data: { robot },
    });
});
RobotController.getRobotDetails = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const robot = await robotManager.getRobotDetails(id, req.user.id);
    res.json({
        status: 'success',
        data: { robot },
    });
});
RobotController.updateRobot = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { id } = req.params;
    const { name, description, ipAddress, capabilities, configuration } = req.body;
    const robot = await database_1.db.prisma.robot.updateMany({
        where: { id, ownerId: req.user.id },
        data: {
            name,
            description,
            ipAddress,
            capabilities,
            configuration,
        },
    });
    if (robot.count === 0) {
        throw new errorHandler_1.CustomError('Robot not found', 404);
    }
    const updatedRobot = await database_1.db.prisma.robot.findUnique({
        where: { id },
    });
    (0, logger_1.logRobot)(id, 'Robot updated', { userId: req.user.id });
    res.json({
        status: 'success',
        message: 'Robot updated successfully',
        data: { robot: updatedRobot },
    });
});
RobotController.deleteRobot = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const robot = await database_1.db.prisma.robot.findFirst({
        where: { id, ownerId: req.user.id },
    });
    if (!robot) {
        throw new errorHandler_1.CustomError('Robot not found', 404);
    }
    await robotManager.unregisterRobot(id);
    await database_1.db.prisma.robot.delete({
        where: { id },
    });
    (0, logger_1.logRobot)(id, 'Robot deleted', { userId: req.user.id });
    res.json({
        status: 'success',
        message: 'Robot deleted successfully',
    });
});
RobotController.sendCommand = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { id } = req.params;
    const { command, parameters, priority } = req.body;
    const success = await robotManager.sendCommand({
        robotId: id,
        command,
        parameters,
        priority,
        userId: req.user.id,
    });
    res.json({
        status: 'success',
        message: success ? 'Command sent successfully' : 'Command queued (robot offline)',
        data: { sent: success, queued: !success },
    });
});
RobotController.sendBulkCommand = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { robotIds, operation, parameters } = req.body;
    const results = await robotManager.sendBulkOperation({
        robotIds,
        operation,
        parameters,
        userId: req.user.id,
    });
    res.json({
        status: 'success',
        message: 'Bulk operation completed',
        data: { results },
    });
});
RobotController.getSensorData = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const { limit = 100, offset = 0, startDate, endDate } = req.query;
    const robot = await database_1.db.prisma.robot.findFirst({
        where: { id, ownerId: req.user.id },
    });
    if (!robot) {
        throw new errorHandler_1.CustomError('Robot not found', 404);
    }
    const where = { robotId: id };
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = new Date(startDate);
        if (endDate)
            where.timestamp.lte = new Date(endDate);
    }
    const [sensorData, totalCount] = await Promise.all([
        database_1.db.prisma.sensorData.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
        }),
        database_1.db.prisma.sensorData.count({ where }),
    ]);
    res.json({
        status: 'success',
        data: {
            sensorData,
            totalCount,
            hasMore: sensorData.length + parseInt(offset) < totalCount,
        },
    });
});
RobotController.getRobotLogs = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const { limit = 50, offset = 0, level } = req.query;
    const robot = await database_1.db.prisma.robot.findFirst({
        where: { id, ownerId: req.user.id },
    });
    if (!robot) {
        throw new errorHandler_1.CustomError('Robot not found', 404);
    }
    const where = { robotId: id };
    if (level)
        where.level = level;
    const [logs, totalCount] = await Promise.all([
        database_1.db.prisma.robotLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                user: {
                    select: { username: true, firstName: true, lastName: true },
                },
            },
        }),
        database_1.db.prisma.robotLog.count({ where }),
    ]);
    res.json({
        status: 'success',
        data: {
            logs,
            totalCount,
            hasMore: logs.length + parseInt(offset) < totalCount,
        },
    });
});
RobotController.createRobotGroup = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { name, description, robotIds } = req.body;
    const group = await robotManager.createRobotGroup(req.user.id, name, description, robotIds);
    res.status(201).json({
        status: 'success',
        message: 'Robot group created successfully',
        data: { group },
    });
});
RobotController.getRobotGroups = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const groups = robotManager.getUserRobotGroups(req.user.id);
    res.json({
        status: 'success',
        data: { groups },
    });
});
RobotController.sendGroupCommand = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { groupId } = req.params;
    const { command, parameters } = req.body;
    const results = await robotManager.sendGroupCommand(groupId, command, parameters, req.user.id);
    res.json({
        status: 'success',
        message: 'Group command sent successfully',
        data: { results },
    });
});
RobotController.emergencyStopAll = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    await robotManager.emergencyStopAll(req.user.id);
    res.json({
        status: 'success',
        message: 'Emergency stop sent to all robots',
    });
});
RobotController.getPlatformStatistics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const statistics = await robotManager.getPlatformStatistics();
    res.json({
        status: 'success',
        data: { statistics },
    });
});
RobotController.updateHeartbeat = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    robotManager.updateRobotHeartbeat(id);
    res.json({
        status: 'success',
        message: 'Heartbeat updated',
    });
});
RobotController.getConnectedRobots = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const connectedRobots = robotManager.getConnectedRobots();
    const userRobots = await database_1.db.prisma.robot.findMany({
        where: { ownerId: req.user.id },
        select: { id: true },
    });
    const userRobotIds = new Set(userRobots.map(r => r.id));
    const filteredRobots = connectedRobots.filter(robot => userRobotIds.has(robot.robotId));
    res.json({
        status: 'success',
        data: { connectedRobots: filteredRobots },
    });
});
//# sourceMappingURL=robot.js.map