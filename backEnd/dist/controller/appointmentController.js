"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectAppointment = exports.acceptAppointment = exports.listPendingAppointments = void 0;
const bookingModel_1 = require("../modules/bookingModel");
const FORBIDDEN = { message: "Permissão negada" };
const INVALID_STATUS = { message: "Status atual não permite essa ação" };
const NOT_FOUND = { message: "Agendamento não encontrado" };
const ensureTeacher = (req, res) => {
    const user = req.user;
    if (!user || (user.role || "").toLowerCase() !== "teacher") {
        res.status(403).json(FORBIDDEN);
        return null;
    }
    return user;
};
const listPendingAppointments = async (req, res) => {
    const user = ensureTeacher(req, res);
    if (!user)
        return;
    try {
        const pending = await (0, bookingModel_1.findPendingByTeacher)(Number(user.id));
        return res.json(pending);
    }
    catch (error) {
        console.error("Erro ao listar agendamentos pendentes:", error);
        return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
    }
};
exports.listPendingAppointments = listPendingAppointments;
const acceptAppointment = async (req, res) => {
    const user = ensureTeacher(req, res);
    if (!user)
        return;
    const bookingId = Number(req.params.id);
    if (!Number.isFinite(bookingId)) {
        return res.status(400).json({ message: "ID inválido" });
    }
    try {
        const result = await (0, bookingModel_1.updateBookingStatusByTeacher)(bookingId, Number(user.id), "CONFIRMED");
        if (result === "FORBIDDEN")
            return res.status(403).json(FORBIDDEN);
        if (result === "INVALID_STATUS")
            return res.status(400).json(INVALID_STATUS);
        if (!result)
            return res.status(404).json(NOT_FOUND);
        return res.json(result);
    }
    catch (error) {
        console.error("Erro ao aceitar agendamento:", error);
        return res.status(500).json({ message: "Erro interno ao atualizar agendamento" });
    }
};
exports.acceptAppointment = acceptAppointment;
const rejectAppointment = async (req, res) => {
    const user = ensureTeacher(req, res);
    if (!user)
        return;
    const bookingId = Number(req.params.id);
    if (!Number.isFinite(bookingId)) {
        return res.status(400).json({ message: "ID inválido" });
    }
    try {
        const result = await (0, bookingModel_1.updateBookingStatusByTeacher)(bookingId, Number(user.id), "REJECTED");
        if (result === "FORBIDDEN")
            return res.status(403).json(FORBIDDEN);
        if (result === "INVALID_STATUS")
            return res.status(400).json(INVALID_STATUS);
        if (!result)
            return res.status(404).json(NOT_FOUND);
        return res.json(result);
    }
    catch (error) {
        console.error("Erro ao recusar agendamento:", error);
        return res.status(500).json({ message: "Erro interno ao atualizar agendamento" });
    }
};
exports.rejectAppointment = rejectAppointment;
