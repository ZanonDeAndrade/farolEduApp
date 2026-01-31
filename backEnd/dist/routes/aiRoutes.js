"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controller/aiController");
const router = (0, express_1.Router)();
router.post("/suggest", aiController_1.suggestTeacherHandler);
exports.default = router;
