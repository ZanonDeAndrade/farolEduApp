import dotenv from "dotenv";

// carrega .env imediatamente, antes de qualquer leitura de process.env
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
export const PORT = parseInt(process.env.PORT || "5000", 10);
export const DATABASE_URL = process.env.DATABASE_URL || "";
