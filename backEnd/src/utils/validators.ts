import { z } from "zod";

const MODALITY_TARGETS = ["ONLINE", "PRESENCIAL", "AMBOS"] as const;
const modalityMap = new Map<string, (typeof MODALITY_TARGETS)[number]>([
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

const normalizeModality = (value: unknown) => {
  if (typeof value !== "string") return "ONLINE";
  const upper = value.trim().toUpperCase();
  return modalityMap.get(upper) ?? (MODALITY_TARGETS.includes(upper as any) ? (upper as any) : "ONLINE");
};

const modalitySchema = z
  .string()
  .trim()
  .transform(normalizeModality)
  .refine(val => MODALITY_TARGETS.includes(val as any), { message: "Modalidade invÇ­lida" });

export const teacherClassInputSchema = z.object({
  title: z.string().trim().min(3, "Informe um tヴtulo"),
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
  offerId: z.coerce.number().int().positive("offerId invケlido"),
  startTime: z.string().datetime("Data deve estar em formato ISO"),
  notes: z.string().trim().max(500).optional(),
});

export const legacyScheduleInputSchema = z
  .object({
    teacherId: z.coerce.number().int().positive("teacherId invケlido"),
    offerId: z.coerce.number().int().positive().optional(),
    startTime: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(data => Boolean(data.startTime || data.date), { message: "startTime ou date sÇœo obrigatÇürios" });

export type TeacherClassInput = z.infer<typeof teacherClassInputSchema>;
export type TeacherClassUpdateInput = z.infer<typeof teacherClassUpdateSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;
