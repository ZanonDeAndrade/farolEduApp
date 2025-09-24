import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import {
  registerStudent,
  loginStudent,
  listStudents,
  getStudent,
} from "../controller/userController";

const router = Router();

// Público
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protegidas
router.get("/", authenticate, listStudents);
router.get("/:id", authenticate, getStudent);

export default router;
