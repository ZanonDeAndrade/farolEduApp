import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createUser, getAllTeachers, getTeacherById } from "../modules/professorModel";

// Cadastro direto de professor
export const registerTeacher = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Dados incompletos" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword, role: "teacher" });

  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

export const listTeachers = async (_req: Request, res: Response) => {
  const teachers = await getAllTeachers();
  res.json(teachers);
};

export const getTeacher = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const teacher = await getTeacherById(id);
  if (!teacher) return res.status(404).json({ message: "Professor não encontrado" });
  res.json(teacher);
};
