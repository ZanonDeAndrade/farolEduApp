"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyScheduleInputSchema = exports.availableSlotsQuerySchema = exports.availabilityInputSchema = exports.bookingInputSchema = exports.teacherClassUpdateSchema = exports.teacherClassInputSchema = void 0;
const zod_1 = require("zod");
const dateTime_1 = require("./dateTime");
const MODALITY_TARGETS = ["ONLINE", "PRESENCIAL", "AMBOS"];
const modalityMap = new Map([
    ["ONLINE", "ONLINE"],
    ["ONLINE ", "ONLINE"],
    ["PRESENCIAL", "PRESENCIAL"],
    ["AMBOS", "AMBOS"],
    ["HYBRID", "AMBOS"],
    ["HYBRIDO", "AMBOS"],
    ["HIBRIDO", "AMBOS"],
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
    .refine(val => MODALITY_TARGETS.includes(val), { message: "Modalidade invalida" });
exports.teacherClassInputSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3, "Informe um titulo"),
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
    offerId: zod_1.z.coerce.number().int().positive("offerId invalido"),
    date: zod_1.z.string().regex(dateTime_1.DATE_PATTERN, "date deve estar no formato YYYY-MM-DD"),
    startTime: zod_1.z.string().regex(dateTime_1.TIME_PATTERN, "Horario inicial deve estar em HH:mm"),
    notes: zod_1.z.string().trim().max(500).optional(),
});
exports.availabilityInputSchema = zod_1.z
    .object({
    dayOfWeek: zod_1.z.coerce
        .number()
        .int()
        .min(0, "dayOfWeek deve estar entre 0 e 6")
        .max(6, "dayOfWeek deve estar entre 0 e 6"),
    startTime: zod_1.z.string().regex(dateTime_1.TIME_PATTERN, "Horario inicial deve estar em HH:mm"),
    endTime: zod_1.z.string().regex(dateTime_1.TIME_PATTERN, "Horario final deve estar em HH:mm"),
    slotDuration: zod_1.z.coerce.number().int().positive("A duracao do slot deve ser maior que zero"),
})
    .refine(data => (0, dateTime_1.parseTimeToMinutes)(data.startTime) < (0, dateTime_1.parseTimeToMinutes)(data.endTime), {
    message: "Hora final deve ser maior que a hora inicial",
    path: ["endTime"],
})
    .refine(data => (0, dateTime_1.doesTimeRangeFit)(data.startTime, data.endTime, data.slotDuration), {
    message: "A duracao do slot deve caber integralmente dentro da janela informada",
    path: ["slotDuration"],
});
exports.availableSlotsQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date deve estar no formato YYYY-MM-DD"),
    offerId: zod_1.z.preprocess(value => (value === undefined || value === null || value === "" ? undefined : value), zod_1.z.coerce.number().int().positive("offerId invalido").optional()),
});
exports.legacyScheduleInputSchema = zod_1.z
    .object({
    teacherId: zod_1.z.coerce.number().int().positive("teacherId invalido"),
    offerId: zod_1.z.coerce.number().int().positive().optional(),
    startTime: zod_1.z.string().min(1).optional(),
    date: zod_1.z.string().regex(dateTime_1.DATE_PATTERN, "date deve estar no formato YYYY-MM-DD").optional(),
    slotTime: zod_1.z.string().regex(dateTime_1.TIME_PATTERN, "Horario deve estar em HH:mm").optional(),
    notes: zod_1.z.string().trim().max(500).optional(),
})
    .refine(data => Boolean(data.startTime || (data.date && data.slotTime)), {
    message: "Envie startTime legado ou date + slotTime",
});
