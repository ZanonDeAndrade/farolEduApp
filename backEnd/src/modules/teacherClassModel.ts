import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export interface CreateTeacherClassInput {
  teacherId: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  modality?: string;
  startTime?: Date | null;
  durationMinutes?: number;
  price?: number | Prisma.Decimal | null;
}

export const createTeacherClass = async (input: CreateTeacherClassInput) => {
  const { teacherId, title } = input;
  if (!Number.isFinite(teacherId)) {
    throw new Error("INVALID_TEACHER_ID");
  }
  if (!(title ?? "").trim()) {
    throw new Error("TITLE_REQUIRED");
  }

  let price: Prisma.Decimal | null = null;
  if (input.price !== undefined && input.price !== null) {
    if (input.price instanceof Prisma.Decimal) {
      price = input.price;
    } else if (typeof input.price === "number") {
      price = new Prisma.Decimal(input.price.toFixed(2));
    } else {
      price = new Prisma.Decimal(input.price);
    }
  }

  return prisma.teacherClass.create({
    data: {
      teacherId,
      title: title.trim(),
      description: input.description?.trim() || null,
      subject: input.subject?.trim() || null,
      modality: (input.modality ?? "online").trim().toLowerCase(),
      startTime: input.startTime ?? null,
      durationMinutes: Number.isFinite(input.durationMinutes)
        ? Math.max(15, Math.round(input.durationMinutes as number))
        : 60,
      price,
    },
  });
};

export const getTeacherClassesByTeacher = async (teacherId: number) => {
  if (!Number.isFinite(teacherId)) {
    throw new Error("INVALID_TEACHER_ID");
  }

  return prisma.teacherClass.findMany({
    where: { teacherId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
};
