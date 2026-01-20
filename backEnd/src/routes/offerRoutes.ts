import { Router } from "express";
import {
  createTeacherClassHandler,
  deleteTeacherClassHandler,
  listPublicTeacherClassesHandler,
  listTeacherClassesHandler,
  updateTeacherClassHandler,
} from "../controller/teacherClassController";
import { authenticate, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/public", listPublicTeacherClassesHandler);
router.post("/", authenticate, requireRole("teacher"), createTeacherClassHandler);
router.get("/", authenticate, requireRole("teacher"), listTeacherClassesHandler);
router.put("/:id", authenticate, requireRole("teacher"), updateTeacherClassHandler);
router.patch("/:id", authenticate, requireRole("teacher"), updateTeacherClassHandler);
router.delete("/:id", authenticate, requireRole("teacher"), deleteTeacherClassHandler);

export default router;
