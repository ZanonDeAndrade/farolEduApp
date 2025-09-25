import { useEffect, useRef, useState } from 'react';
import { User, GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RegisterScreen.css';
import { registerTeacher, loginTeacher, registerStudent, loginStudent } from "../../services/auth";
import LogoImage from '../../assets/Logo.png';


interface RegisterData {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
  userType: 'student' | 'teacher' | null;
  subjects?: string[];
  experience?: string;
}

const RegisterScreen = () => {
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
    userType: null,
    subjects: [],
    experience: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    setRegisterData(prev => ({ ...prev, userType: type }));
  };

  const handleUserTypeChange = (type: 'student' | 'teacher' | null) => {
    setRegisterData(prev => ({ ...prev, userType: type }));
  };

  const handleInputChange = (field: keyof RegisterData, value: string | number | string[]) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setRegisterData(prev => ({
      ...prev,
      subjects: checked 
        ? [...(prev.subjects || []), subject]
        : (prev.subjects || []).filter(s => s !== subject)
    }));
  };

  const handleSubmit = async () => {
    if (!registerData.userType) return;
    if (registerData.password !== registerData.confirmPassword) return;
  
    setIsLoading(true);
    setPopup(null);
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    try {
      const payload = {
        name: registerData.name.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
      };
  
      if (registerData.userType === "teacher") {
        // cria professor no backend
        await registerTeacher(payload);
        // login professor
        await loginTeacher({ email: payload.email, password: payload.password });
      } else {
        // cria aluno no backend
        await registerStudent(payload);
        // login aluno
        await loginStudent({ email: payload.email, password: payload.password });
      }
  
      setPopup({ type: 'success', message: 'Conta criada com sucesso! Redirecionando para o login...' });

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate("/login"); // ou direto pro dashboard: navigate("/dashboard")
        redirectTimeoutRef.current = null;
      }, 1400);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Erro ao criar conta";
      if (status === 409) {
        setPopup({ type: 'error', message: 'Usuário já cadastrado. Tente fazer login ou recuperar a senha.' });
      } else {
        setPopup({ type: 'error', message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setPopup(null);
  };


  const goBack = () => {
    if (currentStep === 1) {
      navigate('/login');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const goNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const isStep1Valid = registerData.userType !== null;
  const isStep2Valid = registerData.name && registerData.email && registerData.phone && registerData.city;
  const isStep3Valid = registerData.password && registerData.confirmPassword && registerData.password === registerData.confirmPassword;
  const isStep4Valid = registerData.userType === 'student' || (registerData.userType === 'teacher' && registerData.subjects && registerData.subjects.length > 0);

  const subjectOptions = [
    'Matemática', 'Português', 'Inglês', 'Física', 'Química', 'Biologia',
    'História', 'Geografia', 'Filosofia', 'Sociologia', 'Literatura',
    'Programação', 'Música', 'Artes', 'Educação Física'
  ];

  const passwordsMatch = registerData.password === registerData.confirmPassword;
  const passwordStrong = registerData.password.length >= 6;

  return (
    <div className="register-container">
      {popup && (
        <div className="register-popup-overlay" role="alert">
          <div
            className={`register-popup-card ${
              popup.type === 'success' ? 'register-popup-success' : 'register-popup-error'
            }`}
          >
            <div className="register-popup-header">
              {popup.type === 'success' ? (
                <CheckCircle className="register-popup-icon" />
              ) : (
                <XCircle className="register-popup-icon" />
              )}
              <strong className="register-popup-title">
                {popup.type === 'success' ? 'Conta criada' : 'Não foi possível criar a conta'}
              </strong>
            </div>
            <p className="register-popup-message">{popup.message}</p>
            <button type="button" className="register-popup-close" onClick={handleClosePopup}>
              Fechar
            </button>
          </div>
        </div>
      )}
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <button onClick={goBack} className="register-back-button">
            <ArrowLeft className="register-back-icon" />
            Voltar
          </button>

          <div className="register-logo-section">
            <div className="register-logo-container">
              <img src={LogoImage} alt="FarolEdu" className="register-logo-icon" />
            </div>
            <h1 className="register-app-title">FarolEdu</h1>
            <p className="register-app-subtitle">Crie sua conta</p>
          </div>

          {/* Progress Bar */}
          <div className="register-progress-bar">
            <div className="register-progress-steps">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`register-progress-step ${currentStep >= step ? 'active' : ''}`}>
                  {step}
                </div>
              ))}
            </div>
            <div className="register-progress-labels">
              <span className={currentStep >= 1 ? 'register-active-label' : ''}>Tipo</span>
              <span className={currentStep >= 2 ? 'register-active-label' : ''}>Dados</span>
              <span className={currentStep >= 3 ? 'register-active-label' : ''}>Senha</span>
              <span className={currentStep >= 4 ? 'register-active-label' : ''}>Perfil</span>
            </div>
          </div>
        </div>

        <div className="register-form-container">
          <div className="register-form">
            {/* Step 1 - Tipo de Conta */}
            {currentStep === 1 && (
              <div className="register-form-step">
                <h2 className="register-step-title">Tipo de Conta</h2>

                {!registerData.userType ? (
                  <div className="register-user-type-selection">
                    <button onClick={() => handleUserTypeSelect('student')} className="register-user-type-card register-student-card">
                      <div className="register-card-content">
                        <div className="register-icon-wrapper">
                          <div className="register-student-icon-bg">
                            <User className="register-card-icon" />
                          </div>
                        </div>
                        <div className="register-card-text">
                          <h3 className="register-card-title">Sou Estudante</h3>
                          <p className="register-card-description">Quero encontrar professores</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => handleUserTypeSelect('teacher')} className="register-user-type-card register-teacher-card">
                      <div className="register-card-content">
                        <div className="register-icon-wrapper">
                          <div className="register-teacher-icon-bg">
                            <GraduationCap className="register-card-icon" />
                          </div>
                        </div>
                        <div className="register-card-text">
                          <h3 className="register-card-title">Sou Professor</h3>
                          <p className="register-card-description">Quero ensinar estudantes</p>
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="register-profile-step">
                    <div className="register-selected-type">
                      <div className="register-type-display">
                        <span className="register-type-label">
                          Conta: {registerData.userType === 'student' ? 'Estudante' : 'Professor'}
                        </span>
                      </div>
                      <button 
                        className="register-change-type-btn"
                        onClick={() => handleUserTypeChange(null)}
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                )}

                {registerData.userType && (
                  <button
                    onClick={goNext}
                    disabled={!isStep1Valid}
                    className={`register-next-btn ${isStep1Valid ? 'register-btn-enabled' : 'register-btn-disabled'}`}
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {/* Step 2 - Dados Pessoais */}
            {currentStep === 2 && (
              <div className="register-form-step">
                <h2 className="register-step-title">Dados Pessoais</h2>

                <div className="register-form-group">
                  <label className="register-form-label">Nome Completo</label>
                  <div className="register-input-wrapper">
                    <User className="register-input-icon" />
                    <input
                      type="text"
                      className="register-form-input"
                      value={registerData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">Email</label>
                  <div className="register-input-wrapper">
                    <Mail className="register-input-icon" />
                    <input
                      type="email"
                      className="register-form-input"
                      value={registerData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">Telefone</label>
                  <div className="register-input-wrapper">
                    <Phone className="register-input-icon" />
                    <input
                      type="tel"
                      className="register-form-input"
                      value={registerData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">Cidade</label>
                  <div className="register-input-wrapper">
                    <MapPin className="register-input-icon" />
                    <input
                      type="text"
                      className="register-form-input"
                      value={registerData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>

                <button
                  onClick={goNext}
                  disabled={!isStep2Valid}
                  className={`register-next-btn ${isStep2Valid ? 'register-btn-enabled' : 'register-btn-disabled'}`}
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 3 - Senha */}
            {currentStep === 3 && (
              <div className="register-form-step">
                <h2 className="register-step-title">Criar Senha</h2>

                <div className="register-form-group">
                  <label className="register-form-label">Senha</label>
                  <div className="register-input-wrapper">
                    <Lock className="register-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="register-form-input"
                      value={registerData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button 
                      type="button" 
                      className="register-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="register-toggle-icon" /> : <Eye className="register-toggle-icon" />}
                    </button>
                  </div>
                  {registerData.password && !passwordStrong && (
                    <span className="register-error-message">Senha deve ter pelo menos 6 caracteres</span>
                  )}
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">Confirmar Senha</label>
                  <div className="register-input-wrapper">
                    <Lock className="register-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="register-form-input"
                      value={registerData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Digite a senha novamente"
                    />
                    <button 
                      type="button" 
                      className="register-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="register-toggle-icon" /> : <Eye className="register-toggle-icon" />}
                    </button>
                  </div>
                  {registerData.confirmPassword && !passwordsMatch && (
                    <span className="register-error-message">Senhas não conferem</span>
                  )}
                </div>

                <button
                  onClick={goNext}
                  disabled={!isStep3Valid}
                  className={`register-next-btn ${isStep3Valid ? 'register-btn-enabled' : 'register-btn-disabled'}`}
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 4 - Perfil */}
            {currentStep === 4 && (
              <div className="register-form-step">
                <h2 className="register-step-title">Perfil</h2>

                {registerData.userType === 'teacher' && (
                  <>
                    <div className="register-form-group">
                      <label className="register-form-label">Matérias que ensina</label>
                      <div className="register-subjects-grid">
                        {subjectOptions.map(subj => (
                          <label key={subj} className="register-subject-checkbox">
                            <input
                              type="checkbox"
                              checked={registerData.subjects?.includes(subj)}
                              onChange={e => handleSubjectChange(subj, e.target.checked)}
                            />
                            <span className="register-checkmark"></span>
                            {subj}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="register-form-group">
                      <label className="register-form-label">Experiência</label>
                      <textarea
                        className="register-form-textarea"
                        value={registerData.experience}
                        onChange={e => handleInputChange('experience', e.target.value)}
                        placeholder="Descreva sua experiência como professor"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!isStep4Valid || isLoading}
                  className={`register-submit-btn ${isStep4Valid && !isLoading ? 'register-btn-enabled' : 'register-btn-disabled'}`}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </button>
              </div>
            )}
          </div>

          {/* Login Link */}
          <div className="register-login-section">
            <p className="register-login-text">
              Já tem uma conta?{' '}
              <button onClick={() => navigate('/login')} className="register-login-btn">
                Fazer Login
              </button>
            </p>
          </div>
        </div>

        <div className="register-footer">
          <p className="register-footer-text">© 2025 FarolEdu. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
