"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const robot_1 = require("@/controllers/robot");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
const createRobotValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Robot name is required')
        .isLength({ max: 100 })
        .withMessage('Robot name must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('ipAddress')
        .isIP()
        .withMessage('Valid IP address is required'),
    (0, express_validator_1.body)('macAddress')
        .optional()
        .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
        .withMessage('Valid MAC address is required'),
    (0, express_validator_1.body)('capabilities')
        .optional()
        .isObject()
        .withMessage('Capabilities must be an object'),
    (0, express_validator_1.body)('configuration')
        .optional()
        .isObject()
        .withMessage('Configuration must be an object'),
];
const updateRobotValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Robot name must be 1-100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('ipAddress')
        .optional()
        .isIP()
        .withMessage('Valid IP address is required'),
    (0, express_validator_1.body)('capabilities')
        .optional()
        .isObject()
        .withMessage('Capabilities must be an object'),
    (0, express_validator_1.body)('configuration')
        .optional()
        .isObject()
        .withMessage('Configuration must be an object'),
];
const commandValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('command')
        .notEmpty()
        .withMessage('Command is required'),
    (0, express_validator_1.body)('parameters')
        .optional()
        .isObject()
        .withMessage('Parameters must be an object'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'normal', 'high', 'critical'])
        .withMessage('Priority must be low, normal, high, or critical'),
];
const bulkCommandValidation = [
    (0, express_validator_1.body)('robotIds')
        .isArray({ min: 1 })
        .withMessage('Robot IDs must be a non-empty array'),
    (0, express_validator_1.body)('robotIds.*')
        .isUUID()
        .withMessage('Each robot ID must be a valid UUID'),
    (0, express_validator_1.body)('operation')
        .isIn(['start', 'stop', 'restart', 'update', 'command'])
        .withMessage('Operation must be start, stop, restart, update, or command'),
    (0, express_validator_1.body)('parameters')
        .optional()
        .isObject()
        .withMessage('Parameters must be an object'),
];
const groupValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Group name is required')
        .isLength({ max: 100 })
        .withMessage('Group name must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('robotIds')
        .isArray({ min: 1 })
        .withMessage('Robot IDs must be a non-empty array'),
    (0, express_validator_1.body)('robotIds.*')
        .isUUID()
        .withMessage('Each robot ID must be a valid UUID'),
];
const groupCommandValidation = [
    (0, express_validator_1.param)('groupId')
        .notEmpty()
        .withMessage('Group ID is required'),
    (0, express_validator_1.body)('command')
        .notEmpty()
        .withMessage('Command is required'),
    (0, express_validator_1.body)('parameters')
        .optional()
        .isObject()
        .withMessage('Parameters must be an object'),
];
router.get('/', robot_1.RobotController.getUserRobots);
router.post('/', createRobotValidation, robot_1.RobotController.createRobot);
router.get('/connected', robot_1.RobotController.getConnectedRobots);
router.post('/emergency-stop', robot_1.RobotController.emergencyStopAll);
router.post('/bulk-command', bulkCommandValidation, robot_1.RobotController.sendBulkCommand);
router.get('/groups', robot_1.RobotController.getRobotGroups);
router.post('/groups', groupValidation, robot_1.RobotController.createRobotGroup);
router.post('/groups/:groupId/command', groupCommandValidation, robot_1.RobotController.sendGroupCommand);
router.get('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('Robot ID must be a valid UUID'), robot_1.RobotController.getRobotDetails);
router.put('/:id', updateRobotValidation, robot_1.RobotController.updateRobot);
router.delete('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('Robot ID must be a valid UUID'), robot_1.RobotController.deleteRobot);
router.post('/:id/command', commandValidation, robot_1.RobotController.sendCommand);
router.post('/:id/heartbeat', (0, express_validator_1.param)('id').isUUID().withMessage('Robot ID must be a valid UUID'), robot_1.RobotController.updateHeartbeat);
router.get('/:id/sensors', (0, express_validator_1.param)('id').isUUID().withMessage('Robot ID must be a valid UUID'), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'), (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'), robot_1.RobotController.getSensorData);
router.get('/:id/logs', (0, express_validator_1.param)('id').isUUID().withMessage('Robot ID must be a valid UUID'), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'), (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'), (0, express_validator_1.query)('level').optional().isIn(['info', 'warn', 'error', 'debug']).withMessage('Level must be info, warn, error, or debug'), robot_1.RobotController.getRobotLogs);
router.get('/admin/statistics', auth_1.requireAdmin, robot_1.RobotController.getPlatformStatistics);
exports.default = router;
//# sourceMappingURL=robots.js.map