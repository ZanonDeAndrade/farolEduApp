import { Request, Response } from "express";
import { ZodError } from "zod";
import { createSchedule, getSchedulesByUser } from "../modules/scheduleModel";
import { scheduleInputSchema } from "../utils/validators";

export const createScheduleHandler = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const parsed = scheduleInputSchema.parse(req.body ?? {});

    const schedule = await createSchedule({
      studentId,
      teacherId: parsed.teacherId,
      date: new Date(parsed.date),
    });

    return res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? "Dados inválidos" });
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
