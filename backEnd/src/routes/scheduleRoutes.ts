import { Router } from "express";
import { createScheduleHandler, getSchedulesHandler } from "../controller/scheduleController";
import { authenticate, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, requireRole("student"), createScheduleHandler);
router.get("/", authenticate, getSchedulesHandler);

export default router;
