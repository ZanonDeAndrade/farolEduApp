import { useState } from 'react';
import { User, GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RegisterScreen.css';
import { registerTeacher, loginTeacher, registerStudent, loginStudent, AuthProvider } from "../../services/auth";
import LogoImage from '../../assets/Logo.png';


interface RegisterData {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
  userType: 'student' | 'teacher' | null;
  experience: string;
  authMethod: 'email' | 'google';
  profilePhoto?: File | null;
  preferredModality: 'online' | 'presencial' | 'hibrida';
  studentRegion: string;
  wantsFavorites: boolean;
  wantsDirectMessages: boolean;
}

const MAX_PROFILE_PHOTO_BYTES = 2.5 * 1024 * 1024; // ~2.5 MB

const authProviderMap: Record<RegisterData['authMethod'], AuthProvider> = {
  email: 'EMAIL',
  google: 'GOOGLE',
};

const authProviderLabel: Record<RegisterData['authMethod'], string> = {
  email: 'e-mail',
  google: 'Google',
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Não foi possível ler a imagem selecionada.'));
      }
    };
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

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
    experience: '',
    authMethod: 'email',
    profilePhoto: undefined,
    preferredModality: 'online',
    studentRegion: '',
    wantsFavorites: true,
    wantsDirectMessages: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSubmittedType, setLastSubmittedType] = useState<'student' | 'teacher' | null>(null);

  const handleUserTypeSelect = (type: 'student' | 'teacher') => {
    setRegisterData(prev => ({
      ...prev,
      userType: type,
      experience: type === 'teacher' ? prev.experience : '',
      preferredModality: type === 'student' ? prev.preferredModality : prev.preferredModality,
      studentRegion: type === 'student' ? prev.studentRegion : '',
    }));
  };

  const handleUserTypeChange = (type: 'student' | 'teacher' | null) => {
    setRegisterData(prev => ({
      ...prev,
      userType: type,
      experience: type === 'teacher' ? prev.experience : '',
      preferredModality: type === 'student' ? prev.preferredModality : 'online',
      studentRegion: type === 'student' ? prev.studentRegion : '',
    }));
  };

  const handleInputChange = <K extends keyof RegisterData>(field: K, value: RegisterData[K]) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthMethodSelect = (method: 'email' | 'google') => {
    setRegisterData(prev => ({ ...prev, authMethod: method }));
  };

  const handlePreferredModalityChange = (value: 'online' | 'presencial' | 'hibrida') => {
    setRegisterData(prev => ({ ...prev, preferredModality: value }));
  };

  const handleProfilePhotoChange = (file: File | null) => {
    setRegisterData(prev => ({ ...prev, profilePhoto: file ?? undefined }));
  };

  const handleCityChange = (value: string) => {
    setRegisterData(prev => ({
      ...prev,
      city: value,
      studentRegion: prev.userType === 'student' && !prev.studentRegion ? value : prev.studentRegion,
    }));
  };

  const handleSubmit = async () => {
    if (!registerData.userType) return;
    if (registerData.password !== registerData.confirmPassword) return;
    if (!isStep4Valid) return;

    if (
      registerData.userType === 'teacher' &&
      registerData.profilePhoto &&
      registerData.profilePhoto.size > MAX_PROFILE_PHOTO_BYTES
    ) {
      setPopup({
        type: 'error',
        message: 'A foto de perfil deve ter no máximo 2,5 MB. Escolha uma imagem menor.',
      });
      return;
    }

    setIsLoading(true);
    setPopup(null);
    try {
      const basePayload = {
        name: registerData.name.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
      };

      if (registerData.userType === 'teacher') {
        const profilePhotoBase64 = registerData.profilePhoto
          ? await fileToBase64(registerData.profilePhoto)
          : undefined;

        const teacherPayload = {
          ...basePayload,
          authProvider: authProviderMap[registerData.authMethod],
          phone: registerData.phone.trim(),
          city: registerData.city.trim(),
          region: registerData.city.trim(),
          experience: registerData.experience.trim() || undefined,
          profilePhoto: profilePhotoBase64,
          wantsToAdvertise: false,
        };

        await registerTeacher(teacherPayload);
        await loginTeacher({ email: basePayload.email, password: basePayload.password });
      } else {
        await registerStudent(basePayload);
        await loginStudent({ email: basePayload.email, password: basePayload.password });
      }

      setLastSubmittedType(registerData.userType);

      setPopup({
        type: 'success',
        message:
          registerData.userType === 'teacher'
            ? 'Perfil de professor criado com sucesso! Salve suas aulas e volte quando quiser para ajustar o anúncio.'
            : 'Conta criada com sucesso! Personalize seu perfil para aproveitar todos os recursos.',
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const messageFromServer = err?.response?.data?.message;
      const fallbackMessage = !err?.response && err?.message ? err.message : "Erro ao criar conta";
      const message = messageFromServer || fallbackMessage;
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
    setPopup(null);
  };

  const handleContinueAfterSuccess = () => {
    setPopup(null);
    if (lastSubmittedType === 'teacher') {
      const dashboardUrl = `${window.location.origin.replace(/\/$/, '')}/dashboard`;
      window.location.replace(dashboardUrl);
    } else {
      navigate('/');
    }
  };

  const handleAdvertiseDecision = (decision: 'now' | 'later') => {
    if (decision === 'now') {
      try {
        window.localStorage.setItem('faroledu_advertise_intent', 'true');
      } catch (error) {
        console.warn('Não foi possível registrar a intenção de anúncio.', error);
      }
    }
    handleContinueAfterSuccess();
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
  const isStep2Valid =
    registerData.name.trim().length > 0 &&
    registerData.email.trim().length > 0 &&
    registerData.phone.trim().length > 0 &&
    registerData.city.trim().length > 0 &&
    (registerData.userType === 'teacher'
      ? true
      : registerData.userType === 'student'
        ? registerData.studentRegion.trim().length > 0
        : false);
  const isStep3Valid = registerData.password && registerData.confirmPassword && registerData.password === registerData.confirmPassword;
  const isTeacherProfileValid = registerData.userType === 'teacher';

  const isStep4Valid = registerData.userType === 'student' || isTeacherProfileValid;

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
            {popup.type === 'success' ? (
              <div className="register-popup-actions">
                {lastSubmittedType === 'teacher' && (
                  <>
                    <p className="register-popup-reminder">
                      Você pode atualizar seus dados de aulas a qualquer momento em Perfil &gt; Editar perfil.
                    </p>
                    <div className="register-popup-advertise">
                      <p>Gostaria de anunciar suas aulas agora?</p>
                      <div className="register-popup-buttons">
                        <button
                          type="button"
                          className="register-popup-primary"
                          onClick={() => handleAdvertiseDecision('now')}
                        >
                          Sim, quero anunciar
                        </button>
                        <button
                          type="button"
                          className="register-popup-secondary"
                          onClick={() => handleAdvertiseDecision('later')}
                        >
                          Talvez depois
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  className="register-popup-primary"
                  onClick={handleContinueAfterSuccess}
                >
                  {lastSubmittedType === 'teacher' ? 'Ir para o painel' : 'Ir para a página inicial'}
                </button>
              </div>
            ) : (
              <button type="button" className="register-popup-close" onClick={handleClosePopup}>
                Fechar
              </button>
            )}
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
                  <>
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

                    <div className="register-auth-section">
                      <p className="register-auth-title">Como prefere continuar?</p>
                      <p className="register-auth-subtitle">
                        Escolha a forma de acesso ideal para sua conta de {registerData.userType === 'teacher' ? 'professor' : 'estudante'}.
                      </p>

                      <div className="register-auth-options">
                        <button
                          type="button"
                          className={`register-auth-option ${registerData.authMethod === 'email' ? 'is-active' : ''}`}
                          onClick={() => handleAuthMethodSelect('email')}
                        >
                          <div className="register-auth-icon is-email">
                            <Mail className="register-auth-icon-svg" />
                          </div>
                          <div className="register-auth-copy">
                            <span className="register-auth-label">Continuar com e-mail</span>
                            <span className="register-auth-helper">Defina manualmente e-mail e senha</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`register-auth-option ${registerData.authMethod === 'google' ? 'is-active' : ''}`}
                          onClick={() => handleAuthMethodSelect('google')}
                        >
                          <div className="register-auth-icon is-google">
                            <span>G</span>
                          </div>
                          <div className="register-auth-copy">
                            <span className="register-auth-label">Entrar com Google</span>
                            <span className="register-auth-helper">Usa o e-mail da sua conta Google</span>
                          </div>
                        </button>

                      </div>

                      <p className="register-auth-hint">
                        Nós confirmaremos suas informações pessoais para garantir a segurança da conta e completar o seu perfil.
                      </p>
                    </div>
                  </>
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
                  <label className="register-form-label">Cidade/Região (qualquer lugar do Brasil)</label>
                  <div className="register-input-wrapper">
                    <MapPin className="register-input-icon" />
                    <input
                      type="text"
                      className="register-form-input"
                      value={registerData.city}
                      onChange={e => handleCityChange(e.target.value)}
                      placeholder="Ex.: Recife - PE"
                    />
                  </div>
                  <p className="register-helper-text">
                    Informe onde você atende para conectar estudantes próximos ou interessados em aulas online.
                  </p>
                </div>

                {registerData.userType === 'teacher' && (
                  <>
                    <div className="register-form-group">
                      <label className="register-form-label">Foto de perfil</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="register-form-input register-file-input"
                        onChange={event => handleProfilePhotoChange(event.target.files?.[0] ?? null)}
                      />
                      <p className="register-helper-text">
                        Utilize uma foto sozinho(a), sorrindo, com boa iluminação e sem elementos distrativos.
                      </p>
                    </div>

                    <div className="register-form-group">
                      <label className="register-form-label">Experiência (opcional)</label>
                      <textarea
                        className="register-form-textarea"
                        value={registerData.experience}
                        onChange={e => handleInputChange('experience', e.target.value)}
                        placeholder="Descreva formações, certificações ou resultados dos seus alunos"
                      />
                    </div>
                  </>
                )}

                {registerData.userType === 'student' && (
                  <>
                    <div className="register-form-group">
                      <label className="register-form-label">Região onde mora</label>
                      <div className="register-input-wrapper">
                        <MapPin className="register-input-icon" />
                        <input
                          type="text"
                          className="register-form-input"
                          value={registerData.studentRegion}
                          onChange={e => handleInputChange('studentRegion', e.target.value)}
                          placeholder="Bairro ou região"
                        />
                      </div>
                    </div>

                    <div className="register-form-group">
                      <label className="register-form-label">Preferência de modalidade</label>
                      <div className="register-modality-group">
                        {[{ value: 'online', label: 'Online', description: 'Estudo 100% remoto' }, { value: 'presencial', label: 'Presencial', description: 'Quero aulas na minha região' }, { value: 'hibrida', label: 'Híbrida', description: 'Misturo online e presencial' }].map(option => {
                          const active = registerData.preferredModality === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={`register-modality-option ${active ? 'is-active' : ''}`}
                              onClick={() => handlePreferredModalityChange(option.value as 'online' | 'presencial' | 'hibrida')}
                            >
                              <span className="register-modality-label">{option.label}</span>
                              <span className="register-modality-description">{option.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

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
                <p className="register-helper-text">
                  {registerData.authMethod === 'email'
                    ? 'Crie uma senha segura para acessar sua conta.'
                    : `Mesmo escolhendo entrar com ${authProviderLabel[registerData.authMethod]}, configuramos uma senha para garantir o acesso quando preferir.`}
                </p>

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

                {registerData.userType === 'teacher' ? (
                  <p className="register-helper-text">
                    Revise suas informações e finalize o cadastro para começar a divulgar suas aulas.
                  </p>
                ) : (
                  <>
                    <div className="register-form-group">
                      <label className="register-form-label">Foto de perfil</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="register-form-input register-file-input"
                        onChange={event => handleProfilePhotoChange(event.target.files?.[0] ?? null)}
                      />
                      <p className="register-helper-text">
                        Prefira uma foto nítida, sozinho(a) e com boa iluminação. Ela ajuda professores a reconhecerem você.
                      </p>
                    </div>

                    <div className="register-settings-card">
                      <h3 className="register-settings-title">Preferências do seu perfil</h3>
                      <label className="register-toggle-option">
                        <input
                          type="checkbox"
                          checked={registerData.wantsFavorites}
                          onChange={event => handleInputChange('wantsFavorites', event.target.checked)}
                        />
                        <span className="register-toggle-indicator" />
                        <span>
                          Ativar aba de professores favoritos
                          <small>Salve contatos e receba novidades dos seus docentes preferidos.</small>
                        </span>
                      </label>
                      <label className="register-toggle-option">
                        <input
                          type="checkbox"
                          checked={registerData.wantsDirectMessages}
                          onChange={event => handleInputChange('wantsDirectMessages', event.target.checked)}
                        />
                        <span className="register-toggle-indicator" />
                        <span>
                          Ativar mensagens diretas com professores
                          <small>Troque arquivos e tire dúvidas em tempo real pelo FarolEdu.</small>
                        </span>
                      </label>
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!isStep4Valid || isLoading}
                  className={`register-submit-btn ${isStep4Valid && !isLoading ? 'register-btn-enabled' : 'register-btn-disabled'}`}
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
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
