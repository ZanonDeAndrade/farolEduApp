"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token nÇœo fornecido" });
    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Formato de token invÇ­lido" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        req.user = decoded;
        return next();
    }
    catch (err) {
        console.error("JWT verify error:", { name: err?.name, message: err?.message });
        const reason = err?.name === "TokenExpiredError"
            ? "Token expirado"
            : err?.name === "JsonWebTokenError"
                ? "Assinatura invÇ­lida ou token malformado"
                : "Token invÇ­lido ou expirado";
        return res.status(401).json({ message: reason });
    }
};
exports.authenticate = authenticate;
const requireRole = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "NÇœo autenticado" });
        }
        const normalized = (user.role || "").toLowerCase();
        const allowed = roles.some(role => normalized === role.toLowerCase());
        if (!allowed) {
            return res.status(403).json({ message: "PermissÇ£o negada para este recurso" });
        }
        return next();
    };
};
exports.requireRole = requireRole;
