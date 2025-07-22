import { RobotStatus } from '@prisma/client';
import { WebSocketService } from '@/services/websocket';
import { NotificationService } from '@/services/notification';
export interface RobotConnection {
    robotId: string;
    socketId: string;
    ipAddress: string;
    lastSeen: Date;
    status: RobotStatus;
    capabilities: any;
    configuration: any;
}
export interface RobotCommand {
    robotId: string;
    command: string;
    parameters?: any;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    timeout?: number;
    userId: string;
}
export interface BulkOperation {
    robotIds: string[];
    operation: 'start' | 'stop' | 'restart' | 'update' | 'command';
    parameters?: any;
    userId: string;
}
export interface RobotGroup {
    id: string;
    name: string;
    description?: string;
    robotIds: string[];
    userId: string;
    configuration?: any;
}
export declare class RobotManagerService {
    private static instance;
    private connectedRobots;
    private robotGroups;
    private commandQueue;
    private wsService;
    private notificationService;
    constructor(wsService: WebSocketService, notificationService: NotificationService);
    static getInstance(wsService: WebSocketService, notificationService: NotificationService): RobotManagerService;
    registerRobot(robotId: string, socketId: string, ipAddress: string, capabilities: any, configuration: any): Promise<void>;
    unregisterRobot(robotId: string): Promise<void>;
    sendCommand(command: RobotCommand): Promise<boolean>;
    sendBulkOperation(operation: BulkOperation): Promise<{
        successful: string[];
        failed: string[];
        queued: string[];
    }>;
    getUserRobots(userId: string): Promise<any[]>;
    getRobotDetails(robotId: string, userId: string): Promise<any>;
    createRobotGroup(userId: string, name: string, description: string, robotIds: string[]): Promise<RobotGroup>;
    getUserRobotGroups(userId: string): RobotGroup[];
    sendGroupCommand(groupId: string, command: string, parameters: any, userId: string): Promise<any>;
    getPlatformStatistics(): Promise<any>;
    private queueCommand;
    private processQueuedCommands;
    private initializeHeartbeat;
    private checkRobotHeartbeats;
    updateRobotHeartbeat(robotId: string): void;
    getConnectedRobots(): RobotConnection[];
    emergencyStopAll(userId: string): Promise<void>;
}
//# sourceMappingURL=robotManager.d.ts.map