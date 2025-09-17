// src/controllers/scheduleController.ts
import { Request, Response } from "express";
import { prisma } from "../config/db";

export const createSchedule = async (req: Request, res: Response) => {
  const { studentId, teacherId, date } = req.body;
  const schedule = await prisma.schedule.create({
    data: {
      studentId,
      teacherId,
      date: new Date(date)
    }
  });
  res.status(201).json(schedule);
};

export const getSchedules = async (_req: Request, res: Response) => {
  const schedules = await prisma.schedule.findMany({ include: { student: true, teacher: true } });
  res.json(schedules);
};
