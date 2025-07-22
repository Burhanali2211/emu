"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const express_validator_1 = require("express-validator");
const file_1 = require("@/services/file");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
const fileService = new file_1.FileService();
class FileController {
}
exports.FileController = FileController;
_a = FileController;
FileController.uploadFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    if (!req.file) {
        throw new errorHandler_1.CustomError('No file uploaded', 400);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { type, robotId, description, isPublic } = req.body;
    const file = await fileService.uploadFile(req.file, {
        userId: req.user.id,
        type: type,
        robotId,
        description,
        isPublic: isPublic === 'true',
    });
    res.status(201).json({
        status: 'success',
        message: 'File uploaded successfully',
        data: { file },
    });
});
FileController.uploadMultipleFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new errorHandler_1.CustomError('No files uploaded', 400);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { type, robotId, description, isPublic } = req.body;
    const files = await fileService.uploadMultipleFiles(req.files, {
        userId: req.user.id,
        type: type,
        robotId,
        description,
        isPublic: isPublic === 'true',
    });
    res.status(201).json({
        status: 'success',
        message: `${files.length} files uploaded successfully`,
        data: { files },
    });
});
FileController.getUserFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { type, robotId, limit = 50, offset = 0, search, } = req.query;
    const result = await fileService.getUserFiles(req.user.id, {
        type: type,
        robotId: robotId,
        limit: parseInt(limit),
        offset: parseInt(offset),
        search: search,
    });
    res.json({
        status: 'success',
        data: {
            files: result.files,
            totalCount: result.totalCount,
            hasMore: result.files.length + parseInt(offset) < result.totalCount,
        },
    });
});
FileController.getFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const file = await fileService.getFile(id, req.user.id);
    res.json({
        status: 'success',
        data: { file },
    });
});
FileController.getFileUrl = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    const { expiresIn = 3600 } = req.query;
    const url = await fileService.getSignedUrl(id, req.user.id, parseInt(expiresIn));
    res.json({
        status: 'success',
        data: { url },
    });
});
FileController.deleteFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { id } = req.params;
    await fileService.deleteFile(id, req.user.id);
    (0, logger_1.logInfo)('File deleted via API', { fileId: id, userId: req.user.id });
    res.json({
        status: 'success',
        message: 'File deleted successfully',
    });
});
FileController.getFileStatistics = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const statistics = await fileService.getFileStatistics(req.user.id);
    res.json({
        status: 'success',
        data: { statistics },
    });
});
FileController.updateFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { id } = req.params;
    const { description, isPublic } = req.body;
    await fileService.getFile(id, req.user.id);
    const updatedFile = await fileService.updateFileMetadata(id, {
        description,
        isPublic,
    });
    res.json({
        status: 'success',
        message: 'File updated successfully',
        data: { file: updatedFile },
    });
});
FileController.getRobotFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { robotId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;
    const result = await fileService.getUserFiles(req.user.id, {
        robotId,
        type: type,
        limit: parseInt(limit),
        offset: parseInt(offset),
    });
    res.json({
        status: 'success',
        data: {
            files: result.files,
            totalCount: result.totalCount,
            hasMore: result.files.length + parseInt(offset) < result.totalCount,
        },
    });
});
FileController.searchFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const { q: search, type, limit = 50, offset = 0 } = req.query;
    if (!search) {
        throw new errorHandler_1.CustomError('Search query is required', 400);
    }
    const result = await fileService.getUserFiles(req.user.id, {
        search: search,
        type: type,
        limit: parseInt(limit),
        offset: parseInt(offset),
    });
    res.json({
        status: 'success',
        data: {
            files: result.files,
            totalCount: result.totalCount,
            hasMore: result.files.length + parseInt(offset) < result.totalCount,
            query: search,
        },
    });
});
FileController.getFileTypes = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const fileTypes = Object.values(client_1.FileType);
    res.json({
        status: 'success',
        data: { fileTypes },
    });
});
FileController.bulkDeleteFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.CustomError('User not authenticated', 401);
    }
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        (0, errorHandler_1.handleValidationError)(errors.array());
    }
    const { fileIds } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new errorHandler_1.CustomError('File IDs array is required', 400);
    }
    const deletePromises = fileIds.map(id => fileService.deleteFile(id, req.user.id));
    await Promise.all(deletePromises);
    (0, logger_1.logInfo)('Bulk file deletion completed', {
        userId: req.user.id,
        deletedCount: fileIds.length,
    });
    res.json({
        status: 'success',
        message: `${fileIds.length} files deleted successfully`,
    });
});
//# sourceMappingURL=file.js.map