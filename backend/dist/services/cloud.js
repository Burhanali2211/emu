"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const client_sns_1 = require("@aws-sdk/client-sns");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const database_1 = require("@/services/database");
const environment_1 = require("@/config/environment");
const logger_1 = require("@/utils/logger");
class CloudService {
    constructor(notificationService) {
        this.s3Client = null;
        this.cloudWatchClient = null;
        this.snsClient = null;
        this.sqsClient = null;
        this.activeSessions = new Map();
        this.notificationService = notificationService;
        if (environment_1.config.aws.accessKeyId && environment_1.config.aws.secretAccessKey) {
            const awsConfig = {
                region: environment_1.config.aws.region,
                credentials: {
                    accessKeyId: environment_1.config.aws.accessKeyId,
                    secretAccessKey: environment_1.config.aws.secretAccessKey,
                },
            };
            this.s3Client = new client_s3_1.S3Client(awsConfig);
            this.cloudWatchClient = new client_cloudwatch_1.CloudWatchClient(awsConfig);
            this.snsClient = new client_sns_1.SNSClient(awsConfig);
            this.sqsClient = new client_sqs_1.SQSClient(awsConfig);
        }
    }
    async syncToCloud(syncData) {
        try {
            if (!this.s3Client) {
                (0, logger_1.logInfo)('Cloud sync skipped - AWS not configured');
                return;
            }
            const key = this.generateCloudKey(syncData);
            const data = JSON.stringify({
                ...syncData,
                syncedAt: new Date().toISOString(),
            });
            const command = new client_s3_1.PutObjectCommand({
                Bucket: environment_1.config.aws.s3Bucket,
                Key: key,
                Body: data,
                ContentType: 'application/json',
                Metadata: {
                    userId: syncData.userId,
                    dataType: syncData.dataType,
                    robotId: syncData.robotId || '',
                    timestamp: syncData.timestamp.toISOString(),
                },
            });
            await this.s3Client.send(command);
            await database_1.db.prisma.cloudSync.create({
                data: {
                    userId: syncData.userId,
                    robotId: syncData.robotId,
                    dataType: syncData.dataType,
                    cloudKey: key,
                    status: 'SYNCED',
                    syncedAt: new Date(),
                    metadata: syncData.metadata || {},
                },
            });
            (0, logger_1.logInfo)('Data synced to cloud', {
                userId: syncData.userId,
                dataType: syncData.dataType,
                key,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Cloud sync', userId: syncData.userId });
            throw error;
        }
    }
    async getFromCloud(userId, dataType, robotId) {
        try {
            if (!this.s3Client) {
                throw new Error('Cloud service not configured');
            }
            const syncRecords = await database_1.db.prisma.cloudSync.findMany({
                where: {
                    userId,
                    dataType,
                    robotId,
                    status: 'SYNCED',
                },
                orderBy: { syncedAt: 'desc' },
                take: 100,
            });
            const cloudData = [];
            for (const record of syncRecords) {
                try {
                    const command = new client_s3_1.GetObjectCommand({
                        Bucket: environment_1.config.aws.s3Bucket,
                        Key: record.cloudKey,
                    });
                    const response = await this.s3Client.send(command);
                    const data = await response.Body?.transformToString();
                    if (data) {
                        cloudData.push(JSON.parse(data));
                    }
                }
                catch (error) {
                    (0, logger_1.logError)(error, { context: 'Cloud data retrieval', key: record.cloudKey });
                }
            }
            return cloudData;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Cloud data retrieval', userId });
            throw error;
        }
    }
    async createRemoteSession(userId, robotId, deviceInfo, ipAddress) {
        try {
            const robot = await database_1.db.prisma.robot.findFirst({
                where: { id: robotId, ownerId: userId },
            });
            if (!robot) {
                throw new Error('Robot not found or access denied');
            }
            const sessionId = `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const session = {
                sessionId,
                userId,
                robotId,
                deviceInfo,
                ipAddress,
                startTime: new Date(),
                lastActivity: new Date(),
                isActive: true,
            };
            this.activeSessions.set(sessionId, session);
            await database_1.db.prisma.remoteSession.create({
                data: {
                    id: sessionId,
                    userId,
                    robotId,
                    deviceInfo,
                    ipAddress,
                    startTime: session.startTime,
                    lastActivity: session.lastActivity,
                    isActive: true,
                },
            });
            await this.notificationService.createNotification({
                userId,
                title: 'Remote Access Started',
                message: `Remote access session started for ${robot.name}`,
                type: 'INFO',
                data: { sessionId, robotId, deviceInfo },
            });
            (0, logger_1.logInfo)('Remote access session created', {
                sessionId,
                userId,
                robotId,
                ipAddress,
            });
            return session;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Remote session creation', userId, robotId });
            throw error;
        }
    }
    async endRemoteSession(sessionId) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            session.isActive = false;
            this.activeSessions.delete(sessionId);
            await database_1.db.prisma.remoteSession.update({
                where: { id: sessionId },
                data: {
                    isActive: false,
                    endTime: new Date(),
                },
            });
            (0, logger_1.logInfo)('Remote access session ended', { sessionId });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Remote session end', sessionId });
            throw error;
        }
    }
    updateSessionActivity(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.lastActivity = new Date();
            this.activeSessions.set(sessionId, session);
        }
    }
    getUserActiveSessions(userId) {
        return Array.from(this.activeSessions.values()).filter(session => session.userId === userId && session.isActive);
    }
    async publishMetrics(metrics) {
        try {
            if (!this.cloudWatchClient) {
                (0, logger_1.logInfo)('Metrics publishing skipped - CloudWatch not configured');
                return;
            }
            const metricData = metrics.map(metric => ({
                MetricName: metric.metricName,
                Value: metric.value,
                Unit: metric.unit,
                Timestamp: metric.timestamp || new Date(),
                Dimensions: metric.dimensions ? Object.entries(metric.dimensions).map(([Name, Value]) => ({
                    Name,
                    Value,
                })) : undefined,
            }));
            const command = new client_cloudwatch_1.PutMetricDataCommand({
                Namespace: 'RobotPlatform',
                MetricData: metricData,
            });
            await this.cloudWatchClient.send(command);
            (0, logger_1.logInfo)('Metrics published to CloudWatch', { metricCount: metrics.length });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Metrics publishing' });
        }
    }
    async sendCloudNotification(topicArn, message, subject) {
        try {
            if (!this.snsClient) {
                (0, logger_1.logInfo)('Cloud notification skipped - SNS not configured');
                return;
            }
            const command = new client_sns_1.PublishCommand({
                TopicArn: topicArn,
                Message: message,
                Subject: subject,
            });
            await this.snsClient.send(command);
            (0, logger_1.logInfo)('Cloud notification sent', { topicArn, subject });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Cloud notification' });
        }
    }
    async sendQueueMessage(queueUrl, message) {
        try {
            if (!this.sqsClient) {
                (0, logger_1.logInfo)('Queue message skipped - SQS not configured');
                return;
            }
            const command = new client_sqs_1.SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    timestamp: {
                        StringValue: new Date().toISOString(),
                        DataType: 'String',
                    },
                    source: {
                        StringValue: 'RobotPlatform',
                        DataType: 'String',
                    },
                },
            });
            await this.sqsClient.send(command);
            (0, logger_1.logInfo)('Message sent to queue', { queueUrl });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Queue message send' });
        }
    }
    async syncUserData(userId) {
        try {
            const robots = await database_1.db.prisma.robot.findMany({
                where: { ownerId: userId },
                include: {
                    sensorData: {
                        orderBy: { timestamp: 'desc' },
                        take: 100,
                    },
                    robotLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 50,
                    },
                },
            });
            for (const robot of robots) {
                if (robot.sensorData.length > 0) {
                    await this.syncToCloud({
                        userId,
                        robotId: robot.id,
                        dataType: 'sensor',
                        data: robot.sensorData,
                        timestamp: new Date(),
                        metadata: { robotName: robot.name },
                    });
                }
                if (robot.robotLogs.length > 0) {
                    await this.syncToCloud({
                        userId,
                        robotId: robot.id,
                        dataType: 'logs',
                        data: robot.robotLogs,
                        timestamp: new Date(),
                        metadata: { robotName: robot.name },
                    });
                }
                await this.syncToCloud({
                    userId,
                    robotId: robot.id,
                    dataType: 'configuration',
                    data: {
                        name: robot.name,
                        description: robot.description,
                        capabilities: robot.capabilities,
                        configuration: robot.configuration,
                    },
                    timestamp: new Date(),
                });
            }
            (0, logger_1.logInfo)('User data synced to cloud', { userId, robotCount: robots.length });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'User data sync', userId });
            throw error;
        }
    }
    generateCloudKey(syncData) {
        const date = syncData.timestamp.toISOString().split('T')[0];
        const timestamp = syncData.timestamp.getTime();
        if (syncData.robotId) {
            return `users/${syncData.userId}/robots/${syncData.robotId}/${syncData.dataType}/${date}/${timestamp}.json`;
        }
        else {
            return `users/${syncData.userId}/${syncData.dataType}/${date}/${timestamp}.json`;
        }
    }
    async cleanupCloudData(retentionDays = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const oldRecords = await database_1.db.prisma.cloudSync.findMany({
                where: {
                    syncedAt: { lt: cutoffDate },
                },
            });
            if (this.s3Client) {
                for (const record of oldRecords) {
                    try {
                        const command = new client_s3_1.DeleteObjectCommand({
                            Bucket: environment_1.config.aws.s3Bucket,
                            Key: record.cloudKey,
                        });
                        await this.s3Client.send(command);
                    }
                    catch (error) {
                        (0, logger_1.logError)(error, { context: 'Cloud cleanup', key: record.cloudKey });
                    }
                }
            }
            await database_1.db.prisma.cloudSync.deleteMany({
                where: {
                    syncedAt: { lt: cutoffDate },
                },
            });
            (0, logger_1.logInfo)('Cloud data cleanup completed', { deletedCount: oldRecords.length });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Cloud cleanup' });
        }
    }
    cleanupInactiveSessions() {
        const now = new Date();
        const timeout = 30 * 60 * 1000;
        for (const [sessionId, session] of this.activeSessions.entries()) {
            const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
            if (timeSinceActivity > timeout) {
                this.endRemoteSession(sessionId);
            }
        }
    }
    async initialize() {
        setInterval(() => {
            this.cleanupInactiveSessions();
        }, 5 * 60 * 1000);
        (0, logger_1.logInfo)('Cloud service initialized');
    }
}
exports.CloudService = CloudService;
//# sourceMappingURL=cloud.js.map