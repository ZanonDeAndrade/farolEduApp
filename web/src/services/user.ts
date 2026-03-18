import api from "./api";
import axios from "axios";

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  photoUrl?: string | null;
};

const formatUploadError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as any)?.message;
    if (message && typeof message === "string") return message;
  }
  return "Não foi possível enviar a foto. Tente novamente.";
};

export async function getMe() {
  const { data } = await api.get<MeResponse>("/api/users/me");
  return data;
}

export async function uploadProfilePhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);

  try {
    const { data } = await api.patch<{ photoUrl: string }>("/api/users/me/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    const message = formatUploadError(error);
    throw new Error(message);
  }
}
