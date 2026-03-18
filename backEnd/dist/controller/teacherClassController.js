"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicTeacherClassesHandler = exports.deleteTeacherClassHandler = exports.updateTeacherClassHandler = exports.listTeacherClassesHandler = exports.createTeacherClassHandler = void 0;
const teacherClassModel_1 = require("../modules/teacherClassModel");
const validators_1 = require("../utils/validators");
const createTeacherClassHandler = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Apenas professores podem cadastrar aulas" });
        }
        const parsed = validators_1.teacherClassInputSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos" });
        }
        const payload = parsed.data;
        let parsedDate = null;
        if (payload.startTime) {
            parsedDate = new Date(payload.startTime);
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: "Data e hora da aula inválidas" });
            }
        }
        const teacherClass = await (0, teacherClassModel_1.createTeacherClass)({
            teacherId: Number(authUser.id),
            title: payload.title,
            description: payload.description,
            subject: payload.subject,
            modality: payload.modality,
            startTime: parsedDate ?? null,
            durationMinutes: payload.durationMinutes,
            price: payload.price ?? null,
            priceCents: payload.priceCents ?? undefined,
            location: payload.location ?? null,
            active: payload.active ?? true,
        });
        return res.status(201).json(teacherClass);
    }
    catch (error) {
        console.error("Erro ao cadastrar aula:", error);
        return res.status(500).json({ message: "Erro interno ao cadastrar aula" });
    }
};
exports.createTeacherClassHandler = createTeacherClassHandler;
const listTeacherClassesHandler = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Apenas professores podem visualizar as próprias aulas" });
        }
        const classes = await (0, teacherClassModel_1.getTeacherClassesByTeacher)(Number(authUser.id));
        return res.json(classes);
    }
    catch (error) {
        console.error("Erro ao listar aulas do professor:", error);
        return res.status(500).json({ message: "Erro interno ao listar aulas" });
    }
};
exports.listTeacherClassesHandler = listTeacherClassesHandler;
const updateTeacherClassHandler = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Apenas professores podem editar aulas" });
        }
        const classId = Number(req.params.id);
        if (!Number.isFinite(classId)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const parsed = validators_1.teacherClassUpdateSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos" });
        }
        let startTime = undefined;
        if (parsed.data.startTime !== undefined) {
            startTime = parsed.data.startTime ? new Date(parsed.data.startTime) : null;
            if (startTime && Number.isNaN(startTime.getTime())) {
                return res.status(400).json({ message: "Data e hora da aula inválidas" });
            }
        }
        const updated = await (0, teacherClassModel_1.updateTeacherClassByTeacher)(Number(authUser.id), classId, {
            ...parsed.data,
            startTime,
        });
        if (!updated) {
            return res.status(404).json({ message: "Aula não encontrada" });
        }
        return res.json(updated);
    }
    catch (error) {
        console.error("Erro ao atualizar aula:", error);
        return res.status(500).json({ message: "Erro interno ao atualizar aula" });
    }
};
exports.updateTeacherClassHandler = updateTeacherClassHandler;
const deleteTeacherClassHandler = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || (authUser.role || "").toLowerCase() !== "teacher") {
            return res.status(403).json({ message: "Apenas professores podem excluir aulas" });
        }
        const classId = Number(req.params.id);
        if (!Number.isFinite(classId)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const removed = await (0, teacherClassModel_1.deleteTeacherClassByTeacher)(Number(authUser.id), classId);
        if (!removed) {
            return res.status(404).json({ message: "Aula não encontrada" });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao remover aula:", error);
        return res.status(500).json({ message: "Erro interno ao remover aula" });
    }
};
exports.deleteTeacherClassHandler = deleteTeacherClassHandler;
const serializePrice = (price) => {
    if (price === null || price === undefined)
        return null;
    const numeric = Number(price);
    return Number.isFinite(numeric) ? numeric : null;
};
const listPublicTeacherClassesHandler = async (req, res) => {
    try {
        const { q, modality, city, take, teacherId, teacherName } = req.query ?? {};
        let teacherFilter = undefined;
        if (typeof teacherId === "string" && teacherId.trim()) {
            const parsed = Number(teacherId);
            if (!Number.isFinite(parsed)) {
                return res.status(400).json({ message: "teacherId inválido" });
            }
            teacherFilter = parsed;
        }
        const classes = await (0, teacherClassModel_1.getPublicTeacherClasses)({
            query: typeof q === "string" ? q : undefined,
            modality: typeof modality === "string" ? modality : undefined,
            city: typeof city === "string" ? city : undefined,
            teacherId: teacherFilter,
            teacherName: typeof teacherName === "string" ? teacherName : undefined,
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
            priceCents: item.priceCents ?? null,
            location: item.location ?? null,
            active: item.active,
            startTime: item.startTime,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            teacher: {
                id: item.teacher?.id ?? null,
                name: item.teacher?.name ?? null,
                email: item.teacher?.email ?? null,
                photoUrl: item.teacher?.photoUrl ?? null,
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
    }
    catch (error) {
        console.error("Erro ao listar aulas públicas:", error);
        return res.status(500).json({ message: "Erro interno ao listar aulas públicas" });
    }
};
exports.listPublicTeacherClassesHandler = listPublicTeacherClassesHandler;
