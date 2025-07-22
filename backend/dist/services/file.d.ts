import multer from 'multer';
import { FileType } from '@prisma/client';
export interface FileUploadOptions {
    userId: string;
    robotId?: string;
    description?: string;
    type: FileType;
    isPublic?: boolean;
}
export interface FileMetadata {
    originalName: string;
    mimeType: string;
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    checksum?: string;
}
export declare class FileService {
    private s3Client;
    private uploadDir;
    constructor();
    private ensureUploadDir;
    getMulterConfig(): multer.Multer;
    uploadFile(file: Express.Multer.File, options: FileUploadOptions): Promise<any>;
    uploadMultipleFiles(files: Express.Multer.File[], options: FileUploadOptions): Promise<any[]>;
    getFile(fileId: string, userId: string): Promise<any>;
    getUserFiles(userId: string, options?: {
        type?: FileType;
        robotId?: string;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        files: any[];
        totalCount: number;
    }>;
    deleteFile(fileId: string, userId: string): Promise<void>;
    updateFileMetadata(fileId: string, updates: {
        description?: string;
        isPublic?: boolean;
    }): Promise<any>;
    getSignedUrl(fileId: string, userId: string, expiresIn?: number): Promise<string>;
    getFileStatistics(userId: string): Promise<any>;
    private extractMetadata;
    private generateUniqueFilename;
    private uploadToS3;
    private deleteFromS3;
    private processImage;
    private getThumbnailPath;
    cleanupOldFiles(daysToKeep?: number): Promise<void>;
}
//# sourceMappingURL=file.d.ts.map