export interface StoredProfile {
  id?: number;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

export const getStoredProfile = (): StoredProfile | null => {
  try {
    const raw = localStorage.getItem("profile");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("Não foi possível ler o perfil salvo:", error);
    return null;
  }
};
