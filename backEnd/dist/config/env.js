"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRUST_PROXY = exports.GOOGLE_CLIENT_ID = exports.FRONTEND_ORIGINS = exports.OPENAI_API_KEY = exports.PORT = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// carrega .env imediatamente, antes de qualquer leitura de process.env
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET || "secret_key";
exports.PORT = parseInt(process.env.PORT || "5000", 10);
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
exports.FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || "";
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const defaultTrustProxy = 1;
exports.TRUST_PROXY = (() => {
    const raw = process.env.TRUST_PROXY;
    if (!raw)
        return defaultTrustProxy;
    const normalized = raw.toLowerCase();
    if (normalized === "false")
        return false;
    if (normalized === "true")
        return 1;
    const numeric = Number(raw);
    if (!Number.isNaN(numeric))
        return numeric;
    return raw;
})();
