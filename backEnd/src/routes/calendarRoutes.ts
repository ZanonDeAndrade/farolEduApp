import { Router } from "express";
import { listMyBookingsHandler } from "../controller/bookingController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, listMyBookingsHandler);

export default router;
