"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'Get automation routines' });
});
router.post('/', (req, res) => {
    res.json({ message: 'Create automation routine' });
});
router.get('/:id', (req, res) => {
    res.json({ message: 'Get automation routine' });
});
router.put('/:id', (req, res) => {
    res.json({ message: 'Update automation routine' });
});
router.delete('/:id', (req, res) => {
    res.json({ message: 'Delete automation routine' });
});
router.post('/:id/execute', (req, res) => {
    res.json({ message: 'Execute automation routine' });
});
exports.default = router;
//# sourceMappingURL=automation.js.map