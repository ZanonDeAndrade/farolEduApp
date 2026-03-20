"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherAvailableSlotsHandler = exports.deleteAvailabilityHandler = exports.listMyAvailabilityHandler = exports.createAvailabilityHandler = void 0;
const zod_1 = require("zod");
const availabilityService_1 = require("../services/availabilityService");
const validators_1 = require("../utils/validators");
const sendAvailabilityError = (res, error) => {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({ message: error.issues[0]?.message ?? "Dados inválidos" });
    }
    if (error instanceof availabilityService_1.AvailabilityServiceError) {
        return res.status(error.statusCode).json({ message: error.message, code: error.code });
    }
    return null;
};
const createAvailabilityHandler = async (req, res) => {
    try {
        const teacher = req.user;
        const parsed = validators_1.availabilityInputSchema.parse(req.body ?? {});
        const created = await (0, availabilityService_1.createAvailabilityForTeacher)(Number(teacher.id), parsed);
        return res.status(201).json(created);
    }
    catch (error) {
        const handled = sendAvailabilityError(res, error);
        if (handled)
            return handled;
        console.error("Erro ao criar disponibilidade:", error);
        return res.status(500).json({ message: "Erro interno ao criar disponibilidade" });
    }
};
exports.createAvailabilityHandler = createAvailabilityHandler;
const listMyAvailabilityHandler = async (req, res) => {
    try {
        const teacher = req.user;
        const availability = await (0, availabilityService_1.listAvailabilityByTeacher)(Number(teacher.id));
        return res.json(availability);
    }
    catch (error) {
        console.error("Erro ao listar disponibilidade:", error);
        return res.status(500).json({ message: "Erro interno ao listar disponibilidade" });
    }
};
exports.listMyAvailabilityHandler = listMyAvailabilityHandler;
const deleteAvailabilityHandler = async (req, res) => {
    try {
        const teacher = req.user;
        const id = String(req.params.id ?? "").trim();
        if (!id) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const removed = await (0, availabilityService_1.deleteAvailabilityByTeacher)(Number(teacher.id), id);
        if (!removed) {
            return res.status(404).json({ message: "Disponibilidade não encontrada" });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao remover disponibilidade:", error);
        return res.status(500).json({ message: "Erro interno ao remover disponibilidade" });
    }
};
exports.deleteAvailabilityHandler = deleteAvailabilityHandler;
const getTeacherAvailableSlotsHandler = async (req, res) => {
    try {
        const teacherId = Number(req.params.id);
        if (!Number.isFinite(teacherId)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const parsed = validators_1.availableSlotsQuerySchema.parse(req.query ?? {});
        const slots = await (0, availabilityService_1.getAvailableSlots)(teacherId, parsed.date, { offerId: parsed.offerId });
        return res.json(slots);
    }
    catch (error) {
        const handled = sendAvailabilityError(res, error);
        if (handled)
            return handled;
        console.error("Erro ao listar slots disponíveis:", error);
        return res.status(500).json({ message: "Erro interno ao listar slots disponíveis" });
    }
};
exports.getTeacherAvailableSlotsHandler = getTeacherAvailableSlotsHandler;
