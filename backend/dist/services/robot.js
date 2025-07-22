"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotService = void 0;
const logger_1 = require("@/utils/logger");
class RobotService {
    constructor() {
        this.connectedRobots = new Map();
    }
    async initialize() {
        (0, logger_1.logRobot)('', 'Robot service initialized');
    }
    registerRobot(robotId) {
        this.connectedRobots.set(robotId, {
            lastSeen: new Date(),
            status: 'online'
        });
        (0, logger_1.logRobot)(robotId, 'Robot registered');
    }
    updateRobotStatus(robotId, status) {
        const robot = this.connectedRobots.get(robotId);
        if (robot) {
            robot.lastSeen = new Date();
            robot.status = status;
            (0, logger_1.logRobot)(robotId, `Status updated to ${status}`);
        }
    }
    getConnectedRobots() {
        return Array.from(this.connectedRobots.keys());
    }
}
exports.RobotService = RobotService;
//# sourceMappingURL=robot.js.map