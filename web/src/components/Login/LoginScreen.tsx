import React, { useState } from 'react';
import { User, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

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

  const handleUserTypeSelect = (type: 'student' | 'teacher') => {
    setLoginData(prev => ({ ...prev, userType: type }));
  };

  const handleInputChange = (field: keyof Pick<LoginData, 'email' | 'password'>, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Simular chamada de API
    setTimeout(() => {
      console.log('Login data:', loginData);
      setIsLoading(false);
      // Aqui você faria o redirect após login bem-sucedido
      // navigate('/dashboard');
    }, 2000);
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const isFormValid = loginData.email && loginData.password && loginData.userType;

  return (
    <div className="login-screen-container">
      <div className="login-screen-card">
        {/* Header */}
        <div className="login-screen-header">
          <div className="login-logo-container">
            <GraduationCap className="login-logo-icon" />
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
                    <div className={`login-type-icon ${loginData.userType === 'student' ? 'login-student-bg' : 'login-teacher-bg'}`}>
                      {loginData.userType === 'student' ? 
                        <User className="login-small-icon" /> : 
                        <GraduationCap className="login-small-icon" />
                      }
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
          <p className="login-footer-text">© 2025 EduConnect. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;