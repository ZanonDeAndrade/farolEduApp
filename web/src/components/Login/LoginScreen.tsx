import React, { useEffect, useRef, useState } from "react";
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css";
import LogoImage from "../../assets/Logo.png";
import { login, loginWithGoogleToken } from "../../services/auth";
import GoogleSignInButton from "../auth/GoogleSignInButton";

interface PopupState {
  type: "success" | "error";
  message: string;
}

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return;

    setIsLoading(true);
    setPopup(null);
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    try {
      const data = await login({ email: normalizedEmail, password });
      setPopup({ type: "success", message: "Login realizado com sucesso! Redirecionando..." });

      const roleLower = (data.user?.role ?? "").toLowerCase();
      const targetRoute = roleLower === "teacher" || roleLower === "professor" ? "/dashboard" : "/student";

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate(targetRoute, { replace: true });
        redirectTimeoutRef.current = null;
      }, 900);
    } catch (err: any) {
      console.error("Erro no login:", err);
      setPopup({ type: "error", message: err?.message || "Erro ao fazer login" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleClosePopup = () => {
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setPopup(null);
  };

  return (
    <div className="login-screen-container">
      {popup && (
        <div className="login-popup-overlay" role="alert">
          <div className={`login-popup-card ${popup.type === "success" ? "login-popup-success" : "login-popup-error"}`}>
            <div className="login-popup-header">
              {popup.type === "success" ? <CheckCircle className="login-popup-icon" /> : <XCircle className="login-popup-icon" />}
              <strong className="login-popup-title">{popup.type === "success" ? "Sucesso" : "Algo deu errado"}</strong>
            </div>
            <p className="login-popup-message">{popup.message}</p>
            <button type="button" className="login-popup-close" onClick={handleClosePopup}>
              Fechar
            </button>
          </div>
        </div>
      )}
      <div className="login-screen-card">
        <div className="login-screen-header">
          <div className="login-logo-container">
            <img src={LogoImage} alt="FarolEdu" className="login-logo-icon" />
          </div>
          <h1 className="login-app-title">FarolEdu</h1>
          <p className="login-app-subtitle">Conectando estudantes e professores</p>
        </div>

        <div className="login-form-container">
          <div className="login-form">
            <div className="login-form-group">
              <label className="login-form-label">Email</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="login-form-input"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-form-label">Senha</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="login-form-input"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="login-password-toggle">
                  {showPassword ? <EyeOff className="login-toggle-icon" /> : <Eye className="login-toggle-icon" />}
                </button>
              </div>
            </div>

            <div className="login-forgot-password">
              <button className="login-forgot-password-btn">Esqueceu a senha?</button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className={`login-submit-btn ${isFormValid && !isLoading ? "login-btn-student" : "login-btn-disabled"}`}
            >
              {isLoading ? (
                <div className="login-loading-content">
                  <div className="login-spinner"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>

            <div className="login-divider">
              <span>ou</span>
            </div>

            <GoogleSignInButton
              fullWidth
              disabled={isLoading}
              onCredential={async credential => {
                setIsLoading(true);
                setPopup(null);
                try {
                  const data = await loginWithGoogleToken(credential);
                  setPopup({ type: "success", message: "Login realizado com sucesso! Redirecionando..." });
                  const roleLower = (data.user?.role ?? "").toLowerCase();
                  const targetRoute =
                    roleLower === "teacher" || roleLower === "professor" ? "/dashboard" : "/student";
                  redirectTimeoutRef.current = window.setTimeout(() => {
                    navigate(targetRoute, { replace: true });
                    redirectTimeoutRef.current = null;
                  }, 900);
                } catch (err: any) {
                  console.error("Erro no login Google:", err);
                  setPopup({ type: "error", message: err?.message || "Não foi possível entrar com Google" });
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={error => {
                console.error("Erro ao carregar/usar Google GIS:", error);
                const msg =
                  error.message?.toLowerCase().includes("popup") || error.message?.toLowerCase().includes("block")
                    ? "O navegador bloqueou a janela de login. Permita popups e tente novamente."
                    : "Não foi possível carregar o login do Google. Tente novamente.";
                setPopup({ type: "error", message: msg });
              }}
            />
          </div>

          <div className="login-signup-section">
            <p className="login-signup-text">
              Não tem uma conta?{" "}
              <button className="login-signup-btn" onClick={handleCreateAccount}>
                Criar Conta
              </button>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p className="login-footer-text">© 2025 FarolEdu. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

