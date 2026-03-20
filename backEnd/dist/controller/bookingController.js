"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingHandler = exports.listMyBookingsHandler = exports.createBookingHandler = void 0;
const zod_1 = require("zod");
const bookingModel_1 = require("../modules/bookingModel");
const bookingService_1 = require("../services/bookingService");
const validators_1 = require("../utils/validators");
const parseISODate = (value) => {
    const candidate = typeof value === "string"
        ? value
        : Array.isArray(value) && typeof value[0] === "string"
            ? value[0]
            : undefined;
    if (!candidate)
        return undefined;
    const date = new Date(candidate);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const createBookingHandler = async (req, res) => {
    const authUser = req.user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "student") {
        return res.status(403).json({ message: "Apenas estudantes podem criar agendamentos" });
    }
    try {
        const parsed = validators_1.bookingInputSchema.parse(req.body ?? {});
        const booking = await (0, bookingModel_1.createBooking)({
            studentId: Number(authUser.id),
            offerId: parsed.offerId,
            date: parsed.date,
            startTime: parsed.startTime,
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
        console.error("Erro ao criar booking:", error);
        return res.status(500).json({ message: "Erro interno ao criar agendamento" });
    }
};
exports.createBookingHandler = createBookingHandler;
const listMyBookingsHandler = async (req, res) => {
    try {
        const user = req.user;
        const from = parseISODate(req.query.from);
        const to = parseISODate(req.query.to);
        const bookings = await (0, bookingModel_1.listBookingsByUser)(Number(user.id), String(user.role || ""), { from, to });
        return res.json(bookings);
    }
    catch (error) {
        console.error("Erro ao listar bookings:", error);
        return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
    }
};
exports.listMyBookingsHandler = listMyBookingsHandler;
const cancelBookingHandler = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        if (!Number.isFinite(bookingId)) {
            return res.status(400).json({ message: "ID invalido" });
        }
        const actor = req.user;
        const cancelled = await (0, bookingModel_1.cancelBookingByActor)(bookingId, Number(actor.id));
        if (cancelled === "FORBIDDEN") {
            return res.status(403).json({ message: "Sem permissao para cancelar este agendamento" });
        }
        if (!cancelled) {
            return res.status(404).json({ message: "Agendamento nao encontrado" });
        }
        return res.json(cancelled);
    }
    catch (error) {
        console.error("Erro ao cancelar booking:", error);
        return res.status(500).json({ message: "Erro interno ao cancelar agendamento" });
    }
};
exports.cancelBookingHandler = cancelBookingHandler;
