import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../modules/userModel";
import { getTeacherById } from "../modules/professorModel";
import { JWT_SECRET } from "../config/env";

const INVALID_MESSAGE = "Email ou senha inválidos";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: INVALID_MESSAGE });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({ message: INVALID_MESSAGE });
    }

    const roleNormalized = (user.role ?? "").toLowerCase();
    const roleOut = roleNormalized === "teacher" ? "PROFESSOR" : roleNormalized === "student" ? "ALUNO" : user.role;

    let teacherProfile = null;
    if (roleNormalized === "teacher") {
      const teacher = await getTeacherById(user.id);
      teacherProfile = teacher?.teacherProfile ?? null;
    }

    const token = jwt.sign({ id: user.id, role: roleNormalized }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleOut,
        roleRaw: roleNormalized,
        teacherProfile,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

