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

export const updateTeacherClassByTeacher = async (
  teacherId: number,
  classId: number,
  data: Partial<CreateTeacherClassInput>,
) => {
  if (!Number.isFinite(teacherId) || !Number.isFinite(classId)) {
    throw new Error("INVALID_IDS");
  }

  const existing = await prisma.teacherClass.findFirst({
    where: { id: classId, teacherId },
  });
  if (!existing) {
    return null;
  }

  let price: Prisma.Decimal | null | undefined = existing.price;
  if (data.price !== undefined) {
    if (data.price === null) {
      price = null;
    } else if (data.price instanceof Prisma.Decimal) {
      price = data.price;
    } else {
      price = new Prisma.Decimal(Number(data.price).toFixed(2));
    }
  }

  return prisma.teacherClass.update({
    where: { id: classId },
    data: {
      title: data.title?.trim() ?? existing.title,
      description: data.description?.trim() ?? existing.description,
      subject: data.subject?.trim() ?? existing.subject,
      modality: data.modality?.trim().toLowerCase() ?? existing.modality,
      startTime: data.startTime ?? existing.startTime,
      durationMinutes:
        Number.isFinite(data.durationMinutes) && data.durationMinutes
          ? Math.max(15, Math.round(data.durationMinutes))
          : existing.durationMinutes,
      price,
    },
  });
};

export const deleteTeacherClassByTeacher = async (teacherId: number, classId: number) => {
  if (!Number.isFinite(teacherId) || !Number.isFinite(classId)) {
    throw new Error("INVALID_IDS");
  }

  const existing = await prisma.teacherClass.findFirst({
    where: { id: classId, teacherId },
    select: { id: true },
  });
  if (!existing) return null;

  await prisma.teacherClass.delete({ where: { id: classId } });
  return true;
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

export interface PublicTeacherClassFilters {
  query?: string;
  modality?: string;
  city?: string;
  take?: number;
  teacherId?: number;
}

export const getPublicTeacherClasses = async (filters: PublicTeacherClassFilters) => {
  const { query, modality, city, teacherId } = filters ?? {};
  const normalizedTake = Number.isFinite(filters?.take) ? Math.min(Math.max(Math.trunc(filters!.take as number), 1), 50) : 12;

  const where: Prisma.TeacherClassWhereInput = {};
  const andConditions: Prisma.TeacherClassWhereInput[] = [];

  if (query && query.trim()) {
    const normalizedQuery = query.trim();
    andConditions.push({
      OR: [
        { title: { contains: normalizedQuery, mode: "insensitive" } },
        { subject: { contains: normalizedQuery, mode: "insensitive" } },
        { description: { contains: normalizedQuery, mode: "insensitive" } },
        {
          teacher: {
            name: { contains: normalizedQuery, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (modality && modality.trim()) {
    andConditions.push({
      modality: { equals: modality.trim().toLowerCase() },
    });
  }

  if (city && city.trim()) {
    const normalizedCity = city.trim();
    andConditions.push({
      teacher: {
        teacherProfile: {
          city: { contains: normalizedCity, mode: "insensitive" },
        },
      },
    });
  }

  if (Number.isFinite(teacherId)) {
    andConditions.push({ teacherId: Number(teacherId) });
  }

  if (andConditions.length) {
    where.AND = andConditions;
  }

  return prisma.teacherClass.findMany({
    where,
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          teacherProfile: {
            select: {
              city: true,
              region: true,
              experience: true,
              profilePhoto: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: normalizedTake,
  });
};
