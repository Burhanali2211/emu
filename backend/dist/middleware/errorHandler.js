"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = exports.catchAsync = exports.notFound = exports.errorHandler = exports.CustomError = void 0;
const logger_1 = require("@/utils/logger");
const environment_1 = require("@/config/environment");
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new CustomError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new CustomError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new CustomError(message, 400);
};
const handleJWTError = () => new CustomError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new CustomError('Your token has expired! Please log in again.', 401);
const handlePrismaError = (err) => {
    switch (err.code) {
        case 'P2002':
            return new CustomError('Duplicate field value. Please use another value!', 400);
        case 'P2014':
            return new CustomError('Invalid ID provided.', 400);
        case 'P2003':
            return new CustomError('Invalid input data. Foreign key constraint failed.', 400);
        case 'P2025':
            return new CustomError('Record not found.', 404);
        default:
            return new CustomError('Database operation failed.', 500);
    }
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        logger_1.logger.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    (0, logger_1.logError)(err, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });
    if (environment_1.config.nodeEnv === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        if (error.code === '11000')
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        if (error.name === 'PrismaClientKnownRequestError')
            error = handlePrismaError(error);
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
const handleValidationError = (errors) => {
    const message = errors.map(err => err.msg).join('. ');
    throw new CustomError(`Validation Error: ${message}`, 400);
};
exports.handleValidationError = handleValidationError;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map