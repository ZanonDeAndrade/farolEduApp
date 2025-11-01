import { Router } from "express";
import { createTeacherClassHandler, listTeacherClassesHandler } from "../controller/teacherClassController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createTeacherClassHandler);
router.get("/", authenticate, listTeacherClassesHandler);

export default router;
