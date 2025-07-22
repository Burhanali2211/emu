"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
require('dotenv').config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    API_VERSION: zod_1.z.string().default('v1'),
    REDIS_URL: zod_1.z.string().url().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().email().optional(),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().default('us-east-1'),
    AWS_S3_BUCKET: zod_1.z.string().optional(),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default('12'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    SENTRY_DSN: zod_1.z.string().optional(),
    WEBSOCKET_PORT: zod_1.z.string().transform(Number).default('3002'),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    GOOGLE_AI_API_KEY: zod_1.z.string().optional(),
    ROBOT_WEBSOCKET_PORT: zod_1.z.string().transform(Number).default('81'),
    ROBOT_DEFAULT_IP: zod_1.z.string().default('192.168.1.100'),
    MAX_FILE_SIZE: zod_1.z.string().transform(Number).default('10485760'),
    ALLOWED_FILE_TYPES: zod_1.z.string().default('image/jpeg,image/png,image/gif,video/mp4,application/pdf'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE_PATH: zod_1.z.string().default('logs/app.log'),
});
const env = envSchema.parse(process.env);
exports.config = {
    database: {
        url: env.DATABASE_URL,
    },
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        refreshSecret: env.JWT_REFRESH_SECRET,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    apiVersion: env.API_VERSION,
    redis: {
        url: env.REDIS_URL,
    },
    email: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.FROM_EMAIL,
    },
    aws: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION,
        s3Bucket: env.AWS_S3_BUCKET,
    },
    stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    security: {
        bcryptRounds: env.BCRYPT_ROUNDS,
    },
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
    cors: {
        origin: env.NODE_ENV === 'production'
            ? ['https://yourdomain.com', 'https://www.yourdomain.com']
            : ['http://localhost:5173', 'http://localhost:3000'],
    },
    monitoring: {
        sentryDsn: env.SENTRY_DSN,
    },
    websocket: {
        port: env.WEBSOCKET_PORT,
    },
    ai: {
        openaiApiKey: env.OPENAI_API_KEY,
        googleAiApiKey: env.GOOGLE_AI_API_KEY,
    },
    robot: {
        websocketPort: env.ROBOT_WEBSOCKET_PORT,
        defaultIp: env.ROBOT_DEFAULT_IP,
    },
    upload: {
        maxFileSize: env.MAX_FILE_SIZE,
        allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
    },
    logging: {
        level: env.LOG_LEVEL,
        filePath: env.LOG_FILE_PATH,
    },
};
//# sourceMappingURL=environment.js.map