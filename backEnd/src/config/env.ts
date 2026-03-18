import dotenv from "dotenv";

// carrega .env imediatamente, antes de qualquer leitura de process.env
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
export const PORT = parseInt(process.env.PORT || "5000", 10);
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || "";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "";
const defaultTrustProxy = 1;

export const TRUST_PROXY = (() => {
  const raw = process.env.TRUST_PROXY;
  if (!raw) return defaultTrustProxy;

  const normalized = raw.toLowerCase();
  if (normalized === "false") return false;
  if (normalized === "true") return 1;

  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) return numeric;

  return raw;
})();
