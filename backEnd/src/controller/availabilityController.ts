import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  AvailabilityServiceError,
  createAvailabilityForTeacher,
  deleteAvailabilityByTeacher,
  getAvailableSlots,
  listAvailabilityByTeacher,
} from "../services/availabilityService";
import { availabilityInputSchema, availableSlotsQuerySchema } from "../utils/validators";

const sendAvailabilityError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: error.issues[0]?.message ?? "Dados inválidos" });
  }
  if (error instanceof AvailabilityServiceError) {
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }

  return null;
};

export const createAvailabilityHandler = async (req: Request, res: Response) => {
  try {
    const teacher = (req as any).user;
    const parsed = availabilityInputSchema.parse(req.body ?? {});

    const created = await createAvailabilityForTeacher(Number(teacher.id), parsed);
    return res.status(201).json(created);
  } catch (error) {
    const handled = sendAvailabilityError(res, error);
    if (handled) return handled;

    console.error("Erro ao criar disponibilidade:", error);
    return res.status(500).json({ message: "Erro interno ao criar disponibilidade" });
  }
};

export const listMyAvailabilityHandler = async (req: Request, res: Response) => {
  try {
    const teacher = (req as any).user;
    const availability = await listAvailabilityByTeacher(Number(teacher.id));
    return res.json(availability);
  } catch (error) {
    console.error("Erro ao listar disponibilidade:", error);
    return res.status(500).json({ message: "Erro interno ao listar disponibilidade" });
  }
};

export const deleteAvailabilityHandler = async (req: Request, res: Response) => {
  try {
    const teacher = (req as any).user;
    const id = String(req.params.id ?? "").trim();
    if (!id) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const removed = await deleteAvailabilityByTeacher(Number(teacher.id), id);
    if (!removed) {
      return res.status(404).json({ message: "Disponibilidade não encontrada" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover disponibilidade:", error);
    return res.status(500).json({ message: "Erro interno ao remover disponibilidade" });
  }
};

export const getTeacherAvailableSlotsHandler = async (req: Request, res: Response) => {
  try {
    const teacherId = Number(req.params.id);
    if (!Number.isFinite(teacherId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const parsed = availableSlotsQuerySchema.parse(req.query ?? {});
    const slots = await getAvailableSlots(teacherId, parsed.date, { offerId: parsed.offerId });
    return res.json(slots);
  } catch (error) {
    const handled = sendAvailabilityError(res, error);
    if (handled) return handled;

    console.error("Erro ao listar slots disponíveis:", error);
    return res.status(500).json({ message: "Erro interno ao listar slots disponíveis" });
  }
};
