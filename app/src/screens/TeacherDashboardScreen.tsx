import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlusCircle, CalendarDays, Users, MapPin, Clock } from 'lucide-react-native';
import Navbar from '../components/Navbar';
import { GRADIENTS } from '../theme/gradients';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import {
  createTeacherClass,
  fetchTeacherClasses,
  fetchTeacherSchedules,
  type TeacherClass,
  type TeacherSchedule,
} from '../services/teacherClassService';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type FormState = {
  title: string;
  subject: string;
  modality: string;
  durationMinutes: string;
  price: string;
  description: string;
};

const MODALITY_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'home', label: 'Minha casa' },
  { value: 'travel', label: 'Vou ao aluno' },
  { value: 'presencial', label: 'Presencial combinado' },
  { value: 'hybrid', label: 'Híbrido' },
] as const;

const DEFAULT_FORM: FormState = {
  title: '',
  subject: '',
  modality: 'online',
  durationMinutes: '60',
  price: '',
  description: '',
};

const TeacherDashboardScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { token, profile, isRestoring } = useAuth();
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const isTeacher =
    profile && typeof profile === 'object' && 'role' in profile
      ? String((profile as { role?: string }).role ?? '').toLowerCase() === 'teacher'
      : false;

  const teacherName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return '';
    const rawName = (profile as { name?: string }).name ?? '';
    return rawName.trim();
  }, [profile]);

  const loadDashboardData = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const [classesResponse, schedulesResponse] = await Promise.all([
          fetchTeacherClasses(token),
          fetchTeacherSchedules(token),
        ]);
        setTeacherClasses(
          classesResponse?.slice().sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ) ?? [],
        );
        setSchedules(
          schedulesResponse?.slice().sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ) ?? [],
        );
      } catch (error) {
        console.error('Erro ao carregar dados do painel:', error);
        setErrorMessage('Não foi possível carregar seus dados agora. Tente novamente em instantes.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      if (!token || !isTeacher) {
        return;
      }
      loadDashboardData(true);
    }, [isTeacher, loadDashboardData, token]),
  );

  useEffect(() => {
    if (isRestoring) return;
    if (!token || !isTeacher) {
      navigation.replace('Home');
    }
  }, [isRestoring, isTeacher, navigation, token]);

  const handleChange = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) return;
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Informe um título para a aula.');
      return;
    }

    const durationNumber = Number(form.durationMinutes);
    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      setErrorMessage('Informe uma duração válida em minutos.');
      return;
    }

    let priceNumber: number | undefined;
    if (form.price.trim()) {
      const parsed = Number(form.price.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setErrorMessage('Valor informado é inválido.');
        return;
      }
      priceNumber = Number(parsed.toFixed(2));
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: trimmedTitle,
        subject: form.subject.trim() || undefined,
        description: form.description.trim() || undefined,
        modality: form.modality,
        durationMinutes: Math.round(durationNumber),
        price: priceNumber,
      };

      const created = await createTeacherClass(token, payload);
      setTeacherClasses(prev => {
        const next = [created, ...prev];
        return next.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
      setSuccessMessage('Aula cadastrada com sucesso!');
      resetForm();
    } catch (error) {
      console.error('Erro ao cadastrar aula:', error);
      setErrorMessage('Não foi possível salvar a aula. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, resetForm, token]);

  const handleRefresh = useCallback(() => {
    if (!token) return;
    setIsRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData, token]);

  const upcomingSchedules = useMemo(() => {
    const now = Date.now();
    return schedules.filter(item => new Date(item.date).getTime() >= now);
  }, [schedules]);

  const renderTeacherClasses = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accentPrimary} />
        </View>
      );
    }

    if (!teacherClasses.length) {
      return <Text style={styles.emptyText}>Nenhuma aula cadastrada ainda.</Text>;
    }

    return teacherClasses.map(item => {
      const createdDate = new Date(item.createdAt);
      const priceLabel =
        item.price !== null && item.price !== undefined && item.price !== ''
          ? `R$ ${Number(item.price).toFixed(2)}`
          : 'Valor não informado';
      return (
        <View key={item.id} style={styles.classCard}>
          <View style={styles.classHeader}>
            <Text style={styles.classTitle}>{item.title}</Text>
            <Text style={styles.classModality}>{item.modality.toUpperCase()}</Text>
          </View>
          {item.subject ? (
            <Text style={styles.classSubject}>Disciplina: {item.subject}</Text>
          ) : null}
          <View style={styles.classMetaRow}>
            <View style={styles.classMetaItem}>
              <Clock size={16} color={COLORS.accentPrimary} />
              <Text style={styles.classMetaText}>{item.durationMinutes} min</Text>
            </View>
            <View style={styles.classMetaItem}>
              <MapPin size={16} color={COLORS.accentPrimary} />
              <Text style={styles.classMetaText}>{priceLabel}</Text>
            </View>
          </View>
          {item.description ? (
            <Text style={styles.classDescription}>{item.description}</Text>
          ) : null}
          <Text style={styles.classFootnote}>
            Cadastrada em {createdDate.toLocaleDateString('pt-BR')}
          </Text>
        </View>
      );
    });
  };

  const renderSchedules = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accentPrimary} />
        </View>
      );
    }

    if (!upcomingSchedules.length) {
      return <Text style={styles.emptyText}>Nenhuma aula agendada para os próximos dias.</Text>;
    }

    return upcomingSchedules.map(item => {
      const date = new Date(item.date);
      const studentName = item.student?.name ?? 'Aluno não identificado';
      return (
        <View key={item.id} style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <CalendarDays size={18} color={COLORS.accentPrimary} />
            <Text style={styles.scheduleDate}>
              {date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <View style={styles.scheduleBody}>
            <View style={styles.scheduleMeta}>
              <Clock size={16} color={COLORS.accentPrimary} />
              <Text style={styles.scheduleMetaText}>
                {date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.scheduleMeta}>
              <Users size={16} color={COLORS.accentPrimary} />
              <Text style={styles.scheduleMetaText}>{studentName}</Text>
            </View>
            {item.student?.email ? (
              <Text style={styles.scheduleEmail}>{item.student.email}</Text>
            ) : null}
          </View>
        </View>
      );
    });
  };

  const headerLinks = useMemo(
    () => [
      { label: 'Início', onPress: () => navigation.navigate('Home') },
      { label: 'Painel', onPress: () => {} },
    ],
    [navigation],
  );

  return (
    <LinearGradient {...GRADIENTS.teacherBackground} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <Navbar links={headerLinks} showAuthButtons={false} />

        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accentPrimary}
            />
          }
        >
          <View style={styles.headerSection}>
            <Text style={styles.greeting}>
              {teacherName ? `${teacherName}` : 'Bem-vindo(a)'}
            </Text>
            <Text style={styles.subtitle}>
              Cadastre novas aulas e acompanhe a agenda de encontros já agendados.
            </Text>
          </View>

          <View style={styles.cardsWrapper}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <PlusCircle color={COLORS.accentPrimary} size={18} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Cadastrar aulas</Text>
                  <Text style={styles.cardDescription}>
                    Registre novos encontros e veja tudo que já foi preparado.
                  </Text>
                </View>
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Título da aula</Text>
                <TextInput
                  style={styles.input}
                  value={form.title}
                  onChangeText={value => handleChange('title', value)}
                  placeholder="Ex.: Reforço de matemática"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Disciplina / tema</Text>
                <TextInput
                  style={styles.input}
                  value={form.subject}
                  onChangeText={value => handleChange('subject', value)}
                  placeholder="Matemática, Física, Idiomas..."
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Modalidade</Text>
                  <View style={styles.modalityContainer}>
                    {MODALITY_OPTIONS.map(option => {
                      const isActive = form.modality === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          activeOpacity={0.85}
                          style={styles.modalityOption}
                          onPress={() => handleChange('modality', option.value)}
                        >
                          <View style={[styles.modalityRadioOuter, isActive && styles.modalityRadioOuterActive]}>
                            {isActive && <View style={styles.modalityRadioInner} />}
                          </View>
                          <Text style={[styles.modalityOptionText, isActive && styles.modalityOptionTextActive]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Duração (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.durationMinutes}
                    keyboardType="numeric"
                    onChangeText={value => handleChange('durationMinutes', value.replace(/[^0-9]/g, ''))}
                    placeholder="60"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Valor (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={form.price}
                  keyboardType="decimal-pad"
                  onChangeText={value => handleChange('price', value)}
                  placeholder="Ex.: 80,00"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.description}
                  onChangeText={value => handleChange('description', value)}
                  placeholder="Inclua detalhes sobre o conteúdo, materiais ou pré-requisitos."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                disabled={isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Salvar aula</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <CalendarDays color={COLORS.accentPrimary} size={18} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Agenda de aulas</Text>
                  <Text style={styles.cardDescription}>
                    Visualize rapidamente os encontros que já estão marcados.
                  </Text>
                </View>
              </View>
              {renderSchedules()}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suas aulas cadastradas</Text>
            {renderTeacherClasses()}
          </View>
        </ScrollView>
      </SafeAreaView>
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
  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 20,
  },
  headerSection: {
    gap: 6,
    marginTop: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral900,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral600,
  },
  cardsWrapper: {
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 6,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderIcon: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 10,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral900,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.neutral600,
  },
  formGroup: {
    gap: 6,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral800,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.neutral900,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  modalityContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  modalityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  modalityRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalityRadioOuterActive: {
    borderColor: COLORS.accentPrimary,
  },
  modalityRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPrimary,
  },
  modalityOptionText: {
    fontSize: 14,
    color: COLORS.neutral700,
    flex: 1,
  },
  modalityOptionTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: COLORS.accentPrimary,
    alignItems: 'center',
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  successText: {
    color: '#0f9d58',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.neutral600,
  },
  classCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral900,
  },
  classModality: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  classSubject: {
    fontSize: 13,
    color: COLORS.neutral700,
  },
  classMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  classMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classMetaText: {
    fontSize: 12,
    color: COLORS.neutral600,
  },
  classDescription: {
    fontSize: 13,
    color: COLORS.neutral700,
  },
  classFootnote: {
    fontSize: 11,
    color: COLORS.neutral500,
    marginTop: 4,
  },
  scheduleCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral900,
    textTransform: 'capitalize',
  },
  scheduleBody: {
    gap: 6,
  },
  scheduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleMetaText: {
    fontSize: 13,
    color: COLORS.neutral700,
  },
  scheduleEmail: {
    fontSize: 12,
    color: COLORS.neutral600,
  },
});

export default TeacherDashboardScreen;
