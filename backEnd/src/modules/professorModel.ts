import { prisma } from "../config/db";

// Cria professor
export const createUser = (data: { name: string; email: string; password: string; role: string }) => {
  return prisma.user.create({ data });
};

// Retorna todos os professores
export const getAllTeachers = () => {
  return prisma.user.findMany({
    where: { role: "teacher" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
};

// Buscar professor por ID
export const getTeacherById = (id: number) => {
  return prisma.user.findFirst({
    where: { id, role: "teacher" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
};
