let gsiPromise: Promise<void> | null = null;

// Minimal typing to satisfy TS without adding global types
type GoogleId = {
  initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, options: Record<string, any>) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export function loadGoogleGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;

  const existingScript = Array.from(document.getElementsByTagName("script")).find(s => s.src.includes(GSI_SRC));
  if (existingScript) {
    gsiPromise = new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Falha ao carregar Google Identity Services")), {
        once: true,
      });
    });
    return gsiPromise;
  }

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Google Identity Services"));
    document.head.appendChild(script);
  });

  return gsiPromise;
}
