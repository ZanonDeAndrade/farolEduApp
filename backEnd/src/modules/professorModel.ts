import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

// Criar usuário (professor)
export const createUser = async (data: {
  name: string;
  email: string;
  password: string; // hash
  role: string;     // schema usa String
}) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "teacher",
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return user;
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("EMAIL_ALREADY_TAKEN");
    }
    throw err;
  }
};

// Listar todos os professores
export const getAllTeachers = async () => {
  const teachers = await prisma.user.findMany({
    where: { role: { equals: "teacher", mode: "insensitive" } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { id: "asc" },
  });
  // DEBUG opcional
  console.log("DEBUG listTeachers count=", teachers.length);
  return teachers;
};

// Buscar professor por ID (já filtrando por role=teacher)
export const getTeacherById = async (id: number) => {
  const teacher = await prisma.user.findFirst({
    where: {
      id,
      role: { equals: "teacher", mode: "insensitive" },
    },
    select: { id: true, name: true, email: true, role: true },
  });
  // DEBUG opcional
  console.log("DEBUG getTeacherById id=", id, "found=", !!teacher);
  return teacher;
};

// Busca por e-mail (case-insensitive), usada no login
export const getUserByEmailWithPassword = async (email: string) => {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, name: true, email: true, role: true, password: true },
  });
};
