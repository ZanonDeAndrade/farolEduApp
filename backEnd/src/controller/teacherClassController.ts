import { Request, Response } from "express";
import { createTeacherClass, getTeacherClassesByTeacher } from "../modules/teacherClassModel";

const ALLOWED_MODALITIES = new Set(["online", "home", "travel", "hybrid", "presencial"]);

export const createTeacherClassHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Apenas professores podem cadastrar aulas" });
    }

    const {
      title,
      description,
      subject,
      modality,
      durationMinutes,
      price,
      startTime,
    } = req.body ?? {};

    const normalizedTitle = String(title ?? "").trim();
    if (!normalizedTitle) {
      return res.status(400).json({ message: "Informe um título para a aula" });
    }

    let parsedDate: Date | null = null;
    if (startTime !== undefined && startTime !== null && String(startTime).trim() !== "") {
      parsedDate = new Date(startTime);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Data e hora da aula inválidas" });
      }
    }

    let normalizedModality = String(modality ?? "").trim().toLowerCase();
    if (!ALLOWED_MODALITIES.has(normalizedModality)) {
      normalizedModality = "online";
    }

    let normalizedDuration = Number(durationMinutes);
    if (!Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
      normalizedDuration = 60;
    }
    normalizedDuration = Math.min(Math.max(Math.round(normalizedDuration), 15), 600);

    let normalizedPrice: number | null = null;
    if (price !== undefined && price !== null && String(price).trim() !== "") {
      const numericPrice = Number(String(price).replace(",", "."));
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "Preço inválido" });
      }
      normalizedPrice = Number(numericPrice.toFixed(2));
    }

    const teacherClass = await createTeacherClass({
      teacherId: Number(authUser.id),
      title: normalizedTitle,
      description: typeof description === "string" ? description : undefined,
      subject: typeof subject === "string" ? subject : undefined,
      modality: normalizedModality,
      startTime: parsedDate ?? null,
      durationMinutes: normalizedDuration,
      price: normalizedPrice,
    });

    return res.status(201).json(teacherClass);
  } catch (error) {
    console.error("Erro ao cadastrar aula:", error);
    return res.status(500).json({ message: "Erro interno ao cadastrar aula" });
  }
};

export const listTeacherClassesHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Apenas professores podem visualizar as próprias aulas" });
    }

    const classes = await getTeacherClassesByTeacher(Number(authUser.id));
    return res.json(classes);
  } catch (error) {
    console.error("Erro ao listar aulas do professor:", error);
    return res.status(500).json({ message: "Erro interno ao listar aulas" });
  }
};
