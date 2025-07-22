import { NotificationService } from '@/services/notification';
export interface CloudSyncData {
    userId: string;
    robotId?: string;
    dataType: 'sensor' | 'logs' | 'configuration' | 'files' | 'analytics';
    data: any;
    timestamp: Date;
    metadata?: any;
}
export interface RemoteAccessSession {
    sessionId: string;
    userId: string;
    robotId: string;
    deviceInfo: any;
    ipAddress: string;
    startTime: Date;
    lastActivity: Date;
    isActive: boolean;
}
export interface CloudMetrics {
    metricName: string;
    value: number;
    unit: string;
    dimensions?: {
        [key: string]: string;
    };
    timestamp?: Date;
}
export declare class CloudService {
    private s3Client;
    private cloudWatchClient;
    private snsClient;
    private sqsClient;
    private notificationService;
    private activeSessions;
    constructor(notificationService: NotificationService);
    syncToCloud(syncData: CloudSyncData): Promise<void>;
    getFromCloud(userId: string, dataType: string, robotId?: string): Promise<any[]>;
    createRemoteSession(userId: string, robotId: string, deviceInfo: any, ipAddress: string): Promise<RemoteAccessSession>;
    endRemoteSession(sessionId: string): Promise<void>;
    updateSessionActivity(sessionId: string): void;
    getUserActiveSessions(userId: string): RemoteAccessSession[];
    publishMetrics(metrics: CloudMetrics[]): Promise<void>;
    sendCloudNotification(topicArn: string, message: string, subject?: string): Promise<void>;
    sendQueueMessage(queueUrl: string, message: any): Promise<void>;
    syncUserData(userId: string): Promise<void>;
    private generateCloudKey;
    cleanupCloudData(retentionDays?: number): Promise<void>;
    cleanupInactiveSessions(): void;
    initialize(): Promise<void>;
}
//# sourceMappingURL=cloud.d.ts.map