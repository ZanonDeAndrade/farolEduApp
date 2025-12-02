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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAuth, type UserType as AuthUserType } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import Navbar, { type NavbarLink } from '../components/Navbar';
import { COLORS } from '../theme/colors';

type PopupState = {
  type: 'success' | 'error';
  message: string;
};

const loginSchema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  userType: z.enum(['student', 'teacher'], { required_error: 'Selecione um tipo de conta' }),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const isUltraCompact = width < 340;
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watch,
    setValue,
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      userType: undefined as unknown as AuthUserType,
    },
    mode: 'onChange',
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

  const navbarLinks = useMemo<NavbarLink[]>(
    () => [
      {
        label: 'Início',
        onPress: () => navigation.navigate('Home'),
      },
    ],
    [navigation],
  );

  const selectedType = watch('userType');
  const emailValue = watch('email');
  const passwordValue = watch('password');

  const handleUserTypeSelect = useCallback(
    (type: AuthUserType) => {
      setValue('userType', type, { shouldValidate: true });
    },
    [setValue],
  );

  const onSubmit = useCallback(
    handleSubmit(async formData => {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

    setIsLoading(true);
    setPopup(null);

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    try {
      const session = await signIn({
        email,
        password,
        userType: formData.userType,
      });

      const userName =
        session.profile?.name ? `, ${session.profile.name.split(' ')[0]}` : '';

      const isTeacherProfile =
        session.profile && typeof session.profile === 'object'
          ? String((session.profile as { role?: string }).role ?? '').toLowerCase() === 'teacher'
          : false;

      const targetRoute: keyof RootStackParamList = isTeacherProfile ? 'TeacherDashboard' : 'Home';

      setPopup({
        type: 'success',
        message: `Login realizado com sucesso${userName}! Redirecionando...`,
      });
      reset();

      redirectTimeoutRef.current = setTimeout(() => {
        setPopup(null);
        navigation.replace(targetRoute);
        redirectTimeoutRef.current = null;
      }, 1200);
    } catch (error) {
      console.error('Erro no login:', error);
      let message = 'Erro ao fazer login. Tente novamente.';
      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setPopup({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
    }),
    [handleSubmit, navigation, reset, signIn],
  );

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
    <LinearGradient
      colors={['#F7F9FF', '#E9EFFF', '#D6DEFA']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <Navbar
          links={navbarLinks}
          onLoginPress={() => navigation.navigate('Login')}
          onRegisterPress={() => navigation.navigate('Register')}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isCompact && styles.scrollContentCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, isCompact && styles.cardCompact]}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/Logo.png')}
                    style={[
                      styles.logo,
                      isCompact && styles.logoCompact,
                      isUltraCompact && styles.logoSmall,
                    ]}
                  />
                </View>
                <Text style={styles.title}>FarolEdu</Text>
                <Text style={styles.subtitle}>Conectando estudantes e professores</Text>
              </View>

              <View
                style={[
                  styles.formContainer,
                  isCompact && styles.formContainerCompact,
                  isUltraCompact && styles.formContainerUltraCompact,
                ]}
              >
                {!selectedType ? (
                  <View style={[styles.userTypeSelection, isCompact && styles.userTypeSelectionCompact]}>
                    <Text style={[styles.selectionTitle, isCompact && styles.selectionTitleCompact]}>
                      Como você quer entrar?
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleUserTypeSelect('student')}
                      style={[
                        styles.userTypeCard,
                        styles.studentCard,
                        selectedType === 'student' && styles.userTypeCardSelected,
                        isCompact && styles.userTypeCardCompact,
                      ]}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.iconWrapper}>
                          <View style={[styles.iconBackground, styles.studentIconBackground]}>
                            <User size={24} color={COLORS.accentPrimary} />
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
                        selectedType === 'teacher' && styles.userTypeCardSelected,
                        isCompact && styles.userTypeCardCompact,
                      ]}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.iconWrapper}>
                          <View style={[styles.iconBackground, styles.teacherIconBackground]}>
                          <GraduationCap size={24} color={COLORS.accentWarmAlt} />
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
                    <View
                      style={[
                        styles.selectedTypeIndicator,
                        isCompact && styles.selectedTypeIndicatorCompact,
                      ]}
                    >
                      <View style={[styles.typeDisplay, isCompact && styles.typeDisplayCompact]}>
                        <View
                          style={[
                            styles.selectedTypeIcon,
                            selectedType === 'student'
                              ? styles.selectedStudentBackground
                              : styles.selectedTeacherBackground,
                          ]}
                        >
                          {selectedType === 'student' ? (
                          <User size={18} color={COLORS.accentPrimary} />
                          ) : (
                          <GraduationCap size={18} color={COLORS.accentWarmAlt} />
                          )}
                        </View>
                        <Text style={styles.typeLabel}>
                          {selectedType === 'student' ? 'Estudante' : 'Professor'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.changeTypeButton}
                        onPress={() =>
                          setValue('userType', undefined as unknown as AuthUserType, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <Text style={styles.changeTypeText}>Alterar</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={20} color={COLORS.textSubtle} style={styles.inputIcon} />
                        <Controller
                          control={control}
                          name="email"
                          render={({ field: { value, onChange, onBlur } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="seu@email.com"
                              placeholderTextColor={COLORS.textSubtle}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoCorrect={false}
                              style={styles.input}
                              accessibilityLabel="Email"
                            />
                          )}
                        />
                      </View>
                      {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Senha</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={20} color={COLORS.textSubtle} style={styles.inputIcon} />
                        <Controller
                          control={control}
                          name="password"
                          render={({ field: { value, onChange, onBlur } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="••••••••"
                              placeholderTextColor={COLORS.textSubtle}
                              secureTextEntry={!showPassword}
                              style={styles.input}
                              accessibilityLabel="Senha"
                            />
                          )}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(prev => !prev)}
                          style={styles.passwordToggle}
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={COLORS.textMuted} />
                          ) : (
                            <Eye size={20} color={COLORS.textMuted} />
                          )}
                        </TouchableOpacity>
                      </View>
                      {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
                    </View>

                    <View style={[styles.forgotPasswordContainer, isCompact && styles.forgotPasswordCompact]}>
                      <TouchableOpacity activeOpacity={0.7} style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                      </TouchableOpacity>
                    </View>

                      <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={onSubmit}
                      disabled={!isValid || isLoading}
                      style={[
                        styles.submitButton,
                        selectedType === 'student'
                          ? styles.studentSubmitButton
                          : styles.teacherSubmitButton,
                        (!isValid || isLoading) && styles.submitButtonDisabled,
                        isCompact && styles.submitButtonCompact,
                      ]}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContent}>
                          <ActivityIndicator
                            size="small"
                            color={
                              selectedType === 'teacher'
                                ? COLORS.accentHighlight
                                : COLORS.white
                            }
                          />
                          <Text
                            style={[
                              styles.loadingText,
                              selectedType === 'teacher' && styles.teacherSubmitButtonText,
                            ]}
                          >
                            Entrando...
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.submitButtonText,
                            selectedType === 'teacher' && styles.teacherSubmitButtonText,
                          ]}
                        >
                          Entrar
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                <View style={[styles.signupContainer, isCompact && styles.signupContainerCompact]}>
                  <Text style={styles.signupText}>Não tem uma conta?</Text>
                  <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                    <Text style={styles.signupButtonText}>Criar Conta</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.footer, isCompact && styles.footerCompact]}>
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
  scrollContentCompact: {
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: 24,
  },
  cardCompact: {
    gap: 20,
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
  logoCompact: {
    width: 120,
    height: 120,
  },
  logoSmall: {
    width: 108,
    height: 108,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.heading,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.12)',
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    gap: 24,
  },
  formContainerCompact: {
    padding: 20,
    gap: 20,
  },
  formContainerUltraCompact: {
    padding: 18,
    borderRadius: 24,
  },
  userTypeSelection: {
    gap: 16,
  },
  userTypeSelectionCompact: {
    gap: 14,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectionTitleCompact: {
    fontSize: 18,
  },
  userTypeCard: {
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.18)',
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  userTypeCardCompact: {
    padding: 18,
  },
  userTypeCardSelected: {
    borderColor: 'rgba(106, 64, 180, 0.4)',
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
    backgroundColor: 'rgba(106, 64, 180, 0.18)',
  },
  teacherIconBackground: {
    backgroundColor: 'rgba(247, 232, 163, 0.3)',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  selectedTypeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(183, 203, 245, 0.24)',
  },
  selectedTypeIndicatorCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  typeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeDisplayCompact: {
    justifyContent: 'center',
  },
  selectedTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedStudentBackground: {
    backgroundColor: 'rgba(106, 64, 180, 0.2)',
  },
  selectedTeacherBackground: {
    backgroundColor: 'rgba(247, 232, 163, 0.34)',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  changeTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(228, 236, 255, 0.5)',
  },
  changeTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.accentPrimary,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.2)',
    backgroundColor: 'rgba(228, 236, 255, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  passwordToggle: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordCompact: {
    alignItems: 'center',
  },
  forgotPasswordButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentSubmitButton: {
    backgroundColor: COLORS.accentPrimary,
  },
  teacherSubmitButton: {
    backgroundColor: COLORS.accentWarm,
    borderWidth: 1,
    borderColor: COLORS.accentHighlight,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.accentSecondary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonCompact: {
    paddingVertical: 14,
  },
  teacherSubmitButtonText: {
    color: COLORS.accentHighlight,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  signupContainerCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  signupButtonText: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerCompact: {
    paddingBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 37, 71, 0.55)',
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
    shadowColor: COLORS.accentPrimary,
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
    color: COLORS.heading,
  },
  popupMessage: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
  },
  popupCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentPrimary,
  },
  popupCloseButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;
