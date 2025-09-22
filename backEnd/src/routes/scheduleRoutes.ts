import { Router } from "express";
import { createScheduleHandler, getSchedulesHandler } from "../controller/scheduleController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createScheduleHandler);
router.get("/", authenticate, getSchedulesHandler);

export default router;
