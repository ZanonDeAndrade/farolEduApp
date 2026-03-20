"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appReady = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const professorRoutes_1 = __importDefault(require("./routes/professorRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const teacherClassRoutes_1 = __importDefault(require("./routes/teacherClassRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const offerRoutes_1 = __importDefault(require("./routes/offerRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const availabilityRoutes_1 = __importDefault(require("./routes/availabilityRoutes"));
const bookingModel_1 = require("./modules/bookingModel");
const env_1 = require("./config/env");
exports.app = (0, express_1.default)();
// 1) trust proxy antes de rate limit e rotas (necessário atrás de proxy do Render)
exports.app.set("trust proxy", env_1.TRUST_PROXY);
// 2) CORS (mantido)
const allowedOrigins = env_1.FRONTEND_ORIGINS.split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
}));
// 3) Body parsers com limite maior (10mb) antes das rotas
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// 4) Rate limiters (mantidos) com skip para webhooks/health e uso de req.ip atrás do proxy
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => shouldSkipRateLimit(req),
});
const bookingLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => shouldSkipRateLimit(req),
});
// 5) Rotas (mesma ordem original)
exports.app.use("/api/users", authLimiter, userRoutes_1.default);
exports.app.use("/api/professors", authLimiter, professorRoutes_1.default);
exports.app.use("/api/auth", authLimiter, authRoutes_1.default);
exports.app.use("/api/appointments", authLimiter, appointmentRoutes_1.default);
exports.app.use("/api/schedules", scheduleRoutes_1.default);
exports.app.use("/api/bookings", bookingLimiter, bookingRoutes_1.default);
exports.app.use("/api/teacher-classes", teacherClassRoutes_1.default);
exports.app.use("/api/offers", offerRoutes_1.default);
exports.app.use("/api/calendar", calendarRoutes_1.default);
exports.app.use("/api/ai", aiRoutes_1.default);
exports.app.use("/api", availabilityRoutes_1.default);
// 6) Handler global de erro (último middleware)
exports.app.use((err, req, res, _next) => {
    if (err?.type === "entity.too.large") {
        const contentLength = req.headers["content-length"];
        console.error(`Payload too large: ${req.method} ${req.originalUrl} content-length=${contentLength ?? "unknown"}`);
        return res.status(413).json({ message: "Payload muito grande" });
    }
    console.error("Erro não tratado:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
});
exports.appReady = (0, bookingModel_1.legacyMigrateSchedule)().catch(err => {
    console.error("Falha ao migrar agenda legada:", err);
});
function shouldSkipRateLimit(req) {
    // Ignora rate limit para webhooks/health caso existam
    const path = req.path || "";
    return path.startsWith("/webhook") || path.includes("/webhooks") || path === "/health";
}
