import React, { useEffect, useRef, useState } from 'react';
import { User, GraduationCap, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';
import LogoImage from '../../assets/Logo.png';

interface LoginData {
  email: string;
  password: string;
  userType: 'student' | 'teacher' | null;
}

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
    userType: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleUserTypeSelect = (type: 'student' | 'teacher') => {
    setLoginData(prev => ({ ...prev, userType: type }));
  };

  const handleInputChange = (field: keyof Pick<LoginData, 'email' | 'password'>, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!loginData.userType) return;

    const email = loginData.email.trim().toLowerCase();
    const password = loginData.password;

    const isFormValid =
      email.length > 0 &&
      password.length > 0 &&
      (loginData.userType === 'student' || loginData.userType === 'teacher');

    if (!isFormValid) return;

    setIsLoading(true);
    setPopup(null);
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const path =
        loginData.userType === 'teacher'
          ? '/api/professors/login'
          : '/api/users/login';

      const resp = await fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // não enviar userType no body
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.message || 'Email ou senha inválidos');
      }

      const data = await resp.json();

      // Guarda token e perfil
      localStorage.setItem('token', data.token);
      const profile = data.teacher || data.user || data.student || {};
      localStorage.setItem('profile', JSON.stringify(profile));
      setPopup({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' });

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/dashboard'); // ajuste o destino se quiser
        redirectTimeoutRef.current = null;
      }, 1200);
    } catch (err: any) {
      console.error('Erro no login:', err);
      setPopup({ type: 'error', message: err?.message || 'Erro ao fazer login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const isFormValid =
    loginData.email.trim().length > 0 &&
    loginData.password.length > 0 &&
    !!loginData.userType;

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
          <div
            className={`login-popup-card ${
              popup.type === 'success' ? 'login-popup-success' : 'login-popup-error'
            }`}
          >
            <div className="login-popup-header">
              {popup.type === 'success' ? (
                <CheckCircle className="login-popup-icon" />
              ) : (
                <XCircle className="login-popup-icon" />
              )}
              <strong className="login-popup-title">
                {popup.type === 'success' ? 'Sucesso' : 'Algo deu errado'}
              </strong>
            </div>
            <p className="login-popup-message">{popup.message}</p>
            <button type="button" className="login-popup-close" onClick={handleClosePopup}>
              Fechar
            </button>
          </div>
        </div>
      )}
      <div className="login-screen-card">
        {/* Header */}
        <div className="login-screen-header">
          <div className="login-logo-container">
            <img src={LogoImage} alt="FarolEdu" className="login-logo-icon" />
          </div>
          <h1 className="login-app-title">FarolEdu</h1>
          <p className="login-app-subtitle">Conectando estudantes e professores</p>
        </div>

        {/* Formulário */}
        <div className="login-form-container">
          <div className="login-form">
            {!loginData.userType ? (
              <div className="login-user-type-selection">
                <h2 className="login-selection-title">Como você quer entrar?</h2>

                <button
                  onClick={() => handleUserTypeSelect('student')}
                  className="login-user-type-card login-student-card"
                >
                  <div className="login-card-content">
                    <div className="login-icon-wrapper">
                      <div className="login-student-icon-bg">
                        <User className="login-card-icon" />
                      </div>
                    </div>
                    <div className="login-card-text">
                      <h3 className="login-card-title">Sou Estudante</h3>
                      <p className="login-card-description">Quero encontrar professores particulares</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleUserTypeSelect('teacher')}
                  className="login-user-type-card login-teacher-card"
                >
                  <div className="login-card-content">
                    <div className="login-icon-wrapper">
                      <div className="login-teacher-icon-bg">
                        <GraduationCap className="login-card-icon" />
                      </div>
                    </div>
                    <div className="login-card-text">
                      <h3 className="login-card-title">Sou Professor</h3>
                      <p className="login-card-description">Quero oferecer aulas particulares</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <>
                {/* Tipo de usuário selecionado */}
                <div className="login-selected-type-indicator">
                  <div className="login-type-display">
                    <div
                      className={`login-type-icon ${
                        loginData.userType === 'student' ? 'login-student-bg' : 'login-teacher-bg'
                      }`}
                    >
                      {loginData.userType === 'student' ? (
                        <User className="login-small-icon" />
                      ) : (
                        <GraduationCap className="login-small-icon" />
                      )}
                    </div>
                    <span className="login-type-label">
                      {loginData.userType === 'student' ? 'Estudante' : 'Professor'}
                    </span>
                  </div>
                  <button
                    onClick={() => setLoginData(prev => ({ ...prev, userType: null }))}
                    className="login-change-type-btn"
                  >
                    Alterar
                  </button>
                </div>

                {/* Inputs */}
                <div className="login-form-group">
                  <label className="login-form-label">Email</label>
                  <div className="login-input-wrapper">
                    <Mail className="login-input-icon" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="login-form-input"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-password-toggle"
                    >
                      {showPassword ? <EyeOff className="login-toggle-icon" /> : <Eye className="login-toggle-icon" />}
                    </button>
                  </div>
                </div>

                {/* Esqueceu a senha */}
                <div className="login-forgot-password">
                  <button className="login-forgot-password-btn">
                    Esqueceu a senha?
                  </button>
                </div>

                {/* Botão Entrar */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading}
                  className={`login-submit-btn ${
                    isFormValid && !isLoading
                      ? loginData.userType === 'student'
                        ? 'login-btn-student'
                        : 'login-btn-teacher'
                      : 'login-btn-disabled'
                  }`}
                >
                  {isLoading ? (
                    <div className="login-loading-content">
                      <div className="login-spinner"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </>
            )}
          </div>

          {/* Link para criar conta */}
          <div className="login-signup-section">
            <p className="login-signup-text">
              Não tem uma conta?{' '}
              <button className="login-signup-btn" onClick={handleCreateAccount}>
                Criar Conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="login-footer-text">© 2025 FarolEdu. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
