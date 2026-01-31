import { useEffect, useRef, useState } from "react";
import { loadGoogleGsi } from "../../utils/loadGoogleGsi";
import { maskSecret } from "../../utils/googleDebug";

type ButtonText = "signin_with" | "signup_with" | "continue_with";

type Props = {
  onCredential: (credential: string) => void | Promise<void>;
  onError: (error: Error) => void;
  text?: ButtonText;
  fullWidth?: boolean;
  disabled?: boolean;
};

export const GoogleSignInButton = ({ onCredential, onError, text = "continue_with", fullWidth, disabled }: Props) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
        if (!clientId) {
          throw new Error("VITE_GOOGLE_CLIENT_ID não configurado.");
        }

        await loadGoogleGsi();
        if (cancelled) return;
        if (!window.google?.accounts?.id) {
          throw new Error("Google Identity Services indisponível após o carregamento.");
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: ({ credential }) => {
            if (!credential) {
              onError(new Error("Nenhuma credencial retornada pelo Google."));
              return;
            }
            if (import.meta.env.DEV) {
              console.debug("[GOOGLE_DEBUG] credential(masked)=", maskSecret(credential));
            }
            void onCredential(credential);
          },
        });

        if (buttonRef.current && !rendered) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text,
          });
          setRendered(true);
        }
      } catch (err: any) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError, text, fullWidth, rendered]);

  return <div ref={buttonRef} style={{ width: fullWidth ? "100%" : "auto", opacity: disabled ? 0.6 : 1 }} />;
};

export default GoogleSignInButton;
