import { Request, Response } from "express";
import { ZodError } from "zod";
import { cancelBookingByActor, createBooking, listBookingsByUser } from "../modules/bookingModel";
import { BookingServiceError } from "../services/bookingService";
import { bookingInputSchema } from "../utils/validators";

const parseISODate = (value: unknown) => {
  const candidate =
    typeof value === "string"
      ? value
      : Array.isArray(value) && typeof value[0] === "string"
        ? value[0]
        : undefined;
  if (!candidate) return undefined;

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const createBookingHandler = async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser || (authUser.role || "").toLowerCase() !== "student") {
    return res.status(403).json({ message: "Apenas estudantes podem criar agendamentos" });
  }

  try {
    const parsed = bookingInputSchema.parse(req.body ?? {});
    const booking = await createBooking({
      studentId: Number(authUser.id),
      offerId: parsed.offerId,
      date: parsed.date,
      startTime: parsed.startTime,
      notes: parsed.notes ?? null,
    });
    return res.status(201).json(booking);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? "Dados invalidos" });
    }
    if (error instanceof BookingServiceError) {
      return res.status(error.statusCode).json({ message: error.message, code: error.code });
    }

    console.error("Erro ao criar booking:", error);
    return res.status(500).json({ message: "Erro interno ao criar agendamento" });
  }
};

export const listMyBookingsHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const from = parseISODate(req.query.from);
    const to = parseISODate(req.query.to);
    const bookings = await listBookingsByUser(Number(user.id), String(user.role || ""), { from, to });
    return res.json(bookings);
  } catch (error) {
    console.error("Erro ao listar bookings:", error);
    return res.status(500).json({ message: "Erro interno ao listar agendamentos" });
  }
};

export const cancelBookingHandler = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isFinite(bookingId)) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const actor = (req as any).user;
    const cancelled = await cancelBookingByActor(bookingId, Number(actor.id));
    if (cancelled === "FORBIDDEN") {
      return res.status(403).json({ message: "Sem permissao para cancelar este agendamento" });
    }
    if (!cancelled) {
      return res.status(404).json({ message: "Agendamento nao encontrado" });
    }
    return res.json(cancelled);
  } catch (error) {
    console.error("Erro ao cancelar booking:", error);
    return res.status(500).json({ message: "Erro interno ao cancelar agendamento" });
  }
};
