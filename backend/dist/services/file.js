"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_1 = require("@prisma/client");
const database_1 = require("@/services/database");
const environment_1 = require("@/config/environment");
const errorHandler_1 = require("@/middleware/errorHandler");
const logger_1 = require("@/utils/logger");
class FileService {
    constructor() {
        this.s3Client = null;
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads');
        this.ensureUploadDir();
        if (environment_1.config.aws.accessKeyId && environment_1.config.aws.secretAccessKey) {
            this.s3Client = new client_s3_1.S3Client({
                region: environment_1.config.aws.region,
                credentials: {
                    accessKeyId: environment_1.config.aws.accessKeyId,
                    secretAccessKey: environment_1.config.aws.secretAccessKey,
                },
            });
        }
    }
    async ensureUploadDir() {
        try {
            await promises_1.default.access(this.uploadDir);
        }
        catch {
            await promises_1.default.mkdir(this.uploadDir, { recursive: true });
        }
    }
    getMulterConfig() {
        const storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path_1.default.extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        });
        const fileFilter = (req, file, cb) => {
            const allowedTypes = environment_1.config.upload.allowedTypes;
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new errorHandler_1.CustomError(`File type ${file.mimetype} not allowed`, 400));
            }
        };
        return (0, multer_1.default)({
            storage,
            fileFilter,
            limits: {
                fileSize: environment_1.config.upload.maxFileSize,
                files: 10,
            },
        });
    }
    async uploadFile(file, options) {
        try {
            const metadata = await this.extractMetadata(file);
            const filename = this.generateUniqueFilename(file.originalname);
            let url;
            let filePath;
            if (this.s3Client && environment_1.config.aws.s3Bucket) {
                url = await this.uploadToS3(file, filename);
                filePath = `s3://${environment_1.config.aws.s3Bucket}/${filename}`;
                await promises_1.default.unlink(file.path);
            }
            else {
                const newPath = path_1.default.join(this.uploadDir, filename);
                await promises_1.default.rename(file.path, newPath);
                url = `/uploads/${filename}`;
                filePath = newPath;
            }
            if (file.mimetype.startsWith('image/') && options.type === client_1.FileType.IMAGE) {
                await this.processImage(filePath, filename);
            }
            const fileRecord = await database_1.db.prisma.file.create({
                data: {
                    filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    type: options.type,
                    url,
                    path: filePath,
                    userId: options.userId,
                    robotId: options.robotId,
                    description: options.description,
                    metadata: {
                        ...metadata,
                        isPublic: options.isPublic || false,
                        uploadedAt: new Date().toISOString(),
                    },
                },
            });
            (0, logger_1.logInfo)('File uploaded successfully', {
                fileId: fileRecord.id,
                filename,
                userId: options.userId,
                size: file.size,
                type: options.type,
            });
            return fileRecord;
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'File upload', filename: file.originalname });
            throw error;
        }
    }
    async uploadMultipleFiles(files, options) {
        const uploadPromises = files.map(file => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }
    async getFile(fileId, userId) {
        const file = await database_1.db.prisma.file.findFirst({
            where: {
                id: fileId,
                OR: [
                    { userId },
                    { metadata: { path: ['isPublic'], equals: true } },
                ],
            },
        });
        if (!file) {
            throw new errorHandler_1.CustomError('File not found', 404);
        }
        return file;
    }
    async getUserFiles(userId, options = {}) {
        const where = { userId };
        if (options.type) {
            where.type = options.type;
        }
        if (options.robotId) {
            where.robotId = options.robotId;
        }
        if (options.search) {
            where.OR = [
                { originalName: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
            ];
        }
        const [files, totalCount] = await Promise.all([
            database_1.db.prisma.file.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: options.limit || 50,
                skip: options.offset || 0,
            }),
            database_1.db.prisma.file.count({ where }),
        ]);
        return { files, totalCount };
    }
    async deleteFile(fileId, userId) {
        const file = await database_1.db.prisma.file.findFirst({
            where: { id: fileId, userId },
        });
        if (!file) {
            throw new errorHandler_1.CustomError('File not found', 404);
        }
        try {
            if (file.path.startsWith('s3://')) {
                await this.deleteFromS3(file.filename);
            }
            else {
                await promises_1.default.unlink(file.path);
                const thumbnailPath = this.getThumbnailPath(file.filename);
                try {
                    await promises_1.default.unlink(thumbnailPath);
                }
                catch {
                }
            }
            await database_1.db.prisma.file.delete({
                where: { id: fileId },
            });
            (0, logger_1.logInfo)('File deleted successfully', {
                fileId,
                filename: file.filename,
                userId,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'File deletion', fileId });
            throw error;
        }
    }
    async updateFileMetadata(fileId, updates) {
        const updatedFile = await database_1.db.prisma.file.update({
            where: { id: fileId },
            data: updates,
        });
        return updatedFile;
    }
    async getSignedUrl(fileId, userId, expiresIn = 3600) {
        const file = await this.getFile(fileId, userId);
        if (!file.path.startsWith('s3://')) {
            return file.url;
        }
        if (!this.s3Client) {
            throw new errorHandler_1.CustomError('S3 not configured', 500);
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: environment_1.config.aws.s3Bucket,
            Key: file.filename,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async getFileStatistics(userId) {
        const stats = await database_1.db.prisma.file.groupBy({
            by: ['type'],
            where: { userId },
            _count: { id: true },
            _sum: { size: true },
        });
        const totalFiles = await database_1.db.prisma.file.count({ where: { userId } });
        const totalSize = await database_1.db.prisma.file.aggregate({
            where: { userId },
            _sum: { size: true },
        });
        return {
            totalFiles,
            totalSize: totalSize._sum.size || 0,
            byType: stats.reduce((acc, stat) => {
                acc[stat.type] = {
                    count: stat._count.id,
                    size: stat._sum.size || 0,
                };
                return acc;
            }, {}),
        };
    }
    async extractMetadata(file) {
        const metadata = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
        };
        if (file.mimetype.startsWith('image/')) {
            try {
                const imageInfo = await (0, sharp_1.default)(file.path).metadata();
                metadata.dimensions = {
                    width: imageInfo.width || 0,
                    height: imageInfo.height || 0,
                };
            }
            catch (error) {
                (0, logger_1.logError)(error, { context: 'Image metadata extraction' });
            }
        }
        return metadata;
    }
    generateUniqueFilename(originalName) {
        const ext = path_1.default.extname(originalName);
        const name = path_1.default.basename(originalName, ext);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${name}-${timestamp}-${random}${ext}`;
    }
    async uploadToS3(file, filename) {
        if (!this.s3Client || !environment_1.config.aws.s3Bucket) {
            throw new errorHandler_1.CustomError('S3 not configured', 500);
        }
        const fileContent = await promises_1.default.readFile(file.path);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: environment_1.config.aws.s3Bucket,
            Key: filename,
            Body: fileContent,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
            },
        });
        await this.s3Client.send(command);
        return `https://${environment_1.config.aws.s3Bucket}.s3.${environment_1.config.aws.region}.amazonaws.com/${filename}`;
    }
    async deleteFromS3(filename) {
        if (!this.s3Client || !environment_1.config.aws.s3Bucket) {
            throw new errorHandler_1.CustomError('S3 not configured', 500);
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: environment_1.config.aws.s3Bucket,
            Key: filename,
        });
        await this.s3Client.send(command);
    }
    async processImage(filePath, filename) {
        try {
            const thumbnailPath = this.getThumbnailPath(filename);
            await (0, sharp_1.default)(filePath)
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            (0, logger_1.logInfo)('Image processed successfully', { filename });
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Image processing', filename });
        }
    }
    getThumbnailPath(filename) {
        const ext = path_1.default.extname(filename);
        const name = path_1.default.basename(filename, ext);
        return path_1.default.join(this.uploadDir, 'thumbnails', `${name}_thumb.jpg`);
    }
    async cleanupOldFiles(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const oldFiles = await database_1.db.prisma.file.findMany({
            where: {
                createdAt: { lt: cutoffDate },
                metadata: { path: ['temporary'], equals: true },
            },
        });
        for (const file of oldFiles) {
            try {
                await this.deleteFile(file.id, file.userId);
            }
            catch (error) {
                (0, logger_1.logError)(error, { context: 'File cleanup', fileId: file.id });
            }
        }
        (0, logger_1.logInfo)('File cleanup completed', { deletedCount: oldFiles.length });
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file.js.map