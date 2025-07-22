"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRobot = exports.logWebSocket = exports.logApiRequest = exports.logDatabase = exports.logSecurity = exports.logPerformance = exports.logDebug = exports.logWarn = exports.logInfo = exports.logError = exports.loggerStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const environment_1 = require("@/config/environment");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
const logsDir = path_1.default.dirname(environment_1.config.logging.filePath);
exports.logger = winston_1.default.createLogger({
    level: environment_1.config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'robot-platform-api' },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: environment_1.config.logging.filePath,
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
if (environment_1.config.nodeEnv !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat
    }));
}
exports.loggerStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
const logError = (error, context) => {
    exports.logger.error('Error occurred', {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        context,
    });
};
exports.logError = logError;
const logInfo = (message, meta) => {
    exports.logger.info(message, meta);
};
exports.logInfo = logInfo;
const logWarn = (message, meta) => {
    exports.logger.warn(message, meta);
};
exports.logWarn = logWarn;
const logDebug = (message, meta) => {
    exports.logger.debug(message, meta);
};
exports.logDebug = logDebug;
const logPerformance = (operation, duration, meta) => {
    exports.logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...meta,
    });
};
exports.logPerformance = logPerformance;
const logSecurity = (event, details) => {
    exports.logger.warn(`Security Event: ${event}`, {
        security: true,
        ...details,
    });
};
exports.logSecurity = logSecurity;
const logDatabase = (operation, table, meta) => {
    exports.logger.debug(`Database: ${operation} on ${table}`, meta);
};
exports.logDatabase = logDatabase;
const logApiRequest = (method, url, userId, meta) => {
    exports.logger.info(`API Request: ${method} ${url}`, {
        userId,
        ...meta,
    });
};
exports.logApiRequest = logApiRequest;
const logWebSocket = (event, socketId, meta) => {
    exports.logger.info(`WebSocket: ${event}`, {
        socketId,
        ...meta,
    });
};
exports.logWebSocket = logWebSocket;
const logRobot = (robotId, action, meta) => {
    exports.logger.info(`Robot: ${action}`, {
        robotId,
        ...meta,
    });
};
exports.logRobot = logRobot;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map