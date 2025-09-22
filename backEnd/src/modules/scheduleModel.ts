import { prisma } from "../config/db";

export const createSchedule = (data: { studentId: number; teacherId: number; date: Date }) => {
  return prisma.schedule.create({ data });
};

export const getSchedulesByUser = (userId: number, role: string) => {
  if (role === "student") {
    return prisma.schedule.findMany({
      where: { studentId: userId },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });
  } else if (role === "teacher") {
    return prisma.schedule.findMany({
      where: { teacherId: userId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
  }
  return [];
};
