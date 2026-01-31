"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudent = exports.listStudents = exports.loginStudent = exports.registerStudent = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const userModel_1 = require("../modules/userModel");
// Cadastro de estudante
const registerStudent = async (req, res) => {
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
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await (0, userModel_1.createUser)({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashed,
            role: "student",
        });
        return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    }
    catch (err) {
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
exports.registerStudent = registerStudent;
// Login de estudante
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "Email e senha obrigatórios" });
        }
        const student = await (0, userModel_1.findUserByEmail)(email.trim().toLowerCase());
        if (!student || (student.role || "").toLowerCase() !== "student") {
            return res.status(401).json({ message: "Estudante não encontrado" });
        }
        const ok = await bcryptjs_1.default.compare(password, student.password);
        if (!ok)
            return res.status(401).json({ message: "Senha inválida" });
        const token = jsonwebtoken_1.default.sign({ id: student.id, role: student.role }, env_1.JWT_SECRET, { expiresIn: "1h" });
        return res.json({
            message: "Login realizado com sucesso",
            token,
            user: { id: student.id, name: student.name, email: student.email, role: student.role },
        });
    }
    catch (err) {
        console.error("Erro no login de estudante:", err);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};
exports.loginStudent = loginStudent;
// Listar estudantes
const listStudents = async (_req, res) => {
    try {
        const students = await (0, userModel_1.getAllUsers)();
        if (!students.length) {
            return res.status(404).json({ message: "Nenhum estudante encontrado" });
        }
        const payload = students.map(s => ({ id: s.id, name: s.name, email: s.email, role: s.role }));
        return res.json(payload);
    }
    catch (err) {
        console.error("Erro ao listar estudantes:", err);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};
exports.listStudents = listStudents;
// Buscar estudante por ID
const getStudent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ message: "ID inválido" });
        const student = await (0, userModel_1.findUserById)(id);
        if (!student || (student.role || "").toLowerCase() !== "student") {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }
        return res.json({ id: student.id, name: student.name, email: student.email, role: student.role });
    }
    catch (err) {
        console.error("Erro ao buscar estudante:", err);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};
exports.getStudent = getStudent;
const buildRegisterLogBase = (req, extra = {}) => {
    const contentLength = req.headers["content-length"];
    const email = req.body?.email ?? extra.email;
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
const logRegisterWarning = (req, label, extra = {}) => {
    console.warn(label, buildRegisterLogBase(req, extra));
};
const logRegisterError = (req, err, label) => {
    const photoLength = typeof req.body?.profilePhoto === "string" ? req.body.profilePhoto.length : undefined;
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
