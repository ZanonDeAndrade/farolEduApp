"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const professorController_1 = require("../controller/professorController");
const authController_1 = require("../controller/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Público
router.post("/register", professorController_1.registerTeacher);
router.post("/login", authController_1.login);
router.get("/public/:id", professorController_1.getTeacherPublic);
// Debug/Perfil via token
router.get("/me", authMiddleware_1.authenticate, professorController_1.meFromToken);
// Protegidas
router.get("/", authMiddleware_1.authenticate, professorController_1.listTeachers);
router.get("/:id", authMiddleware_1.authenticate, professorController_1.getTeacher);
exports.default = router;
