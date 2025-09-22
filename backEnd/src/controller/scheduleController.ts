import { Request, Response } from "express";
import { createSchedule, getSchedulesByUser } from "../modules/scheduleModel";

export const createScheduleHandler = async (req: Request, res: Response) => {
  const { teacherId, date } = req.body;
  const studentId = (req as any).user.id;

  if (!teacherId || !date) return res.status(400).json({ message: "Dados incompletos" });

  const schedule = await createSchedule({
    studentId,
    teacherId,
    date: new Date(date),
  });

  res.status(201).json(schedule);
};

export const getSchedulesHandler = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const schedules = await getSchedulesByUser(user.id, user.role);
  res.json(schedules);
};
