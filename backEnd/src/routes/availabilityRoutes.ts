import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authMiddleware";
import {
  createAvailabilityHandler,
  deleteAvailabilityHandler,
  getTeacherAvailableSlotsHandler,
  listMyAvailabilityHandler,
} from "../controller/availabilityController";

const router = Router();

router.post("/availability", authenticate, requireRole("teacher"), createAvailabilityHandler);
router.get("/availability/me", authenticate, requireRole("teacher"), listMyAvailabilityHandler);
router.delete("/availability/:id", authenticate, requireRole("teacher"), deleteAvailabilityHandler);
router.get("/teachers/:id/available-slots", getTeacherAvailableSlotsHandler);

export default router;
