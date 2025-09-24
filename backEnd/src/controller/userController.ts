import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { JWT_SECRET } from "../config/env";

// Cadastro de estudante
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    // ⚠️ Apenas o que o backend precisa!
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Dados incompletos" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        role: "student",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json(user);
  } catch (err: any) {
    // P2002 = email duplicado
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }
    console.error("Erro ao cadastrar estudante:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Login de estudante
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email e senha obrigatórios" });
    }

    const student = await prisma.user.findFirst({
      where: {
        email: { equals: email.trim().toLowerCase(), mode: "insensitive" },
        role: { equals: "student", mode: "insensitive" },
      },
      select: { id: true, name: true, email: true, role: true, password: true },
    });

    if (!student) {
      return res.status(401).json({ message: "Estudante não encontrado" });
    }

    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).json({ message: "Senha inválida" });

    const token = jwt.sign({ id: student.id, role: student.role }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: { id: student.id, name: student.name, email: student.email, role: student.role },
    });
  } catch (err) {
    console.error("Erro no login de estudante:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Listar estudantes
export const listStudents = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: { equals: "student", mode: "insensitive" } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { id: "asc" },
    });

    if (!students.length) {
      return res.status(404).json({ message: "Nenhum estudante encontrado" });
    }

    return res.json(students);
  } catch (err) {
    console.error("Erro ao listar estudantes:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Buscar estudante por ID
export const getStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

    const student = await prisma.user.findFirst({
      where: { id, role: { equals: "student", mode: "insensitive" } },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!student) return res.status(404).json({ message: "Estudante não encontrado" });

    return res.json(student);
  } catch (err) {
    console.error("Erro ao buscar estudante:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
