import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { registerStudent, listStudents, getStudent } from "../controller/userController";
import { login as loginUnified } from "../controller/authController";

const router = Router();

// Público
router.post("/register", registerStudent);
router.post("/login", loginUnified);

// Protegidas
router.get("/", authenticate, listStudents);
router.get("/:id", authenticate, getStudent);

export default router;
