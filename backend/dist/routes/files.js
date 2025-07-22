"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const file_1 = require("@/controllers/file");
const file_2 = require("@/services/file");
const router = (0, express_1.Router)();
const fileService = new file_2.FileService();
const uploadValidation = [
    (0, express_validator_1.body)('type')
        .isIn(['IMAGE', 'VIDEO', 'DOCUMENT', 'FIRMWARE', 'LOG'])
        .withMessage('Type must be IMAGE, VIDEO, DOCUMENT, FIRMWARE, or LOG'),
    (0, express_validator_1.body)('robotId')
        .optional()
        .isUUID()
        .withMessage('Robot ID must be a valid UUID'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
];
const updateValidation = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('File ID must be a valid UUID'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
];
const bulkDeleteValidation = [
    (0, express_validator_1.body)('fileIds')
        .isArray({ min: 1 })
        .withMessage('File IDs must be a non-empty array'),
    (0, express_validator_1.body)('fileIds.*')
        .isUUID()
        .withMessage('Each file ID must be a valid UUID'),
];
const upload = fileService.getMulterConfig();
router.get('/', file_1.FileController.getUserFiles);
router.get('/statistics', file_1.FileController.getFileStatistics);
router.get('/types', file_1.FileController.getFileTypes);
router.get('/search', file_1.FileController.searchFiles);
router.post('/upload', upload.single('file'), uploadValidation, file_1.FileController.uploadFile);
router.post('/upload-multiple', upload.array('files', 10), uploadValidation, file_1.FileController.uploadMultipleFiles);
router.get('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('File ID must be a valid UUID'), file_1.FileController.getFile);
router.get('/:id/url', (0, express_validator_1.param)('id').isUUID().withMessage('File ID must be a valid UUID'), (0, express_validator_1.query)('expiresIn').optional().isInt({ min: 60, max: 86400 }).withMessage('Expires in must be between 60 and 86400 seconds'), file_1.FileController.getFileUrl);
router.put('/:id', updateValidation, file_1.FileController.updateFile);
router.delete('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('File ID must be a valid UUID'), file_1.FileController.deleteFile);
router.delete('/bulk', bulkDeleteValidation, file_1.FileController.bulkDeleteFiles);
router.get('/robot/:robotId', (0, express_validator_1.param)('robotId').isUUID().withMessage('Robot ID must be a valid UUID'), file_1.FileController.getRobotFiles);
exports.default = router;
//# sourceMappingURL=files.js.map