"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyScheduleInputSchema = exports.bookingInputSchema = exports.teacherClassUpdateSchema = exports.teacherClassInputSchema = void 0;
const zod_1 = require("zod");
const MODALITY_TARGETS = ["ONLINE", "PRESENCIAL", "AMBOS"];
const modalityMap = new Map([
    ["ONLINE", "ONLINE"],
    ["ONLINE ", "ONLINE"],
    ["PRESENCIAL", "PRESENCIAL"],
    ["AMBOS", "AMBOS"],
    ["HYBRID", "AMBOS"],
    ["HYBRIDO", "AMBOS"],
    ["HYBRÍDO", "AMBOS"],
    ["HOME", "PRESENCIAL"],
    ["TRAVEL", "PRESENCIAL"],
]);
const normalizeModality = (value) => {
    if (typeof value !== "string")
        return "ONLINE";
    const upper = value.trim().toUpperCase();
    return modalityMap.get(upper) ?? (MODALITY_TARGETS.includes(upper) ? upper : "ONLINE");
};
const modalitySchema = zod_1.z
    .string()
    .trim()
    .transform(normalizeModality)
    .refine(val => MODALITY_TARGETS.includes(val), { message: "Modalidade invÇ­lida" });
exports.teacherClassInputSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3, "Informe um tヴtulo"),
    description: zod_1.z.string().trim().optional(),
    subject: zod_1.z.string().trim().optional(),
    modality: modalitySchema.default("ONLINE"),
    startTime: zod_1.z.string().datetime().optional(),
    durationMinutes: zod_1.z.coerce.number().int().min(15).max(600).optional(),
    price: zod_1.z.coerce.number().nonnegative().optional(),
    priceCents: zod_1.z.coerce.number().int().nonnegative().optional(),
    location: zod_1.z.string().trim().min(2).optional(),
    active: zod_1.z.boolean().optional(),
});
exports.teacherClassUpdateSchema = exports.teacherClassInputSchema.partial().refine(data => data.title !== undefined ||
    data.description !== undefined ||
    data.subject !== undefined ||
    data.modality !== undefined ||
    data.startTime !== undefined ||
    data.durationMinutes !== undefined ||
    data.price !== undefined ||
    data.priceCents !== undefined ||
    data.location !== undefined ||
    data.active !== undefined, { message: "Envie ao menos um campo para atualizar" });
exports.bookingInputSchema = zod_1.z.object({
    offerId: zod_1.z.coerce.number().int().positive("offerId invケlido"),
    startTime: zod_1.z.string().datetime("Data deve estar em formato ISO"),
    notes: zod_1.z.string().trim().max(500).optional(),
});
exports.legacyScheduleInputSchema = zod_1.z
    .object({
    teacherId: zod_1.z.coerce.number().int().positive("teacherId invケlido"),
    offerId: zod_1.z.coerce.number().int().positive().optional(),
    startTime: zod_1.z.string().min(1).optional(),
    date: zod_1.z.string().min(1).optional(),
    notes: zod_1.z.string().trim().max(500).optional(),
})
    .refine(data => Boolean(data.startTime || data.date), { message: "startTime ou date sÇœo obrigatÇürios" });
