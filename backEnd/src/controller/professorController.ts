import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createTeacherWithProfile,
  getAllTeachers,
  getTeacherById,
  getUserByEmailWithPassword,
} from "../modules/professorModel";
import { prisma } from "../config/db";
import { JWT_SECRET } from "../config/env";

const ALLOWED_AUTH_PROVIDERS = new Set(["EMAIL", "GOOGLE", "FACEBOOK"]);
const MAX_PROFILE_PHOTO_CHARS = 2_500_000; // ~1.8MB em base64

// Cadastro de professor
export const registerTeacher = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      authProvider = "EMAIL",
      authProviderId,
      phone,
      city,
      region,
      experience,
      profilePhoto,
      wantsToAdvertise,
    } = req.body ?? {};

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Nome e e-mail são obrigatórios" });
    }

    const normalizedProvider = String(authProvider ?? "EMAIL").trim().toUpperCase();
    if (!ALLOWED_AUTH_PROVIDERS.has(normalizedProvider)) {
      return res.status(400).json({ message: "Provedor de autenticação inválido" });
    }

    if (!password?.trim()) {
      return res
        .status(400)
        .json({ message: "Defina uma senha para proteger sua conta" });
    }
    if (password.trim().length < 6) {
      return res
        .status(400)
        .json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    const trimmedPhone = String(phone ?? "").trim();
    const trimmedCity = String(city ?? "").trim();
    if (!trimmedPhone) {
      return res.status(400).json({ message: "Informe um telefone para contato" });
    }
    if (!trimmedCity) {
      return res.status(400).json({ message: "Informe sua cidade ou região" });
    }

    const trimmedExperience = String(experience ?? "").trim();

    const sanitizedProfilePhoto =
      typeof profilePhoto === "string" && profilePhoto.trim()
        ? profilePhoto.trim()
        : null;
    if (sanitizedProfilePhoto && sanitizedProfilePhoto.length > MAX_PROFILE_PHOTO_CHARS) {
      return res.status(413).json({
        message:
          "A foto de perfil deve ter até 1.8MB. Reduza o tamanho ou utilize uma imagem mais leve.",
      });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const teacher = await createTeacherWithProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      authProvider: normalizedProvider,
      authProviderId: typeof authProviderId === "string" ? authProviderId : null,
      profile: {
        phone: trimmedPhone,
        city: trimmedCity,
        region: typeof region === "string" ? region.trim() || null : null,
        experience: trimmedExperience || null,
        profilePhoto: sanitizedProfilePhoto,
        wantsToAdvertise: Boolean(wantsToAdvertise),
      },
    });

    return res.status(201).json({
      message: "Perfil de professor criado com sucesso",
      teacher,
    });
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

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    if ((user.role || "").trim().toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Conta não é de professor", details: { roleEncontrado: user.role } });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Senha inválida" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({
      message: "Login realizado com sucesso",
      token,
      teacher: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        teacherProfile: user.teacherProfile,
      },
    });
  } catch (error) {
    console.error("Erro no login de professor:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Listar todos os professores
export const listTeachers = async (_req: Request, res: Response) => {
  try {
    const teachers = await getAllTeachers();
    if (!teachers.length) {
      return res.status(404).json({ message: "Nenhum professor encontrado" });
    }
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        teacherProfile: {
          select: {
            id: true,
            phone: true,
            city: true,
            region: true,
            experience: true,
            profilePhoto: true,
            advertisesFromHome: true,
            advertisesTravel: true,
            advertisesOnline: true,
            wantsToAdvertise: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!me) return res.status(404).json({ message: "Usuário do token não encontrado" });
    return res.json({ tokenUser: (req as any).user, dbUser: me });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno" });
  }
};
