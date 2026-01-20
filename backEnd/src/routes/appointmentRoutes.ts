import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authMiddleware";
import { listPendingAppointments, acceptAppointment, rejectAppointment } from "../controller/appointmentController";

const router = Router();

router.get("/pending", authenticate, requireRole("teacher"), listPendingAppointments);
router.post("/:id/accept", authenticate, requireRole("teacher"), acceptAppointment);
router.post("/:id/reject", authenticate, requireRole("teacher"), rejectAppointment);

export default router;

