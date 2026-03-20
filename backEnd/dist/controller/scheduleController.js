"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchedulesHandler = exports.createScheduleHandler = void 0;
const zod_1 = require("zod");
const bookingModel_1 = require("../modules/bookingModel");
const scheduleModel_1 = require("../modules/scheduleModel");
const teacherClassModel_1 = require("../modules/teacherClassModel");
const bookingService_1 = require("../services/bookingService");
const dateTime_1 = require("../utils/dateTime");
const validators_1 = require("../utils/validators");
const resolveLegacySlot = (payload) => {
    if (payload.date && payload.slotTime) {
        return {
            date: payload.date,
            startTime: payload.slotTime,
        };
    }
    if (!payload.startTime) {
        throw new bookingService_1.BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
    }
    const legacyDate = new Date(payload.startTime);
    if (Number.isNaN(legacyDate.getTime())) {
        throw new bookingService_1.BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
    }
    const parts = (0, dateTime_1.getLocalDateTimeParts)(legacyDate);
    return {
        date: parts.date,
        startTime: parts.time,
    };
};
const createScheduleHandler = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || (authUser.role || "").toLowerCase() !== "student") {
            return res.status(403).json({ message: "Apenas estudantes podem criar agendamentos" });
        }
        const parsed = validators_1.legacyScheduleInputSchema.parse(req.body ?? {});
        const slot = resolveLegacySlot(parsed);
        let offerId = parsed.offerId;
        if (!offerId) {
            const classes = await (0, teacherClassModel_1.getTeacherClassesByTeacher)(parsed.teacherId);
            const fallback = classes.find(item => item.active);
            if (!fallback) {
                return res.status(404).json({ message: "Nenhuma oferta encontrada para este professor" });
            }
            offerId = fallback.id;
        }
        const booking = await (0, bookingModel_1.createBooking)({
            studentId: Number(authUser.id),
            offerId,
            date: slot.date,
            startTime: slot.startTime,
            notes: parsed.notes ?? null,
        });
        return res.status(201).json(booking);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ message: error.issues[0]?.message ?? "Dados invalidos" });
        }
        if (error instanceof bookingService_1.BookingServiceError) {
            return res.status(error.statusCode).json({ message: error.message, code: error.code });
        }
        console.error("Erro ao criar agendamento:", error);
        return res.status(500).json({ message: "Erro interno ao agendar" });
    }
};
exports.createScheduleHandler = createScheduleHandler;
const getSchedulesHandler = async (req, res) => {
    try {
        const user = req.user;
        const schedules = await (0, scheduleModel_1.getSchedulesByUser)(user.id, user.role);
        return res.json(schedules);
    }
    catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
    }
};
exports.getSchedulesHandler = getSchedulesHandler;
