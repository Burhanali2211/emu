import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
declare class App {
    app: express.Application;
    server: any;
    io: SocketIOServer;
    private databaseService;
    private websocketService;
    private robotService;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private initializeServices;
    listen(): void;
    getApp(): express.Application;
}
declare const app: App;
export default app;
//# sourceMappingURL=server.d.ts.map