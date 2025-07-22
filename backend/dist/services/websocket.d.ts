import { Server as SocketIOServer } from 'socket.io';
export declare class WebSocketService {
    private io;
    private authenticatedSockets;
    constructor(io: SocketIOServer);
    initialize(): Promise<void>;
    sendToUser(userId: string, event: string, data: any): void;
    sendToRobot(robotId: string, event: string, data: any): void;
    broadcast(event: string, data: any): void;
}
//# sourceMappingURL=websocket.d.ts.map