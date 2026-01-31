const isDev = () => (typeof import.meta !== "undefined" ? Boolean(import.meta.env?.DEV) : false);

export const maskSecret = (value?: string | null) => {
  if (!value) return value ?? "";
  if (value.length <= 12) return "*".repeat(value.length);
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

export const debugGoogleEnv = (clientId?: string | null) => {
  if (!isDev()) return;

  const gsiScript =
    typeof document !== "undefined"
      ? document.querySelector('script[src*="accounts.google.com"]')?.getAttribute("src") ?? "absent"
      : "no-document";

  console.debug("[GOOGLE_DEBUG] origin=", typeof window !== "undefined" ? window.location.origin : "no-window");
  console.debug("[GOOGLE_DEBUG] href=", typeof window !== "undefined" ? window.location.href : "no-window");
  console.debug("[GOOGLE_DEBUG] clientId=", clientId || "missing");
  console.debug("[GOOGLE_DEBUG] gsiScript=", gsiScript);
  console.debug("[GOOGLE_DEBUG] userAgent=", typeof navigator !== "undefined" ? navigator.userAgent : "no-navigator");
};
