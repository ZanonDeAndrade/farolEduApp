import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';
import { useAuth, type UserType as AuthUserType } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

type NullableUserType = AuthUserType | null;

type PopupState = {
  type: 'success' | 'error';
  message: string;
};

type RegisterData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
  userType: NullableUserType;
  subjects: string[];
  experience: string;
};

const SUBJECT_OPTIONS = [
  'Matemática',
  'Português',
  'Inglês',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Literatura',
  'Programação',
  'Música',
  'Artes',
  'Educação Física',
] as const;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signUp, signIn } = useAuth();
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
    userType: null,
    subjects: [],
    experience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleUserTypeSelect = useCallback((type: AuthUserType) => {
    setRegisterData(prev => ({
      ...prev,
      userType: type,
      subjects: type === 'teacher' ? prev.subjects : [],
      experience: type === 'teacher' ? prev.experience : '',
    }));
  }, []);

  const handleUserTypeChange = useCallback((type: NullableUserType) => {
    setRegisterData(prev => ({
      ...prev,
      userType: type,
      subjects: type === 'teacher' ? prev.subjects : [],
      experience: type === 'teacher' ? prev.experience : '',
    }));
  }, []);

  const handleInputChange = useCallback(
    (field: keyof RegisterData, value: string) => {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubjectToggle = useCallback((subject: string) => {
    setRegisterData(prev => {
      const currentSubjects = prev.subjects ?? [];
      const exists = currentSubjects.includes(subject);
      return {
        ...prev,
        subjects: exists ? currentSubjects.filter(item => item !== subject) : [...currentSubjects, subject],
      };
    });
  }, []);

  const isStep1Valid = useMemo(() => registerData.userType !== null, [registerData.userType]);

  const isStep2Valid = useMemo(() => {
    return (
      registerData.name.trim().length > 0 &&
      registerData.email.trim().length > 0 &&
      registerData.phone.trim().length > 0 &&
      registerData.city.trim().length > 0
    );
  }, [registerData.name, registerData.email, registerData.phone, registerData.city]);

  const passwordStrong = useMemo(() => registerData.password.length >= 6, [registerData.password]);
  const passwordsMatch = useMemo(
    () =>
      registerData.password.length > 0 &&
      registerData.confirmPassword.length > 0 &&
      registerData.password === registerData.confirmPassword,
    [registerData.password, registerData.confirmPassword],
  );

  const isStep3Valid = useMemo(
    () =>
      registerData.password.trim().length > 0 &&
      registerData.confirmPassword.trim().length > 0 &&
      passwordStrong &&
      passwordsMatch,
    [passwordStrong, passwordsMatch, registerData.password, registerData.confirmPassword],
  );

  const isStep4Valid = useMemo(() => {
    if (registerData.userType === 'student') {
      return true;
    }
    if (registerData.userType === 'teacher') {
      return registerData.subjects.length > 0;
    }
    return false;
  }, [registerData.subjects, registerData.userType]);

  const handleSubmit = useCallback(async () => {
    if (!isStep4Valid || !registerData.userType) {
      return;
    }

    setIsLoading(true);
    setPopup(null);

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    const trimmedName = registerData.name.trim();
    const trimmedEmail = registerData.email.trim().toLowerCase();
    const password = registerData.password;

    try {
      const createdProfile = await signUp({
        name: trimmedName,
        email: trimmedEmail,
        password,
        userType: registerData.userType,
      });

      const session = await signIn({
        email: trimmedEmail,
        password,
        userType: registerData.userType,
      });

      const displayName =
        createdProfile?.name ?? session.profile?.name ?? registerData.name;

      setPopup({
        type: 'success',
        message: `Conta criada com sucesso, ${displayName.split(' ')[0]}! Redirecionando...`,
      });

      redirectTimeoutRef.current = setTimeout(() => {
        setPopup(null);
        navigation.navigate('Home');
        redirectTimeoutRef.current = null;
      }, 1400);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      let fallback = 'Erro ao criar conta. Verifique as informações e tente novamente.';
      if (error instanceof ApiError) {
        fallback = error.message;
      } else if (error instanceof Error) {
        fallback = error.message;
      }
      setPopup({ type: 'error', message: fallback });
    } finally {
      setIsLoading(false);
    }
  }, [isStep4Valid, navigation, registerData, signIn, signUp]);

  const handleClosePopup = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setPopup(null);
  }, []);

  const goBack = useCallback(() => {
    if (currentStep === 1) {
      navigation.navigate('Login');
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, [currentStep, navigation]);

  const goNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const renderProgressSteps = useMemo(() => [1, 2, 3, 4], []);

  return (
    <LinearGradient colors={['#FFF6F1', '#FDF3FF', '#EEF2FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={24}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
                  <ArrowLeft size={22} color="#4338CA" />
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <View style={styles.logoSection}>
                  <View style={styles.logoContainer}>
                    <Image source={require('../../assets/Logo.png')} style={styles.logo} />
                  </View>
                  <Text style={styles.title}>FarolEdu</Text>
                  <Text style={styles.subtitle}>Crie sua conta</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={styles.progressSteps}>
                    {renderProgressSteps.map(step => (
                      <View
                        key={step}
                        style={[styles.progressStep, currentStep >= step && styles.progressStepActive]}
                      >
                        <Text
                          style={[
                            styles.progressStepText,
                            currentStep >= step && styles.progressStepTextActive,
                          ]}
                        >
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={[styles.progressLabel, currentStep >= 1 && styles.progressLabelActive]}>
                      Tipo
                    </Text>
                    <Text style={[styles.progressLabel, currentStep >= 2 && styles.progressLabelActive]}>
                      Dados
                    </Text>
                    <Text style={[styles.progressLabel, currentStep >= 3 && styles.progressLabelActive]}>
                      Senha
                    </Text>
                    <Text style={[styles.progressLabel, currentStep >= 4 && styles.progressLabelActive]}>
                      Perfil
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.formContainer}>
                {currentStep === 1 && (
                  <View style={styles.formStep}>
                    <Text style={styles.stepTitle}>Tipo de Conta</Text>

                    {!registerData.userType ? (
                      <View style={styles.userTypeSelection}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => handleUserTypeSelect('student')}
                          style={[
                            styles.userTypeCard,
                            styles.studentCard,
                            registerData.userType === 'student' && styles.userTypeCardSelected,
                          ]}
                        >
                          <View style={styles.cardContent}>
                            <View style={styles.iconWrapper}>
                              <View style={[styles.iconBackground, styles.studentIconBackground]}>
                                <User size={24} color="#2563EB" />
                              </View>
                            </View>
                            <View style={styles.cardText}>
                              <Text style={styles.cardTitle}>Sou Estudante</Text>
                              <Text style={styles.cardDescription}>Quero encontrar professores</Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => handleUserTypeSelect('teacher')}
                          style={[
                            styles.userTypeCard,
                            styles.teacherCard,
                            registerData.userType === 'teacher' && styles.userTypeCardSelected,
                          ]}
                        >
                          <View style={styles.cardContent}>
                            <View style={styles.iconWrapper}>
                              <View style={[styles.iconBackground, styles.teacherIconBackground]}>
                                <GraduationCap size={24} color="#F97316" />
                              </View>
                            </View>
                            <View style={styles.cardText}>
                              <Text style={styles.cardTitle}>Sou Professor</Text>
                              <Text style={styles.cardDescription}>Quero ensinar estudantes</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.profileStep}>
                        <View style={styles.selectedType}>
                          <Text style={styles.selectedTypeLabel}>
                            Conta: {registerData.userType === 'student' ? 'Estudante' : 'Professor'}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleUserTypeChange(null)}
                            style={styles.changeTypeButton}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.changeTypeText}>Alterar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {registerData.userType && (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={goNext}
                        disabled={!isStep1Valid}
                        style={[styles.nextButton, isStep1Valid ? styles.buttonEnabled : styles.buttonDisabled]}
                      >
                        <Text style={styles.nextButtonText}>Continuar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {currentStep === 2 && (
                  <View style={styles.formStep}>
                    <Text style={styles.stepTitle}>Dados Pessoais</Text>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Nome Completo</Text>
                      <View style={styles.inputWrapper}>
                        <User size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.name}
                          onChangeText={value => handleInputChange('name', value)}
                          placeholder="Seu nome completo"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.email}
                          onChangeText={value => handleInputChange('email', value)}
                          placeholder="seu@email.com"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Telefone</Text>
                      <View style={styles.inputWrapper}>
                        <Phone size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.phone}
                          onChangeText={value => handleInputChange('phone', value)}
                          placeholder="(11) 99999-9999"
                          placeholderTextColor="#94A3B8"
                          keyboardType="phone-pad"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Cidade</Text>
                      <View style={styles.inputWrapper}>
                        <MapPin size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.city}
                          onChangeText={value => handleInputChange('city', value)}
                          placeholder="Sua cidade"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={goNext}
                      disabled={!isStep2Valid}
                      style={[styles.nextButton, isStep2Valid ? styles.buttonEnabled : styles.buttonDisabled]}
                    >
                      <Text style={styles.nextButtonText}>Continuar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {currentStep === 3 && (
                  <View style={styles.formStep}>
                    <Text style={styles.stepTitle}>Criar Senha</Text>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Senha</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.password}
                          onChangeText={value => handleInputChange('password', value)}
                          placeholder="Mínimo 6 caracteres"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showPassword}
                          style={styles.input}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(prev => !prev)}
                          style={styles.passwordToggle}
                          activeOpacity={0.7}
                        >
                          {showPassword ? <EyeOff size={20} color="#475569" /> : <Eye size={20} color="#475569" />}
                        </TouchableOpacity>
                      </View>
                      {registerData.password.length > 0 && !passwordStrong && (
                        <Text style={styles.errorText}>Senha deve ter pelo menos 6 caracteres</Text>
                      )}
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Confirmar Senha</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={registerData.confirmPassword}
                          onChangeText={value => handleInputChange('confirmPassword', value)}
                          placeholder="Digite a senha novamente"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showConfirmPassword}
                          style={styles.input}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(prev => !prev)}
                          style={styles.passwordToggle}
                          activeOpacity={0.7}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} color="#475569" />
                          ) : (
                            <Eye size={20} color="#475569" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {registerData.confirmPassword.length > 0 && !passwordsMatch && (
                        <Text style={styles.errorText}>Senhas não conferem</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={goNext}
                      disabled={!isStep3Valid}
                      style={[styles.nextButton, isStep3Valid ? styles.buttonEnabled : styles.buttonDisabled]}
                    >
                      <Text style={styles.nextButtonText}>Continuar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {currentStep === 4 && (
                  <View style={styles.formStep}>
                    <Text style={styles.stepTitle}>Perfil</Text>

                    {registerData.userType === 'teacher' && (
                      <>
                        <View style={styles.formGroup}>
                          <Text style={styles.inputLabel}>Matérias que ensina</Text>
                          <View style={styles.subjectGrid}>
                            {SUBJECT_OPTIONS.map(subject => {
                              const selected = registerData.subjects.includes(subject);
                              return (
                                <TouchableOpacity
                                  key={subject}
                                  style={[styles.subjectChip, selected && styles.subjectChipSelected]}
                                  onPress={() => handleSubjectToggle(subject)}
                                  activeOpacity={0.8}
                                >
                                  <View
                                    style={[
                                      styles.subjectCheckbox,
                                      selected && styles.subjectCheckboxSelected,
                                    ]}
                                  >
                                    {selected && <CheckCircle size={16} color="#FFFFFF" />}
                                  </View>
                                  <Text
                                    style={[
                                      styles.subjectText,
                                      selected && styles.subjectTextSelected,
                                    ]}
                                  >
                                    {subject}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.inputLabel}>Experiência</Text>
                          <TextInput
                            value={registerData.experience}
                            onChangeText={value => handleInputChange('experience', value)}
                            placeholder="Descreva sua experiência como professor"
                            placeholderTextColor="#94A3B8"
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                          />
                        </View>
                      </>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleSubmit}
                      disabled={!isStep4Valid || isLoading}
                      style={[
                        styles.submitButton,
                        isStep4Valid && !isLoading ? styles.buttonEnabled : styles.buttonDisabled,
                      ]}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContent}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.loadingText}>Criando conta...</Text>
                        </View>
                      ) : (
                        <Text style={styles.submitButtonText}>Criar Conta</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.loginReminder}>
                  <Text style={styles.loginText}>Já tem uma conta?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                    <Text style={styles.loginButtonText}>Fazer Login</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 FarolEdu. Todos os direitos reservados.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal transparent animationType="fade" visible={Boolean(popup)} onRequestClose={handleClosePopup}>
        <View style={styles.popupOverlay}>
          <View
            style={[styles.popupCard, popup?.type === 'success' ? styles.popupSuccess : styles.popupError]}
          >
            <View style={styles.popupHeader}>
              {popup?.type === 'success' ? (
                <CheckCircle size={28} color="#16A34A" />
              ) : (
                <XCircle size={28} color="#DC2626" />
              )}
              <Text style={styles.popupTitle}>
                {popup?.type === 'success' ? 'Conta criada' : 'Não foi possível criar a conta'}
              </Text>
            </View>

            <Text style={styles.popupMessage}>{popup?.message}</Text>

            <TouchableOpacity onPress={handleClosePopup} style={styles.popupCloseButton} activeOpacity={0.8}>
              <Text style={styles.popupCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    gap: 24,
  },
  header: {
    gap: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  logoSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    padding: 0,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressStepActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progressStepTextActive: {
    color: '#4338CA',
  },
  progressLabels: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  progressLabelActive: {
    color: '#4338CA',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.08)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 6,
    gap: 24,
  },
  formStep: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  userTypeSelection: {
    gap: 14,
  },
  userTypeCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 3,
  },
  studentCard: {},
  teacherCard: {},
  userTypeCardSelected: {
    borderColor: 'rgba(79, 70, 229, 0.4)',
    transform: [{ translateY: -2 }],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    flexShrink: 0,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentIconBackground: {
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
  },
  teacherIconBackground: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
  },
  cardText: {
    gap: 4,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
  },
  profileStep: {
    alignItems: 'center',
  },
  selectedType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  changeTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  changeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  nextButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#4338CA',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5F5',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
  },
  passwordToggle: {
    padding: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: '#FFFFFF',
  },
  subjectChipSelected: {
    borderColor: '#4338CA',
    backgroundColor: '#EEF2FF',
  },
  subjectCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  subjectCheckboxSelected: {
    borderColor: '#4338CA',
    backgroundColor: '#4338CA',
  },
  subjectText: {
    fontSize: 14,
    color: '#475569',
  },
  subjectTextSelected: {
    color: '#4338CA',
    fontWeight: '600',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginReminder: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  loginText: {
    fontSize: 14,
    color: '#475569',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  popupCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  popupSuccess: {
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  popupError: {
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  popupMessage: {
    fontSize: 15,
    color: '#1F2937',
    textAlign: 'center',
  },
  popupCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#4338CA',
  },
  popupCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RegisterScreen;
