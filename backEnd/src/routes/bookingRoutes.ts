import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authMiddleware";
import {
  cancelBookingHandler,
  createBookingHandler,
  listMyBookingsHandler,
} from "../controller/bookingController";

const router = Router();

router.post("/", authenticate, requireRole("student"), createBookingHandler);
router.get("/", authenticate, listMyBookingsHandler);
router.get("/me", authenticate, listMyBookingsHandler);
router.get("/calendar", authenticate, listMyBookingsHandler);
router.patch("/:id/cancel", authenticate, cancelBookingHandler);

export default router;
