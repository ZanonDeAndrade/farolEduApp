import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes";
import professorRoutes from "./routes/professorRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import teacherClassRoutes from "./routes/teacherClassRoutes";
import aiRoutes from "./routes/aiRoutes";
import offerRoutes from "./routes/offerRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import authRoutes from "./routes/authRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import { legacyMigrateSchedule } from "./modules/bookingModel";

export const app = express();

app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/users", authLimiter, userRoutes);
app.use("/api/professors", authLimiter, professorRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/appointments", authLimiter, appointmentRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/teacher-classes", teacherClassRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/ai", aiRoutes);

// Handler global simples
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Erro nǜo tratado:", err);
  res.status(500).json({ message: "Erro interno no servidor" });
});

export const appReady = legacyMigrateSchedule().catch(err => {
  console.error("Falha ao migrar agenda legada:", err);
});
