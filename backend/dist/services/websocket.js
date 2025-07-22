"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const auth_1 = require("@/services/auth");
const logger_1 = require("@/utils/logger");
class WebSocketService {
    constructor(io) {
        this.authenticatedSockets = new Map();
        this.io = io;
    }
    async initialize() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const payload = auth_1.AuthService.verifyToken(token);
                socket.userId = payload.userId;
                next();
            }
            catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });
        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            this.authenticatedSockets.set(socket.id, { userId, socketId: socket.id });
            (0, logger_1.logWebSocket)('User connected', socket.id, { userId });
            socket.join(`user:${userId}`);
            socket.on('disconnect', () => {
                this.authenticatedSockets.delete(socket.id);
                (0, logger_1.logWebSocket)('User disconnected', socket.id, { userId });
            });
            socket.on('robot:command', (data) => {
                (0, logger_1.logWebSocket)('Robot command received', socket.id, { userId, command: data });
                this.io.to(`robot:${data.robotId}`).emit('command', data);
            });
            socket.on('robot:join', (robotId) => {
                socket.join(`robot:${robotId}`);
                (0, logger_1.logWebSocket)('Joined robot room', socket.id, { userId, robotId });
            });
            socket.on('robot:leave', (robotId) => {
                socket.leave(`robot:${robotId}`);
                (0, logger_1.logWebSocket)('Left robot room', socket.id, { userId, robotId });
            });
        });
        (0, logger_1.logWebSocket)('WebSocket service initialized', '', {});
    }
    sendToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    sendToRobot(robotId, event, data) {
        this.io.to(`robot:${robotId}`).emit(event, data);
    }
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.js.map