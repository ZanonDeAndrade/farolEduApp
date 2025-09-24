import { Router } from "express";
import {
  registerTeacher,
  listTeachers,
  getTeacher,
  loginTeacher,
  meFromToken,
} from "../controller/professorController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Público
router.post("/register", registerTeacher);
router.post("/login", loginTeacher);

// Debug/Perfil via token
router.get("/me", authenticate, meFromToken);

// Protegidas
router.get("/", authenticate, listTeachers);
router.get("/:id", authenticate, getTeacher);

export default router;
