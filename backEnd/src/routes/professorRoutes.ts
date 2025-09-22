import { Router } from "express";
import { registerTeacher, listTeachers, getTeacher } from "../controller/professorController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", registerTeacher);
router.get("/", authenticate, listTeachers);
router.get("/:id", authenticate, getTeacher);

export default router;
