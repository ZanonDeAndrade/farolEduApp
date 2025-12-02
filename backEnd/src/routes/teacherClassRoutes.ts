import { Router } from "express";
import {
  createTeacherClassHandler,
  deleteTeacherClassHandler,
  listPublicTeacherClassesHandler,
  listTeacherClassesHandler,
  updateTeacherClassHandler,
} from "../controller/teacherClassController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/public", listPublicTeacherClassesHandler);
router.post("/", authenticate, createTeacherClassHandler);
router.get("/", authenticate, listTeacherClassesHandler);
router.put("/:id", authenticate, updateTeacherClassHandler);
router.delete("/:id", authenticate, deleteTeacherClassHandler);

export default router;
