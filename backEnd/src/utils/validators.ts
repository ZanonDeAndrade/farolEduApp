import { z } from "zod";
import { DATE_PATTERN, doesTimeRangeFit, parseTimeToMinutes, TIME_PATTERN } from "./dateTime";

const MODALITY_TARGETS = ["ONLINE", "PRESENCIAL", "AMBOS"] as const;
const modalityMap = new Map<string, (typeof MODALITY_TARGETS)[number]>([
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

const normalizeModality = (value: unknown) => {
  if (typeof value !== "string") return "ONLINE";
  const upper = value.trim().toUpperCase();
  return modalityMap.get(upper) ?? (MODALITY_TARGETS.includes(upper as any) ? (upper as any) : "ONLINE");
};

const modalitySchema = z
  .string()
  .trim()
  .transform(normalizeModality)
  .refine(val => MODALITY_TARGETS.includes(val as any), { message: "Modalidade invalida" });

export const teacherClassInputSchema = z.object({
  title: z.string().trim().min(3, "Informe um titulo"),
  description: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  modality: modalitySchema.default("ONLINE"),
  startTime: z.string().datetime().optional(),
  durationMinutes: z.coerce.number().int().min(15).max(600).optional(),
  price: z.coerce.number().nonnegative().optional(),
  priceCents: z.coerce.number().int().nonnegative().optional(),
  location: z.string().trim().min(2).optional(),
  active: z.boolean().optional(),
});

export const teacherClassUpdateSchema = teacherClassInputSchema.partial().refine(
  data =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.subject !== undefined ||
    data.modality !== undefined ||
    data.startTime !== undefined ||
    data.durationMinutes !== undefined ||
    data.price !== undefined ||
    data.priceCents !== undefined ||
    data.location !== undefined ||
    data.active !== undefined,
  { message: "Envie ao menos um campo para atualizar" },
);

export const bookingInputSchema = z.object({
  offerId: z.coerce.number().int().positive("offerId invalido"),
  date: z.string().regex(DATE_PATTERN, "date deve estar no formato YYYY-MM-DD"),
  startTime: z.string().regex(TIME_PATTERN, "Horario inicial deve estar em HH:mm"),
  notes: z.string().trim().max(500).optional(),
});

export const availabilityInputSchema = z
  .object({
    dayOfWeek: z.coerce
      .number()
      .int()
      .min(0, "dayOfWeek deve estar entre 0 e 6")
      .max(6, "dayOfWeek deve estar entre 0 e 6"),
    startTime: z.string().regex(TIME_PATTERN, "Horario inicial deve estar em HH:mm"),
    endTime: z.string().regex(TIME_PATTERN, "Horario final deve estar em HH:mm"),
    slotDuration: z.coerce.number().int().positive("A duracao do slot deve ser maior que zero"),
  })
  .refine(data => parseTimeToMinutes(data.startTime) < parseTimeToMinutes(data.endTime), {
    message: "Hora final deve ser maior que a hora inicial",
    path: ["endTime"],
  })
  .refine(data => doesTimeRangeFit(data.startTime, data.endTime, data.slotDuration), {
    message: "A duracao do slot deve caber integralmente dentro da janela informada",
    path: ["slotDuration"],
  });

export const availableSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date deve estar no formato YYYY-MM-DD"),
  offerId: z.preprocess(
    value => (value === undefined || value === null || value === "" ? undefined : value),
    z.coerce.number().int().positive("offerId invalido").optional(),
  ),
});

export const legacyScheduleInputSchema = z
  .object({
    teacherId: z.coerce.number().int().positive("teacherId invalido"),
    offerId: z.coerce.number().int().positive().optional(),
    startTime: z.string().min(1).optional(),
    date: z.string().regex(DATE_PATTERN, "date deve estar no formato YYYY-MM-DD").optional(),
    slotTime: z.string().regex(TIME_PATTERN, "Horario deve estar em HH:mm").optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(data => Boolean(data.startTime || (data.date && data.slotTime)), {
    message: "Envie startTime legado ou date + slotTime",
  });

export type TeacherClassInput = z.infer<typeof teacherClassInputSchema>;
export type TeacherClassUpdateInput = z.infer<typeof teacherClassUpdateSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;
