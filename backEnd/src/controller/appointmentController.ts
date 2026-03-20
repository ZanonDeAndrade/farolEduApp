import { Request, Response } from "express";
import { findPendingByTeacher, updateBookingStatusByTeacher } from "../modules/bookingModel";

const FORBIDDEN = { message: "Permissão negada" };
const INVALID_STATUS = { message: "Status atual não permite essa ação" };
const NOT_FOUND = { message: "Agendamento não encontrado" };

const ensureTeacher = (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || (user.role || "").toLowerCase() !== "teacher") {
    res.status(403).json(FORBIDDEN);
    return null;
  }
  return user;
};

export const listPendingAppointments = async (req: Request, res: Response) => {
  const user = ensureTeacher(req, res);
  if (!user) return;
  try {
    const pending = await findPendingByTeacher(Number(user.id));
    return res.json(pending);
  } catch (error) {
    console.error("Erro ao listar agendamentos pendentes:", error);
    return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
  }
};

export const acceptAppointment = async (req: Request, res: Response) => {
  const user = ensureTeacher(req, res);
  if (!user) return;

  const bookingId = Number(req.params.id);
  if (!Number.isFinite(bookingId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const result = await updateBookingStatusByTeacher(bookingId, Number(user.id), "CONFIRMED");
    if (result === "FORBIDDEN") return res.status(403).json(FORBIDDEN);
    if (result === "INVALID_STATUS") return res.status(400).json(INVALID_STATUS);
    if (!result) return res.status(404).json(NOT_FOUND);
    return res.json(result);
  } catch (error) {
    console.error("Erro ao aceitar agendamento:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar agendamento" });
  }
};

export const rejectAppointment = async (req: Request, res: Response) => {
  const user = ensureTeacher(req, res);
  if (!user) return;

  const bookingId = Number(req.params.id);
  if (!Number.isFinite(bookingId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const result = await updateBookingStatusByTeacher(bookingId, Number(user.id), "REJECTED");
    if (result === "FORBIDDEN") return res.status(403).json(FORBIDDEN);
    if (result === "INVALID_STATUS") return res.status(400).json(INVALID_STATUS);
    if (!result) return res.status(404).json(NOT_FOUND);
    return res.json(result);
  } catch (error) {
    console.error("Erro ao recusar agendamento:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar agendamento" });
  }
};

