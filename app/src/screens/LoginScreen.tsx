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
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
  XCircle,
} from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';
import { persistValue } from '../utils/storage';

type UserType = 'student' | 'teacher' | null;

type PopupState = {
  type: 'success' | 'error';
  message: string;
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loginData, setLoginData] = useState<{ email: string; password: string; userType: UserType }>({
    email: '',
    password: '',
    userType: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleUserTypeSelect = useCallback((type: Exclude<UserType, null>) => {
    setLoginData(prev => ({ ...prev, userType: type }));
  }, []);

  const handleInputChange = useCallback((field: 'email' | 'password', value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    return (
      loginData.email.trim().length > 0 &&
      loginData.password.length > 0 &&
      Boolean(loginData.userType)
    );
  }, [loginData]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || !loginData.userType) {
      return;
    }

    const email = loginData.email.trim().toLowerCase();
    const password = loginData.password;

    setIsLoading(true);
    setPopup(null);

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    try {
      const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
      const path = loginData.userType === 'teacher' ? '/api/professors/login' : '/api/users/login';

      const response = await fetch(`${baseURL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? 'Email ou senha inválidos');
      }

      const data = await response.json();

      if (data?.token) {
        await persistValue('token', data.token);
      }

      const profile = data?.teacher ?? data?.user ?? data?.student ?? {};
      await persistValue('profile', JSON.stringify(profile));

      setPopup({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' });

      redirectTimeoutRef.current = setTimeout(() => {
        setPopup(null);
        navigation.navigate('Home');
        redirectTimeoutRef.current = null;
      }, 1200);
    } catch (error) {
      console.error('Erro no login:', error);
      const message =
        error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.';
      setPopup({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, loginData, navigation]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleClosePopup = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setPopup(null);
  }, []);

  return (
    <LinearGradient colors={['#FFF6F1', '#FDF3FF', '#EEF2FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image source={require('../../assets/Logo.png')} style={styles.logo} />
                </View>
                <Text style={styles.title}>FarolEdu</Text>
                <Text style={styles.subtitle}>Conectando estudantes e professores</Text>
              </View>

              <View style={styles.formContainer}>
                {!loginData.userType ? (
                  <View style={styles.userTypeSelection}>
                    <Text style={styles.selectionTitle}>Como você quer entrar?</Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleUserTypeSelect('student')}
                      style={[
                        styles.userTypeCard,
                        styles.studentCard,
                        loginData.userType === 'student' && styles.userTypeCardSelected,
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
                          <Text style={styles.cardDescription}>
                            Quero encontrar professores particulares
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleUserTypeSelect('teacher')}
                      style={[
                        styles.userTypeCard,
                        styles.teacherCard,
                        loginData.userType === 'teacher' && styles.userTypeCardSelected,
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
                          <Text style={styles.cardDescription}>
                            Quero oferecer aulas particulares
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.selectedTypeIndicator}>
                      <View style={styles.typeDisplay}>
                        <View
                          style={[
                            styles.selectedTypeIcon,
                            loginData.userType === 'student'
                              ? styles.selectedStudentBackground
                              : styles.selectedTeacherBackground,
                          ]}
                        >
                          {loginData.userType === 'student' ? (
                            <User size={18} color="#2563EB" />
                          ) : (
                            <GraduationCap size={18} color="#F97316" />
                          )}
                        </View>
                        <Text style={styles.typeLabel}>
                          {loginData.userType === 'student' ? 'Estudante' : 'Professor'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.changeTypeButton}
                        onPress={() =>
                          setLoginData(prev => ({
                            ...prev,
                            userType: null,
                          }))
                        }
                      >
                        <Text style={styles.changeTypeText}>Alterar</Text>
                      </TouchableOpacity>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={loginData.email}
                          onChangeText={value => handleInputChange('email', value)}
                          placeholder="seu@email.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>Senha</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                          value={loginData.password}
                          onChangeText={value => handleInputChange('password', value)}
                          placeholder="••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showPassword}
                          style={styles.input}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(prev => !prev)}
                          style={styles.passwordToggle}
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color="#475569" />
                          ) : (
                            <Eye size={20} color="#475569" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.forgotPasswordContainer}>
                      <TouchableOpacity activeOpacity={0.7} style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={handleSubmit}
                      disabled={!isFormValid || isLoading}
                      style={[
                        styles.submitButton,
                        loginData.userType === 'student'
                          ? styles.studentSubmitButton
                          : styles.teacherSubmitButton,
                        (!isFormValid || isLoading) && styles.submitButtonDisabled,
                      ]}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContent}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.loadingText}>Entrando...</Text>
                        </View>
                      ) : (
                        <Text style={styles.submitButtonText}>Entrar</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Não tem uma conta?</Text>
                  <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                    <Text style={styles.signupButtonText}>Criar Conta</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  © 2025 FarolEdu. Todos os direitos reservados.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(popup)}
        onRequestClose={handleClosePopup}
      >
        <View style={styles.popupOverlay}>
          <View
            style={[
              styles.popupCard,
              popup?.type === 'success' ? styles.popupSuccess : styles.popupError,
            ]}
          >
            <View style={styles.popupHeader}>
              {popup?.type === 'success' ? (
                <CheckCircle size={28} color="#16A34A" />
              ) : (
                <XCircle size={28} color="#DC2626" />
              )}
              <Text style={styles.popupTitle}>
                {popup?.type === 'success' ? 'Sucesso' : 'Algo deu errado'}
              </Text>
            </View>

            <Text style={styles.popupMessage}>{popup?.message}</Text>

            <TouchableOpacity onPress={handleClosePopup} style={styles.popupCloseButton}>
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
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    padding: 0,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.08)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    gap: 24,
  },
  userTypeSelection: {
    gap: 16,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  userTypeCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  userTypeCardSelected: {
    borderColor: 'rgba(79, 70, 229, 0.4)',
    transform: [{ translateY: -2 }],
  },
  studentCard: {},
  teacherCard: {},
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
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  teacherIconBackground: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  cardText: {
    flex: 1,
    gap: 4,
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
  selectedTypeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  typeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedStudentBackground: {
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
  },
  selectedTeacherBackground: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  changeTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
  },
  changeTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4338CA',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
  passwordToggle: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentSubmitButton: {
    backgroundColor: '#2563EB',
  },
  teacherSubmitButton: {
    backgroundColor: '#F97316',
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5F5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  signupText: {
    fontSize: 14,
    color: '#475569',
  },
  signupButtonText: {
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '600',
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

export default LoginScreen;
