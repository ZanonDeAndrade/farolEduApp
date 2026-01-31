"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduleController_1 = require("../controller/scheduleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.requireRole)("student"), scheduleController_1.createScheduleHandler);
router.get("/", authMiddleware_1.authenticate, scheduleController_1.getSchedulesHandler);
exports.default = router;
