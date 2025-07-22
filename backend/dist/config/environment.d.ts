export declare const config: {
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshSecret: string;
        readonly refreshExpiresIn: string;
    };
    readonly port: number;
    readonly nodeEnv: "development" | "production" | "test";
    readonly apiVersion: string;
    readonly redis: {
        readonly url: string | undefined;
    };
    readonly email: {
        readonly host: string | undefined;
        readonly port: number | undefined;
        readonly user: string | undefined;
        readonly pass: string | undefined;
        readonly from: string | undefined;
    };
    readonly aws: {
        readonly accessKeyId: string | undefined;
        readonly secretAccessKey: string | undefined;
        readonly region: string;
        readonly s3Bucket: string | undefined;
    };
    readonly stripe: {
        readonly secretKey: string | undefined;
        readonly webhookSecret: string | undefined;
    };
    readonly security: {
        readonly bcryptRounds: number;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly cors: {
        readonly origin: string[];
    };
    readonly monitoring: {
        readonly sentryDsn: string | undefined;
    };
    readonly websocket: {
        readonly port: number;
    };
    readonly ai: {
        readonly openaiApiKey: string | undefined;
        readonly googleAiApiKey: string | undefined;
    };
    readonly robot: {
        readonly websocketPort: number;
        readonly defaultIp: string;
    };
    readonly upload: {
        readonly maxFileSize: number;
        readonly allowedTypes: string[];
    };
    readonly logging: {
        readonly level: "error" | "warn" | "info" | "debug";
        readonly filePath: string;
    };
};
export type Config = typeof config;
//# sourceMappingURL=environment.d.ts.map