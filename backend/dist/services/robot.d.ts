export declare class RobotService {
    private connectedRobots;
    initialize(): Promise<void>;
    registerRobot(robotId: string): void;
    updateRobotStatus(robotId: string, status: string): void;
    getConnectedRobots(): string[];
}
//# sourceMappingURL=robot.d.ts.map