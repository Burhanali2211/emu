import { PrismaClient } from '@prisma/client';
export declare class DatabaseService {
    private static instance;
    prisma: PrismaClient;
    constructor();
    static getInstance(): DatabaseService;
    private setupEventListeners;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T>;
    cleanup(): Promise<void>;
    getStats(): Promise<Record<string, number>>;
}
export declare const db: DatabaseService;
//# sourceMappingURL=database.d.ts.map