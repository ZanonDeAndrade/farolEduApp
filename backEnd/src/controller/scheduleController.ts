import { Request, Response } from "express";
import { ZodError } from "zod";
import { createBooking } from "../modules/bookingModel";
import { getSchedulesByUser } from "../modules/scheduleModel";
import { bookingInputSchema, legacyScheduleInputSchema } from "../utils/validators";
import { getTeacherClassesByTeacher } from "../modules/teacherClassModel";

export const createScheduleHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "student") {
      return res.status(403).json({ message: "Apenas estudantes podem criar agendamentos" });
    }

    const parsed = legacyScheduleInputSchema.parse(req.body ?? {});
    const startIso = parsed.startTime ?? parsed.date ?? "";
    if (!startIso) {
      return res.status(400).json({ message: "Data inválida" });
    }
    const startTime = new Date(startIso);
    if (Number.isNaN(startTime.getTime())) {
      return res.status(400).json({ message: "Data inválida" });
    }

    let offerId = parsed.offerId;
    if (!offerId) {
      const classes = await getTeacherClassesByTeacher(parsed.teacherId);
      const fallback = classes.find(cls => cls.active);
      if (!fallback) {
        return res.status(404).json({ message: "Nenhuma oferta encontrada para este professor" });
      }
      offerId = fallback.id;
    }

    const booking = await createBooking({
      studentId: Number(authUser.id),
      offerId,
      startTime,
      notes: parsed.notes ?? null,
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? "Dados inválidos" });
    }
    if (error?.code === "BOOKING_CONFLICT_TEACHER" || error?.code === "BOOKING_CONFLICT_STUDENT") {
      return res.status(409).json({ message: "Conflito de agenda", code: error.code });
    }
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ message: "Erro interno ao agendar" });
  }
};

export const getSchedulesHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const schedules = await getSchedulesByUser(user.id, user.role);
    return res.json(schedules);
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
  }
};
