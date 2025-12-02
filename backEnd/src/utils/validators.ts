import { z } from "zod";

const MODALITY_ENUM = ["online", "home", "travel", "hybrid", "presencial"] as const;

export const teacherClassInputSchema = z.object({
  title: z.string().trim().min(3, "Informe um título"),
  description: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  modality: z.enum(MODALITY_ENUM).default("online"),
  startTime: z.string().datetime().optional(),
  durationMinutes: z.coerce.number().int().min(15).max(600).optional(),
  price: z.coerce.number().nonnegative().optional(),
});

export const teacherClassUpdateSchema = teacherClassInputSchema.partial().refine(
  data =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.subject !== undefined ||
    data.modality !== undefined ||
    data.startTime !== undefined ||
    data.durationMinutes !== undefined ||
    data.price !== undefined,
  { message: "Envie ao menos um campo para atualizar" },
);

export const scheduleInputSchema = z.object({
  teacherId: z.coerce.number().int().positive("teacherId inválido"),
  date: z.string().datetime("Data deve estar em formato ISO"),
});

export type TeacherClassInput = z.infer<typeof teacherClassInputSchema>;
export type TeacherClassUpdateInput = z.infer<typeof teacherClassUpdateSchema>;
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
