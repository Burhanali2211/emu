"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAdmin, (req, res) => {
    res.json({ message: 'Get all users - Admin only' });
});
router.get('/:id', (0, auth_1.requireOwnership)(), (req, res) => {
    res.json({ message: 'Get user by ID - Owner or Admin' });
});
router.put('/:id', (0, auth_1.requireOwnership)(), (req, res) => {
    res.json({ message: 'Update user - Owner or Admin' });
});
router.delete('/:id', auth_1.requireAdmin, (req, res) => {
    res.json({ message: 'Delete user - Admin only' });
});
exports.default = router;
//# sourceMappingURL=users.js.map