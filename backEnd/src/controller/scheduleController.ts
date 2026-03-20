import { Request, Response } from "express";
import { ZodError } from "zod";
import { createBooking } from "../modules/bookingModel";
import { getSchedulesByUser } from "../modules/scheduleModel";
import { getTeacherClassesByTeacher } from "../modules/teacherClassModel";
import { BookingServiceError } from "../services/bookingService";
import { getLocalDateTimeParts } from "../utils/dateTime";
import { legacyScheduleInputSchema } from "../utils/validators";

const resolveLegacySlot = (payload: { startTime?: string; date?: string; slotTime?: string }) => {
  if (payload.date && payload.slotTime) {
    return {
      date: payload.date,
      startTime: payload.slotTime,
    };
  }

  if (!payload.startTime) {
    throw new BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
  }

  const legacyDate = new Date(payload.startTime);
  if (Number.isNaN(legacyDate.getTime())) {
    throw new BookingServiceError("Horario invalido", "INVALID_SLOT", 400);
  }

  const parts = getLocalDateTimeParts(legacyDate);
  return {
    date: parts.date,
    startTime: parts.time,
  };
};

export const createScheduleHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "student") {
      return res.status(403).json({ message: "Apenas estudantes podem criar agendamentos" });
    }

    const parsed = legacyScheduleInputSchema.parse(req.body ?? {});
    const slot = resolveLegacySlot(parsed);

    let offerId = parsed.offerId;
    if (!offerId) {
      const classes = await getTeacherClassesByTeacher(parsed.teacherId);
      const fallback = classes.find(item => item.active);
      if (!fallback) {
        return res.status(404).json({ message: "Nenhuma oferta encontrada para este professor" });
      }
      offerId = fallback.id;
    }

    const booking = await createBooking({
      studentId: Number(authUser.id),
      offerId,
      date: slot.date,
      startTime: slot.startTime,
      notes: parsed.notes ?? null,
    });

    return res.status(201).json(booking);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? "Dados invalidos" });
    }
    if (error instanceof BookingServiceError) {
      return res.status(error.statusCode).json({ message: error.message, code: error.code });
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
