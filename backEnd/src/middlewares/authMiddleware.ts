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
  if (!authHeader) return res.status(401).json({ message: "Token nÇœo fornecido" });

  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token invÇ­lido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    return next();
  } catch (err: any) {
    console.error("JWT verify error:", { name: err?.name, message: err?.message });
    const reason =
      err?.name === "TokenExpiredError"
        ? "Token expirado"
        : err?.name === "JsonWebTokenError"
        ? "Assinatura invÇ­lida ou token malformado"
        : "Token invÇ­lido ou expirado";
    return res.status(401).json({ message: reason });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
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
