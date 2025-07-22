"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Analytics dashboard data' });
});
router.get('/sensors/:robotId', (req, res) => {
    res.json({ message: 'Sensor analytics for robot' });
});
router.get('/usage', (req, res) => {
    res.json({ message: 'Usage analytics' });
});
exports.default = router;
//# sourceMappingURL=analytics.js.map