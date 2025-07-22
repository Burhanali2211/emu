"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const environment_1 = require("@/config/environment");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const requestLogger_1 = require("@/middleware/requestLogger");
const auth_1 = require("@/middleware/auth");
const auth_2 = __importDefault(require("@/routes/auth"));
const users_1 = __importDefault(require("@/routes/users"));
const robots_1 = __importDefault(require("@/routes/robots"));
const analytics_1 = __importDefault(require("@/routes/analytics"));
const automation_1 = __importDefault(require("@/routes/automation"));
const files_1 = __importDefault(require("@/routes/files"));
const notifications_1 = __importDefault(require("@/routes/notifications"));
const subscriptions_1 = __importDefault(require("@/routes/subscriptions"));
const database_1 = require("@/services/database");
const websocket_1 = require("@/services/websocket");
const robot_1 = require("@/services/robot");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: environment_1.config.cors.origin,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.databaseService = new database_1.DatabaseService();
        this.websocketService = new websocket_1.WebSocketService(this.io);
        this.robotService = new robot_1.RobotService();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeServices();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: environment_1.config.cors.origin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: environment_1.config.rateLimit.windowMs,
            max: environment_1.config.rateLimit.maxRequests,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((0, express_mongo_sanitize_1.default)());
        this.app.use((0, hpp_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use(requestLogger_1.requestLogger);
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: environment_1.config.nodeEnv
            });
        });
    }
    initializeRoutes() {
        const apiRouter = express_1.default.Router();
        apiRouter.use('/auth', auth_2.default);
        apiRouter.use('/users', auth_1.authMiddleware, users_1.default);
        apiRouter.use('/robots', auth_1.authMiddleware, robots_1.default);
        apiRouter.use('/analytics', auth_1.authMiddleware, analytics_1.default);
        apiRouter.use('/automation', auth_1.authMiddleware, automation_1.default);
        apiRouter.use('/files', auth_1.authMiddleware, files_1.default);
        apiRouter.use('/notifications', auth_1.authMiddleware, notifications_1.default);
        apiRouter.use('/subscriptions', auth_1.authMiddleware, subscriptions_1.default);
        this.app.use(`/api/${environment_1.config.apiVersion}`, apiRouter);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.notFound);
        this.app.use(errorHandler_1.errorHandler);
    }
    async initializeServices() {
        try {
            await this.databaseService.connect();
            await this.websocketService.initialize();
            await this.robotService.initialize();
            logger_1.logger.info('All services initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize services:', error);
            process.exit(1);
        }
    }
    listen() {
        this.server.listen(environment_1.config.port, () => {
            logger_1.logger.info(`🚀 Server running on port ${environment_1.config.port} in ${environment_1.config.nodeEnv} mode`);
            logger_1.logger.info(`📊 Health check available at http://localhost:${environment_1.config.port}/health`);
            logger_1.logger.info(`🔌 WebSocket server running on port ${environment_1.config.port}`);
        });
    }
    getApp() {
        return this.app;
    }
}
const app = new App();
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    app.server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    app.server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
if (require.main === module) {
    app.listen();
}
exports.default = app;
//# sourceMappingURL=server.js.map