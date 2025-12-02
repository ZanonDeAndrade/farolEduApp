import { Request, Response } from "express";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/env";

const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export const suggestTeacherHandler = async (req: Request, res: Response) => {
  try {
    if (!openaiClient) {
      return res.status(501).json({ message: "API de IA não configurada. Defina OPENAI_API_KEY." });
    }

    const { subject = "reforço escolar", city = "sua cidade", modality = "online" } = req.body ?? {};
    const cleanSubject = String(subject || "reforço escolar").slice(0, 60);
    const cleanCity = String(city || "sua região").slice(0, 60);
    const cleanModality = String(modality || "online").slice(0, 20);

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente curto e prático. Sugira um pequeno plano de aulas e dicas de como encontrar um professor, em até 3 frases.",
        },
        {
          role: "user",
          content: `Quero ajuda para achar aulas de ${cleanSubject} em ${cleanCity}, preferencialmente no formato ${cleanModality}. Resuma sugestões rápidas.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const suggestion =
      completion.choices[0]?.message?.content?.trim() ?? "Experimente buscar por professores próximos.";

    return res.json({ suggestion });
  } catch (error) {
    console.error("Erro na sugestão IA:", error);
    return res.status(500).json({ message: "Não foi possível gerar sugestão agora." });
  }
};
