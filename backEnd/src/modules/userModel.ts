import { prisma } from "../config/db";

export const createUser = (data: { name: string; email: string; password: string; role: string }) => {
  return prisma.user.create({ data });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getAllUsers = () => {
  return prisma.user.findMany();
};
