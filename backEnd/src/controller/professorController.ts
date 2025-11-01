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

const ALLOWED_TEACHING_MODES = new Set(["home", "travel", "online"]);
const ALLOWED_AUTH_PROVIDERS = new Set(["EMAIL", "GOOGLE", "FACEBOOK"]);
const MAX_AD_TITLE = 200;
const MAX_METHOD_TEXT = 500;
const MAX_ABOUT_TEXT = 500;
const MAX_PROFILE_PHOTO_CHARS = 2_500_000; // ~1.8MB em base64

type TeachingMode = "home" | "travel" | "online";

const normalizeTeachingModes = (modes: unknown): TeachingMode[] => {
  if (!Array.isArray(modes)) return [];
  const unique = new Set<TeachingMode>();
  for (const mode of modes) {
    const normalized = String(mode ?? "")
      .trim()
      .toLowerCase();
    if (ALLOWED_TEACHING_MODES.has(normalized)) {
      unique.add(normalized as TeachingMode);
    }
  }
  return Array.from(unique);
};

const normalizeLanguages = (languages: unknown): string[] => {
  if (!Array.isArray(languages)) return [];
  const unique = new Set<string>();
  for (const language of languages) {
    const normalized = String(language ?? "")
      .trim();
    if (normalized) {
      unique.add(normalized);
    }
  }
  return Array.from(unique);
};

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
      teachingModes,
      languages,
      hourlyRate,
      adTitle,
      methodology,
      about,
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

    const normalizedTeachingModes = normalizeTeachingModes(teachingModes);
    if (!normalizedTeachingModes.length) {
      return res.status(400).json({
        message: "Selecione pelo menos uma modalidade: na sua casa, deslocamento ou online",
      });
    }

    const normalizedAdTitle = String(adTitle ?? "").trim();
    const normalizedMethodology = String(methodology ?? "").trim();
    const normalizedAbout = String(about ?? "").trim();
    const trimmedExperience = String(experience ?? "").trim();

    if (!normalizedAdTitle) {
      return res.status(400).json({ message: "Informe um título para o anúncio" });
    }
    if (normalizedAdTitle.length > MAX_AD_TITLE) {
      return res.status(400).json({ message: `Título deve ter no máximo ${MAX_AD_TITLE} caracteres` });
    }
    if (!normalizedMethodology) {
      return res.status(400).json({ message: "Descreva sua metodologia de ensino" });
    }
    if (normalizedMethodology.length > MAX_METHOD_TEXT) {
      return res
        .status(400)
        .json({ message: `Metodologia deve ter no máximo ${MAX_METHOD_TEXT} caracteres` });
    }
    if (!normalizedAbout) {
      return res.status(400).json({ message: "Conte um pouco sobre você" });
    }
    if (normalizedAbout.length > MAX_ABOUT_TEXT) {
      return res
        .status(400)
        .json({ message: `Descrição pessoal deve ter no máximo ${MAX_ABOUT_TEXT} caracteres` });
    }

    const languagesList = normalizeLanguages(languages);

    let normalizedHourlyRate: number | null = null;
    if (hourlyRate !== undefined && hourlyRate !== null && String(hourlyRate).trim() !== "") {
      const rawRate =
        typeof hourlyRate === "number"
          ? hourlyRate
          : Number(String(hourlyRate).replace(",", "."));
      if (!Number.isFinite(rawRate) || rawRate <= 0) {
        return res.status(400).json({ message: "Informe uma tarifa horária válida" });
      }
      normalizedHourlyRate = Number(rawRate.toFixed(2));
    } else {
      return res.status(400).json({ message: "Informe quanto cobra por hora" });
    }

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
        teachingModes: normalizedTeachingModes,
        languages: languagesList,
        hourlyRate: normalizedHourlyRate,
        adTitle: normalizedAdTitle,
        methodology: normalizedMethodology,
        about: normalizedAbout,
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
            teachingModes: true,
            languages: true,
            hourlyRate: true,
            adTitle: true,
            methodology: true,
            about: true,
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
