import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createTeacherWithProfile,
  getAllTeachers,
  getTeacherById,
  getTeacherWithClasses,
  getUserByEmailWithPassword,
} from "../modules/professorModel";
import { findUserById } from "../modules/userModel";
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
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", { email, reason: "missing_fields" });
      return res.status(400).json({ message: "Nome e e-mail são obrigatórios" });
    }

    const normalizedProvider = String(authProvider ?? "EMAIL").trim().toUpperCase();
    if (!ALLOWED_AUTH_PROVIDERS.has(normalizedProvider)) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", {
        email,
        reason: "invalid_provider",
        provider: normalizedProvider,
      });
      return res.status(400).json({ message: "Provedor de autenticação inválido" });
    }

    if (!password?.trim()) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", { email, reason: "password_missing" });
      return res.status(400).json({ message: "Defina uma senha para proteger sua conta" });
    }
    if (password.trim().length < 6) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", {
        email,
        reason: "weak_password",
        passwordLength: password.trim().length,
      });
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    const trimmedPhone = String(phone ?? "").trim();
    const trimmedCity = String(city ?? "").trim();
    if (!trimmedPhone) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", { email, reason: "missing_phone" });
      return res.status(400).json({ message: "Informe um telefone para contato" });
    }
    if (!trimmedCity) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", { email, reason: "missing_city" });
      return res.status(400).json({ message: "Informe sua cidade ou região" });
    }

    const trimmedExperience = String(experience ?? "").trim();

    const sanitizedProfilePhoto =
      typeof profilePhoto === "string" && profilePhoto.trim() ? profilePhoto.trim() : null;
    if (sanitizedProfilePhoto && sanitizedProfilePhoto.length > MAX_PROFILE_PHOTO_CHARS) {
      logRegisterWarning(req, "REGISTER_TEACHER_VALIDATION", {
        email,
        reason: "profile_photo_too_large",
        photoLength: sanitizedProfilePhoto.length,
      });
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
      authProvider: normalizedProvider as any,
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
    if (error?.message === "EMAIL_ALREADY_TAKEN" || error?.code === "P2002") {
      logRegisterWarning(req, "REGISTER_TEACHER_DUPLICATE", {
        email: req.body?.email,
        errCode: error?.code,
        errMessage: error?.message,
        photoLength: typeof req.body?.profilePhoto === "string" ? req.body.profilePhoto.length : undefined,
      });
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }
    logRegisterError(req, error, "REGISTER_TEACHER_ERROR");
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
      return res
        .status(403)
        .json({ message: "Conta não é de professor", details: { roleEncontrado: user.role } });
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
        photoUrl: (user as any).photoUrl ?? null,
        authProvider: user.authProvider,
        teacherProfile: (user as any).teacherProfile ?? null,
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

// Perfil público do professor + aulas
export const getTeacherPublic = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

    const teacher = await getTeacherWithClasses(id);
    if (!teacher) return res.status(404).json({ message: "Professor não encontrado" });

    const classes = (teacher.teacherClasses ?? []).map(cls => ({
      id: cls.id,
      title: cls.title,
      subject: cls.subject,
      description: cls.description,
      modality: cls.modality,
      price: cls.price,
      durationMinutes: cls.durationMinutes,
      priceCents: cls.priceCents,
      active: cls.active,
      location: cls.location,
    }));

    return res.json({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      photoUrl: teacher.photoUrl ?? null,
      teacherProfile: teacher.teacherProfile
        ? {
            city: teacher.teacherProfile.city,
            region: teacher.teacherProfile.region,
            experience: teacher.teacherProfile.experience,
            phone: (teacher.teacherProfile as any).phone,
          }
        : null,
      teacherClasses: classes,
    });
  } catch (error) {
    console.error("Erro ao buscar professor público:", error);
    return res.status(500).json({ message: "Erro interno ao buscar professor" });
  }
};

// (Opcional) endpoint de debug para conferir o usuário do token
export const meFromToken = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user || {};
    if (!id) return res.status(401).json({ message: "Sem usuário no token" });

    const me = await findUserById(Number(id));
    if (me && (me.role || "").toLowerCase() === "teacher") {
      const teacher = await getTeacherWithClasses(Number(id));
      (me as any).teacherProfile = teacher?.teacherProfile ?? null;
    }

    if (!me) return res.status(404).json({ message: "Usuário do token não encontrado" });
    return res.json({ tokenUser: (req as any).user, dbUser: me });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno" });
  }
};

type RegisterTeacherLog = {
  email?: string;
  reason?: string;
  passwordLength?: number;
  provider?: string;
  photoLength?: number;
  errCode?: unknown;
  errMessage?: unknown;
};

const buildRegisterTeacherLog = (req: Request, extra: RegisterTeacherLog = {}) => {
  const contentLength = req.headers["content-length"];
  const email = (req.body?.email as string | undefined) ?? extra.email;
  const photoLength =
    extra.photoLength ??
    (typeof (req.body as any)?.profilePhoto === "string" ? (req.body as any).profilePhoto.length : undefined);

  return {
    method: req.method,
    url: req.originalUrl || req.url,
    email,
    contentLength,
    passwordLength: extra.passwordLength,
    provider: extra.provider,
    photoLength,
    errCode: extra.errCode,
    errMessage: extra.errMessage,
  };
};

const logRegisterWarning = (req: Request, label: string, extra: RegisterTeacherLog = {}) => {
  console.warn(label, buildRegisterTeacherLog(req, extra));
};

const logRegisterError = (req: Request, err: any, label: string) => {
  const payload = {
    ...buildRegisterTeacherLog(req, {
      errCode: err?.code,
      errMessage: err?.message,
    }),
    errName: err?.name,
  };

  console.error(label, payload);
};
