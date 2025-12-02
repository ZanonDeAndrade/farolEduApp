import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Search, Sparkles, Wifi } from 'lucide-react-native';
import Navbar from '../components/Navbar';
import { COLORS } from '../theme/colors';
import { GRADIENTS } from '../theme/gradients';
import type { RootStackParamList } from '../navigation/types';
import {
  fetchPublicTeacherClasses,
  type PublicTeacherClass,
} from '../services/teacherClassService';
import { requestAiSuggestion } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Filters = {
  subject: string;
  city: string;
  modality: string;
};

const DEFAULT_FILTERS: Filters = {
  subject: '',
  city: '',
  modality: 'online',
};

const SearchProfessorsScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { token } = useAuth();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<PublicTeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPublicTeacherClasses({
        q: filters.subject.trim() || undefined,
        city: filters.city.trim() || undefined,
        modality: filters.modality || undefined,
        take: 20,
      });
      setResults(data);
    } catch (err) {
      console.error('Erro ao buscar aulas:', err);
      setError('Não foi possível buscar professores agora. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.city, filters.modality, filters.subject]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleChange = useCallback(<K extends keyof Filters>(field: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAiSuggest = useCallback(async () => {
    setIsLoadingAi(true);
    setAiText(null);
    try {
      const suggestion = await requestAiSuggestion({
        subject: filters.subject.trim() || 'reforço escolar',
        city: filters.city.trim() || 'sua cidade',
        modality: filters.modality,
      });
      setAiText(suggestion);
    } catch (err) {
      console.error('Erro ao pedir sugestão IA:', err);
      setAiText('Não foi possível obter uma sugestão agora.');
    } finally {
      setIsLoadingAi(false);
    }
  }, [filters.city, filters.modality, filters.subject]);

  const title = useMemo(() => {
    if (filters.subject.trim()) {
      return `Aulas de ${filters.subject.trim()}`;
    }
    return 'Buscar professores';
  }, [filters.subject]);

  return (
    <LinearGradient {...GRADIENTS.screenBackground} style={styles.gradient}>
      <Navbar
        links={[
          { label: 'Início', onPress: () => navigation.navigate('Home') },
          { label: 'Encontrar aulas', onPress: () => {} },
        ]}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Refine por cidade, modalidade ou peça uma sugestão rápida com IA para começar.
          </Text>
        </View>

        <View style={styles.filtersCard}>
          <View style={styles.inputGroup}>
            <Search size={18} color={COLORS.textSubtle} />
            <TextInput
              style={styles.input}
              value={filters.subject}
              onChangeText={value => handleChange('subject', value)}
              placeholder="Matemática, inglês, reforço..."
              placeholderTextColor={COLORS.textSubtle}
              accessibilityLabel="Buscar por matéria ou tema"
            />
          </View>

          <View style={styles.inputGroup}>
            <MapPin size={18} color={COLORS.textSubtle} />
            <TextInput
              style={styles.input}
              value={filters.city}
              onChangeText={value => handleChange('city', value)}
              placeholder="Cidade ou região"
              placeholderTextColor={COLORS.textSubtle}
              accessibilityLabel="Filtrar por cidade ou região"
            />
          </View>

          <View style={styles.modalityRow}>
            {['online', 'home', 'travel', 'presencial'].map(value => {
              const isActive = filters.modality === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleChange('modality', value)}
                  style={[styles.chip, isActive && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  {value === 'online' ? (
                    <Wifi size={14} color={isActive ? COLORS.white : COLORS.accentPrimary} />
                  ) : (
                    <MapPin size={14} color={isActive ? COLORS.white : COLORS.accentPrimary} />
                  )}
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {value === 'home'
                      ? 'Minha casa'
                      : value === 'travel'
                      ? 'Vou ao aluno'
                      : value === 'presencial'
                      ? 'Presencial'
                      : 'Online'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={loadClasses} style={styles.primaryButton} activeOpacity={0.9}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Buscar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAiSuggest}
              style={styles.secondaryButton}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              {isLoadingAi ? (
                <ActivityIndicator color={COLORS.accentPrimary} />
              ) : (
                <View style={styles.aiRow}>
                  <Sparkles size={16} color={COLORS.accentPrimary} />
                  <Text style={styles.secondaryButtonText}>Sugestão IA</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {aiText ? <Text style={styles.aiText}>{aiText}</Text> : null}
        </View>

        <View style={styles.list}>
          {isLoading && results.length === 0 ? (
            <View style={styles.empty}>
              <ActivityIndicator color={COLORS.accentPrimary} />
              <Text style={styles.emptyText}>Buscando professores...</Text>
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Nenhum resultado ainda. Tente ajustar filtros ou peça uma sugestão.
              </Text>
            </View>
          ) : (
            results.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => {
                  if (!item.teacherId) return;
                  navigation.navigate('ProfessorDetail', { teacherId: item.teacherId });
                }}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.modality}>{item.modality}</Text>
                </View>
                {item.subject ? <Text style={styles.cardSubtitle}>{item.subject}</Text> : null}
                {item.description ? (
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.teacherName}>{item.teacher?.name ?? 'Professor(a)'}</Text>
                    <Text style={styles.location}>
                      {item.teacher?.teacherProfile?.city || item.teacher?.teacherProfile?.region || 'Local não informado'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.scheduleButton}
                    onPress={() => {
                      if (!item.teacherId) {
                        return;
                      }
                      if (!token) {
                        navigation.navigate('Login');
                        return;
                      }
                      navigation.navigate('Schedule', {
                        teacherId: item.teacherId,
                        teacherName: item.teacher?.name ?? 'Professor',
                      });
                    }}
                  >
                    <Text style={styles.scheduleText}>{token ? 'Agendar' : 'Entrar p/ agendar'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.heading,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSubtle,
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.12)',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  modalityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.2)',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.2)',
    backgroundColor: '#fff',
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  aiText: {
    color: COLORS.text,
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.heading,
  },
  modality: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardDescription: {
    color: COLORS.textSubtle,
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherName: {
    color: COLORS.text,
    fontWeight: '700',
  },
  location: {
    color: COLORS.textSubtle,
    fontSize: 12,
  },
  scheduleButton: {
    backgroundColor: COLORS.accentSecondary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  scheduleText: {
    color: COLORS.heading,
    fontWeight: '700',
  },
});

export default SearchProfessorsScreen;
