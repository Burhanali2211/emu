"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({ message: 'Get user subscription' });
});
router.post('/create', (req, res) => {
    res.json({ message: 'Create subscription' });
});
router.post('/cancel', (req, res) => {
    res.json({ message: 'Cancel subscription' });
});
router.post('/webhook', (req, res) => {
    res.json({ message: 'Stripe webhook' });
});
exports.default = router;
//# sourceMappingURL=subscriptions.js.map