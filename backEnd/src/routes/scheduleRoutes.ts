// src/routes/scheduleRoutes.ts
import { Router } from "express";
import { createSchedule, getSchedules } from "../controller/scheduleController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createSchedule);
router.get("/", authenticate, getSchedules);

export default router;
