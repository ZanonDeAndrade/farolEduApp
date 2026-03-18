import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { createUser, findUserByEmail, findUserById, getAllUsers, updateUserPhoto } from "../modules/userModel";
import { bucket } from "../utils/firebaseAdmin";

// Cadastro de estudante
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      logRegisterWarning(req, "REGISTER_STUDENT_VALIDATION", {
        email,
        reason: "missing_fields",
      });
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    }
    if (password.trim().length < 6) {
      logRegisterWarning(req, "REGISTER_STUDENT_VALIDATION", {
        email,
        reason: "weak_password",
        passwordLength: password.trim().length,
      });
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "student",
    });

    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    if (err?.code === "P2002") {
      logRegisterWarning(req, "REGISTER_STUDENT_DUPLICATE", {
        email: req.body?.email,
        errCode: err?.code,
        errMessage: err?.message,
      });
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }
    logRegisterError(req, err, "REGISTER_STUDENT_ERROR");
    return res.status(500).json({ message: "Não foi possível criar a conta. Tente novamente." });
  }
};

// Login de estudante
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email e senha obrigatórios" });
    }

    const student = await findUserByEmail(email.trim().toLowerCase());

    if (!student || (student.role || "").toLowerCase() !== "student") {
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
    const students = await getAllUsers();
    if (!students.length) {
      return res.status(404).json({ message: "Nenhum estudante encontrado" });
    }

    const payload = students.map(s => ({ id: s.id, name: s.name, email: s.email, role: s.role }));
    return res.json(payload);
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

    const student = await findUserById(id);
    if (!student || (student.role || "").toLowerCase() !== "student") {
      return res.status(404).json({ message: "Estudante não encontrado" });
    }

    return res.json({ id: student.id, name: student.name, email: student.email, role: student.role });
  } catch (err) {
    console.error("Erro ao buscar estudante:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

type RegisterLogExtra = {
  email?: string;
  reason?: string;
  passwordLength?: number;
  errCode?: unknown;
  errMessage?: unknown;
};

const buildRegisterLogBase = (req: Request, extra: RegisterLogExtra = {}) => {
  const contentLength = req.headers["content-length"];
  const email = (req.body?.email as string | undefined) ?? extra.email;

  return {
    method: req.method,
    url: req.originalUrl || req.url,
    email,
    contentLength,
    passwordLength: extra.passwordLength,
    reason: extra.reason,
    errCode: extra.errCode,
    errMessage: extra.errMessage,
  };
};

const logRegisterWarning = (req: Request, label: string, extra: RegisterLogExtra = {}) => {
  console.warn(label, buildRegisterLogBase(req, extra));
};

const logRegisterError = (req: Request, err: any, label: string) => {
  const photoLength =
    typeof (req.body as any)?.profilePhoto === "string" ? (req.body as any).profilePhoto.length : undefined;

  const payload = {
    ...buildRegisterLogBase(req, {
      errCode: err?.code,
      errMessage: err?.message,
    }),
    errName: err?.name,
    photoLength,
  };

  console.error(label, payload);
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const getMe = async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser?.id) {
    return res.status(401).json({ message: "NÃ£o autenticado" });
  }

  const me = await findUserById(Number(authUser.id));
  if (!me) {
    return res.status(404).json({ message: "UsuÃ¡rio nÃ£o encontrado" });
  }

  return res.json({
    id: me.id,
    name: me.name,
    email: me.email,
    role: me.role,
    photoUrl: me.photoUrl ?? null,
  });
};

export const updateMyPhoto = async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser?.id) {
    return res.status(401).json({ message: "NÃ£o autenticado" });
  }

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ message: "Arquivo de foto nÃ£o enviado." });
  }

  if (!ALLOWED_PHOTO_TYPES.has(file.mimetype)) {
    return res.status(400).json({ message: "Formato invÃ¡lido. Use JPG, PNG ou WEBP." });
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return res.status(413).json({ message: "Imagem muito grande. MÃ¡x 2MB." });
  }

  const extension = MIME_EXTENSION[file.mimetype] ?? "bin";
  const objectPath = `avatars/${authUser.id}/${Date.now()}.${extension}`;

  if (process.env.NODE_ENV !== "production") {
    console.info(`[PHOTO_UPLOAD] userId=${authUser.id} size=${file.size} mime=${file.mimetype}`);
  }

  try {
    const storageFile = bucket.file(objectPath);
    await storageFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        cacheControl: "public, max-age=31536000, immutable",
      },
      resumable: false,
      validation: "crc32c",
      public: false,
    });

    let publicUrl: string;
    try {
      await storageFile.makePublic();
      publicUrl = storageFile.publicUrl();
    } catch (err) {
      const [signedUrl] = await storageFile.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      publicUrl = signedUrl;
    }

    const updated = await updateUserPhoto(Number(authUser.id), publicUrl);
    if (!updated) {
      return res.status(404).json({ message: "UsuÃ¡rio nÃ£o encontrado" });
    }

    return res.json({ photoUrl: publicUrl });
  } catch (error: any) {
    console.error("Erro ao salvar foto de perfil:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
    });
    return res.status(500).json({ message: "Erro interno ao salvar foto." });
  }
};
