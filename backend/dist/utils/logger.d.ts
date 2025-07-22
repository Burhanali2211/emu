import winston from 'winston';
export declare const logger: winston.Logger;
export declare const loggerStream: {
    write: (message: string) => void;
};
export declare const logError: (error: Error, context?: Record<string, any>) => void;
export declare const logInfo: (message: string, meta?: Record<string, any>) => void;
export declare const logWarn: (message: string, meta?: Record<string, any>) => void;
export declare const logDebug: (message: string, meta?: Record<string, any>) => void;
export declare const logPerformance: (operation: string, duration: number, meta?: Record<string, any>) => void;
export declare const logSecurity: (event: string, details: Record<string, any>) => void;
export declare const logDatabase: (operation: string, table: string, meta?: Record<string, any>) => void;
export declare const logApiRequest: (method: string, url: string, userId?: string, meta?: Record<string, any>) => void;
export declare const logWebSocket: (event: string, socketId: string, meta?: Record<string, any>) => void;
export declare const logRobot: (robotId: string, action: string, meta?: Record<string, any>) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map