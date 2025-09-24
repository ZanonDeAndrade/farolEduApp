import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export interface JwtPayload {
  id: number;
  role: string;
  iat?: number;
  exp?: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });

  // Aceita variações de espaços múltiplos
  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    return next();
  } catch (err: any) {
    // Log de debug (opcional em produção)
    console.error("JWT verify error:", { name: err?.name, message: err?.message });
    const reason =
      err?.name === "TokenExpiredError"
        ? "Token expirado"
        : err?.name === "JsonWebTokenError"
        ? "Assinatura inválida ou token malformado"
        : "Token inválido ou expirado";
    return res.status(401).json({ message: reason });
  }
};
