import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  getAllTeachers,
  getTeacherById,
  getUserByEmailWithPassword,
} from "../modules/professorModel";
import { prisma } from "../config/db";
import { JWT_SECRET } from "../config/env";

// Cadastro de professor
export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Dados incompletos" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "teacher",
    });
    return res.status(201).json(user);
  } catch (error: any) {
    if (error?.message === "EMAIL_ALREADY_TAKEN") {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }
    console.error("Erro ao cadastrar professor:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Login de professor (case-insensitive + valida role)
export const loginTeacher = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email e senha obrigatórios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmailWithPassword(normalizedEmail);

    console.log("LOGIN_DEBUG:", {
      email: normalizedEmail,
      found: !!user,
      role: user?.role,
      id: user?.id,
    });

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    if ((user.role || "").trim().toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Conta não é de professor", details: { roleEncontrado: user.role } });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Senha inválida" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login realizado com sucesso", token, teacher: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Erro no login de professor:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Listar todos os professores
export const listTeachers = async (_req: Request, res: Response) => {
  try {
    const teachers = await getAllTeachers();
    if (!teachers.length) return res.status(404).json({ message: "Nenhum professor encontrado" });
    return res.json(teachers);
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Buscar professor por ID
export const getTeacher = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

    const teacher = await getTeacherById(id);
    if (!teacher) return res.status(404).json({ message: "Professor não encontrado" });

    return res.json(teacher);
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// (Opcional) endpoint de debug para conferir o usuário do token
export const meFromToken = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user || {};
    if (!id) return res.status(401).json({ message: "Sem usuário no token" });

    const me = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!me) return res.status(404).json({ message: "Usuário do token não encontrado" });
    return res.json({ tokenUser: (req as any).user, dbUser: me });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno" });
  }
};
