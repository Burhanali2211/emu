"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("@/controllers/auth");
const auth_2 = require("@/middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
const changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
];
const updateProfileValidation = [
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
    (0, express_validator_1.body)('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object'),
];
const passwordResetRequestValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
];
const passwordResetValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
];
router.post('/register', registerValidation, auth_1.AuthController.register);
router.post('/login', loginValidation, auth_1.AuthController.login);
router.post('/refresh', auth_1.AuthController.refreshTokens);
router.post('/forgot-password', passwordResetRequestValidation, auth_1.AuthController.requestPasswordReset);
router.post('/reset-password', passwordResetValidation, auth_1.AuthController.resetPassword);
router.use(auth_2.authMiddleware);
router.post('/logout', auth_1.AuthController.logout);
router.get('/profile', auth_1.AuthController.getProfile);
router.put('/profile', updateProfileValidation, auth_1.AuthController.updateProfile);
router.put('/change-password', changePasswordValidation, auth_1.AuthController.changePassword);
router.get('/sessions', auth_1.AuthController.getSessions);
router.delete('/sessions/:sessionId', auth_1.AuthController.revokeSession);
exports.default = router;
//# sourceMappingURL=auth.js.map