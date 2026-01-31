import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserFromGoogle, findUserByEmail, linkGoogleAccount, updateUserLastLogin } from "../modules/userModel";
import { getTeacherById } from "../modules/professorModel";
import { JWT_SECRET, GOOGLE_CLIENT_ID } from "../config/env";
import { User } from "../repositories/models";
import { OAuth2Client } from "google-auth-library";
import { maskSecret } from "../utils/maskSecret";

const INVALID_MESSAGE = "Email ou senha inválidos";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

const normalizeRole = (role: string) => {
  const roleNormalized = (role ?? "").toLowerCase();
  const roleOut = roleNormalized === "teacher" ? "PROFESSOR" : roleNormalized === "student" ? "ALUNO" : role;
  return { roleNormalized, roleOut };
};

const buildLoginResponse = async (user: User) => {
  const { roleNormalized, roleOut } = normalizeRole(user.role);

  let teacherProfile = null;
  if (roleNormalized === "teacher") {
    const teacher = await getTeacherById(user.id);
    teacherProfile = teacher?.teacherProfile ?? null;
  }

  const token = jwt.sign({ id: user.id, role: roleNormalized }, JWT_SECRET, { expiresIn: "1h" });

  return {
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
  };
};

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

    await updateUserLastLogin(user.id);
    const response = await buildLoginResponse(user);
    return res.json(response);
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body ?? {};
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ message: "idToken ausente" });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID não configurado no backend.");
      return res.status(500).json({ message: "Configuração Google indisponível" });
    }

    const baseLog = {
      method: req.method,
      url: req.originalUrl || req.url,
      origin: req.headers.origin,
      contentLength: req.headers["content-length"],
      hasIdToken: Boolean(idToken),
      maskedToken: process.env.NODE_ENV !== "production" ? maskSecret(idToken) : undefined,
    };
    if (process.env.NODE_ENV !== "production") {
      console.debug("[GOOGLE_DEBUG][BACK] request", baseLog);
    }

    let email: string | null = null;
    let googleUid: string | null = null;
    let name: string | null = null;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID as string,
      });
      const payload = ticket.getPayload();
      email = payload?.email?.toLowerCase() ?? null;
      googleUid = payload?.sub ?? null;
      name = payload?.name ?? payload?.email?.split("@")[0] ?? null;

      if (!payload?.aud || payload.aud !== GOOGLE_CLIENT_ID) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[GOOGLE_DEBUG][BACK] audience mismatch", {
            payloadAud: payload?.aud,
            expected: GOOGLE_CLIENT_ID,
          });
        }
      }
    } catch (err) {
      console.error("[GOOGLE] verifyIdToken failed", err);
      return res.status(401).json({ message: "Token Google inválido" });
    }

    if (!email || !googleUid) {
      return res.status(401).json({ message: "Token Google inválido" });
    }

    let user = await findUserByEmail(email);

    if (user) {
      if (!user.googleUid) {
        await linkGoogleAccount(user.id, googleUid);
        user = { ...user, googleUid, providers: Array.from(new Set([...(user.providers ?? []), "google"])) };
      }
      await updateUserLastLogin(user.id);
    } else {
      user = await createUserFromGoogle({
        name: name as string,
        email,
        googleUid,
        role: "student",
      });
    }

    const response = await buildLoginResponse(user);
    return res.json(response);
  } catch (error) {
    console.error("Erro no login com Google:", error);
    return res.status(500).json({ message: "Erro interno ao autenticar com Google" });
  }
};
