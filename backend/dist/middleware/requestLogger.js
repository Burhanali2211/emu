"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("@/utils/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    (0, logger_1.logApiRequest)(req.method, req.url, req.user?.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
    });
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding, cb) {
        const duration = Date.now() - start;
        (0, logger_1.logApiRequest)(`${req.method} ${req.url} - ${res.statusCode}`, '', req.user?.id, {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length'),
        });
        if (typeof encoding === 'function') {
            return originalEnd(chunk, encoding);
        }
        return originalEnd(chunk, encoding, cb);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map