import express, { Request, Response, NextFunction } from "express";
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
import availabilityRoutes from "./routes/availabilityRoutes";
import { legacyMigrateSchedule } from "./modules/bookingModel";
import { FRONTEND_ORIGINS, TRUST_PROXY } from "./config/env";

export const app = express();

// 1) trust proxy antes de rate limit e rotas (necessário atrás de proxy do Render)
app.set("trust proxy", TRUST_PROXY);

// 2) CORS (mantido)
const allowedOrigins = FRONTEND_ORIGINS.split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

// 3) Body parsers com limite maior (10mb) antes das rotas
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4) Rate limiters (mantidos) com skip para webhooks/health e uso de req.ip atrás do proxy
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => shouldSkipRateLimit(req),
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => shouldSkipRateLimit(req),
});

// 5) Rotas (mesma ordem original)
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
app.use("/api", availabilityRoutes);

// 6) Handler global de erro (último middleware)
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === "entity.too.large") {
    const contentLength = req.headers["content-length"];
    console.error(
      `Payload too large: ${req.method} ${req.originalUrl} content-length=${contentLength ?? "unknown"}`,
    );
    return res.status(413).json({ message: "Payload muito grande" });
  }

  console.error("Erro não tratado:", err);
  return res.status(500).json({ message: "Erro interno no servidor" });
});

export const appReady = legacyMigrateSchedule().catch(err => {
  console.error("Falha ao migrar agenda legada:", err);
});

function shouldSkipRateLimit(req: Request) {
  // Ignora rate limit para webhooks/health caso existam
  const path = req.path || "";
  return path.startsWith("/webhook") || path.includes("/webhooks") || path === "/health";
}
