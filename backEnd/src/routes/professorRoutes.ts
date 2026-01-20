import { Router } from "express";
import { registerTeacher, listTeachers, getTeacher, meFromToken, getTeacherPublic } from "../controller/professorController";
import { login as loginUnified } from "../controller/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Público
router.post("/register", registerTeacher);
router.post("/login", loginUnified);
router.get("/public/:id", getTeacherPublic);

// Debug/Perfil via token
router.get("/me", authenticate, meFromToken);

// Protegidas
router.get("/", authenticate, listTeachers);
router.get("/:id", authenticate, getTeacher);

export default router;
