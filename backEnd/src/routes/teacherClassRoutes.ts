import { Router } from "express";
import { createTeacherClassHandler, listPublicTeacherClassesHandler, listTeacherClassesHandler } from "../controller/teacherClassController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/public", listPublicTeacherClassesHandler);
router.post("/", authenticate, createTeacherClassHandler);
router.get("/", authenticate, listTeacherClassesHandler);

export default router;
