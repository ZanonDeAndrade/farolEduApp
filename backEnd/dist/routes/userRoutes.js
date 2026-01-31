"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controller/userController");
const authController_1 = require("../controller/authController");
const router = (0, express_1.Router)();
// Público
router.post("/register", userController_1.registerStudent);
router.post("/login", authController_1.login);
// Protegidas
router.get("/", authMiddleware_1.authenticate, userController_1.listStudents);
router.get("/:id", authMiddleware_1.authenticate, userController_1.getStudent);
exports.default = router;
