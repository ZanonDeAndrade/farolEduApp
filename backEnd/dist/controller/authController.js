"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGoogle = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../modules/userModel");
const professorModel_1 = require("../modules/professorModel");
const env_1 = require("../config/env");
const google_auth_library_1 = require("google-auth-library");
const maskSecret_1 = require("../utils/maskSecret");
const INVALID_MESSAGE = "Email ou senha inválidos";
const googleClient = new google_auth_library_1.OAuth2Client(env_1.GOOGLE_CLIENT_ID || undefined);
const normalizeRole = (role) => {
    const roleNormalized = (role ?? "").toLowerCase();
    const roleOut = roleNormalized === "teacher" ? "PROFESSOR" : roleNormalized === "student" ? "ALUNO" : role;
    return { roleNormalized, roleOut };
};
const buildLoginResponse = async (user) => {
    const { roleNormalized, roleOut } = normalizeRole(user.role);
    let teacherProfile = null;
    if (roleNormalized === "teacher") {
        const teacher = await (0, professorModel_1.getTeacherById)(user.id);
        teacherProfile = teacher?.teacherProfile ?? null;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: roleNormalized }, env_1.JWT_SECRET, { expiresIn: "1h" });
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
const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "Email e senha são obrigatórios" });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await (0, userModel_1.findUserByEmail)(normalizedEmail);
        if (!user) {
            return res.status(401).json({ message: INVALID_MESSAGE });
        }
        const passwordOk = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordOk) {
            return res.status(401).json({ message: INVALID_MESSAGE });
        }
        await (0, userModel_1.updateUserLastLogin)(user.id);
        const response = await buildLoginResponse(user);
        return res.json(response);
    }
    catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};
exports.login = login;
const loginWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body ?? {};
        if (!idToken || typeof idToken !== "string") {
            return res.status(400).json({ message: "idToken ausente" });
        }
        if (!env_1.GOOGLE_CLIENT_ID) {
            console.error("GOOGLE_CLIENT_ID não configurado no backend.");
            return res.status(500).json({ message: "Configuração Google indisponível" });
        }
        const baseLog = {
            method: req.method,
            url: req.originalUrl || req.url,
            origin: req.headers.origin,
            contentLength: req.headers["content-length"],
            hasIdToken: Boolean(idToken),
            maskedToken: process.env.NODE_ENV !== "production" ? (0, maskSecret_1.maskSecret)(idToken) : undefined,
        };
        if (process.env.NODE_ENV !== "production") {
            console.debug("[GOOGLE_DEBUG][BACK] request", baseLog);
        }
        let email = null;
        let googleUid = null;
        let name = null;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: env_1.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload?.email?.toLowerCase() ?? null;
            googleUid = payload?.sub ?? null;
            name = payload?.name ?? payload?.email?.split("@")[0] ?? null;
            if (!payload?.aud || payload.aud !== env_1.GOOGLE_CLIENT_ID) {
                if (process.env.NODE_ENV !== "production") {
                    console.error("[GOOGLE_DEBUG][BACK] audience mismatch", {
                        payloadAud: payload?.aud,
                        expected: env_1.GOOGLE_CLIENT_ID,
                    });
                }
            }
        }
        catch (err) {
            console.error("[GOOGLE] verifyIdToken failed", err);
            return res.status(401).json({ message: "Token Google inválido" });
        }
        if (!email || !googleUid) {
            return res.status(401).json({ message: "Token Google inválido" });
        }
        let user = await (0, userModel_1.findUserByEmail)(email);
        if (user) {
            if (!user.googleUid) {
                await (0, userModel_1.linkGoogleAccount)(user.id, googleUid);
                user = { ...user, googleUid, providers: Array.from(new Set([...(user.providers ?? []), "google"])) };
            }
            await (0, userModel_1.updateUserLastLogin)(user.id);
        }
        else {
            user = await (0, userModel_1.createUserFromGoogle)({
                name: name,
                email,
                googleUid,
                role: "student",
            });
        }
        const response = await buildLoginResponse(user);
        return res.json(response);
    }
    catch (error) {
        console.error("Erro no login com Google:", error);
        return res.status(500).json({ message: "Erro interno ao autenticar com Google" });
    }
};
exports.loginWithGoogle = loginWithGoogle;
