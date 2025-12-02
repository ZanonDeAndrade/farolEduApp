import { Request, Response } from "express";
import {
  createTeacherClass,
  deleteTeacherClassByTeacher,
  getPublicTeacherClasses,
  getTeacherClassesByTeacher,
  updateTeacherClassByTeacher,
} from "../modules/teacherClassModel";
import { Prisma } from "@prisma/client";
import { teacherClassInputSchema, teacherClassUpdateSchema } from "../utils/validators";

export const createTeacherClassHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Apenas professores podem cadastrar aulas" });
    }

    const parsed = teacherClassInputSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos" });
    }
    const payload = parsed.data;

    let parsedDate: Date | null = null;
    if (payload.startTime) {
      parsedDate = new Date(payload.startTime);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Data e hora da aula inválidas" });
      }
    }

    const teacherClass = await createTeacherClass({
      teacherId: Number(authUser.id),
      title: payload.title,
      description: payload.description,
      subject: payload.subject,
      modality: payload.modality,
      startTime: parsedDate ?? null,
      durationMinutes: payload.durationMinutes,
      price: payload.price ?? null,
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

export const updateTeacherClassHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Apenas professores podem editar aulas" });
    }

    const classId = Number(req.params.id);
    if (!Number.isFinite(classId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const parsed = teacherClassUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos" });
    }

    let startTime: Date | null | undefined = undefined;
    if (parsed.data.startTime !== undefined) {
      startTime = parsed.data.startTime ? new Date(parsed.data.startTime) : null;
      if (startTime && Number.isNaN(startTime.getTime())) {
        return res.status(400).json({ message: "Data e hora da aula inválidas" });
      }
    }

    const updated = await updateTeacherClassByTeacher(Number(authUser.id), classId, {
      ...parsed.data,
      startTime,
    });

    if (!updated) {
      return res.status(404).json({ message: "Aula não encontrada" });
    }
    return res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar aula" });
  }
};

export const deleteTeacherClassHandler = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
      return res.status(403).json({ message: "Apenas professores podem excluir aulas" });
    }

    const classId = Number(req.params.id);
    if (!Number.isFinite(classId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const removed = await deleteTeacherClassByTeacher(Number(authUser.id), classId);
    if (!removed) {
      return res.status(404).json({ message: "Aula não encontrada" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover aula:", error);
    return res.status(500).json({ message: "Erro interno ao remover aula" });
  }
};

const serializePrice = (price: Prisma.Decimal | number | null | undefined) => {
  if (price === null || price === undefined) return null;
  if (price instanceof Prisma.Decimal) {
    return Number(price.toString());
  }
  if (typeof price === "string") {
    const numeric = Number(price);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return Number(price);
};

export const listPublicTeacherClassesHandler = async (req: Request, res: Response) => {
  try {
    const { q, modality, city, take, teacherId } = req.query ?? {};

    let teacherFilter: number | undefined = undefined;
    if (typeof teacherId === "string" && teacherId.trim()) {
      const parsed = Number(teacherId);
      if (!Number.isFinite(parsed)) {
        return res.status(400).json({ message: "teacherId inválido" });
      }
      teacherFilter = parsed;
    }

    const classes = await getPublicTeacherClasses({
      query: typeof q === "string" ? q : undefined,
      modality: typeof modality === "string" ? modality : undefined,
      city: typeof city === "string" ? city : undefined,
      teacherId: teacherFilter,
      take: typeof take === "string" && take.trim() ? Number(take) : undefined,
    });

    const payload = classes.map(item => ({
      id: item.id,
      teacherId: item.teacherId,
      title: item.title,
      subject: item.subject,
      description: item.description,
      modality: item.modality,
      durationMinutes: item.durationMinutes,
      price: serializePrice(item.price),
      startTime: item.startTime,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      teacher: {
        id: item.teacher?.id ?? null,
        name: item.teacher?.name ?? null,
        email: item.teacher?.email ?? null,
        profile: item.teacher?.teacherProfile
          ? {
              city: item.teacher.teacherProfile.city,
              region: item.teacher.teacherProfile.region,
              experience: item.teacher.teacherProfile.experience,
              profilePhoto: item.teacher.teacherProfile.profilePhoto,
              phone: item.teacher.teacherProfile.phone,
            }
          : null,
      },
    }));

    return res.json(payload);
  } catch (error) {
    console.error("Erro ao listar aulas públicas:", error);
    return res.status(500).json({ message: "Erro interno ao listar aulas públicas" });
  }
};
