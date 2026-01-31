"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestTeacherHandler = void 0;
const teacherClassModel_1 = require("../modules/teacherClassModel");
const suggestTeacherHandler = async (req, res) => {
    try {
        const { subject = "reforço escolar", city = "sua cidade", modality = "online" } = req.body ?? {};
        const cleanSubject = String(subject || "reforço escolar").trim();
        const cleanCity = String(city || "").trim();
        const cleanModality = String(modality || "online").trim().toUpperCase();
        const classes = await (0, teacherClassModel_1.getPublicTeacherClasses)({
            query: cleanSubject || undefined,
            city: cleanCity || undefined,
            modality: cleanModality || undefined,
            take: 5,
        });
        if (!classes.length) {
            return res.json({
                suggestion: "Não encontramos aulas com esse filtro agora. Tente outro assunto ou cidade para ver opções disponíveis.",
            });
        }
        const shortlist = classes.slice(0, 3);
        const parts = shortlist.map(cls => {
            const teacherName = cls.teacher?.name ? `com ${cls.teacher.name}` : "";
            const cityLabel = cls.teacher?.teacherProfile?.city || cls.teacher?.teacherProfile?.region;
            const cityText = cityLabel ? ` · ${cityLabel}` : "";
            return `${cls.title}${teacherName ? ` ${teacherName}` : ""}${cityText ? cityText : ""}`;
        });
        const header = `Aqui estão ${classes.length > 1 ? "algumas" : "uma"} aula(s) de ${cleanSubject || "reforço escolar"}`;
        const suggestion = `${header}: ${parts.join(" | ")}. Toque em "Ver aula" para agendar.`;
        return res.json({ suggestion });
    }
    catch (error) {
        console.error("Erro na sugestão IA:", error);
        return res.status(500).json({ message: "Não foi possível gerar sugestão agora." });
    }
};
exports.suggestTeacherHandler = suggestTeacherHandler;
