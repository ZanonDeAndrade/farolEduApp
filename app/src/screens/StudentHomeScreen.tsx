import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Navbar from '../components/Navbar';
import { COLORS } from '../theme/colors';
import { GRADIENTS } from '../theme/gradients';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList, StudentStackParamList } from '../navigation/types';
import { fetchMyBookings, type Schedule } from '../services/scheduleService';
import {
  fetchPublicTeacherClasses,
  type PublicTeacherClass,
} from '../services/teacherClassService';

type StudentNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<StudentStackParamList, 'StudentHome'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const StudentHomeScreen: React.FC = () => {
  const navigation = useNavigation<StudentNavigation>();
  const { token, profile, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Schedule[]>([]);
  const [offers, setOffers] = useState<PublicTeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offersError, setOffersError] = useState<string | null>(null);

  const isStudent = useMemo(() => {
    if (!profile || typeof profile !== 'object') return false;
    const role = (profile as { role?: string }).role ?? '';
    return role.toLowerCase() === 'student';
  }, [profile]);

  const firstName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 'estudante';
    const raw = ((profile as { name?: string }).name ?? '').trim();
    return raw ? raw.split(' ')[0] : 'estudante';
  }, [profile]);

  const loadData = useCallback(
    async (opts?: { isRefresh?: boolean }) => {
      if (!token) return;
      if (opts?.isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setOffersError(null);
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const from = now.toISOString();
      const to = in30Days.toISOString();

      const [bookingsResult, offersResult] = await Promise.allSettled([
        fetchMyBookings(token, { from, to }),
        fetchPublicTeacherClasses({ take: 6 }),
      ]);

      if (bookingsResult.status === 'fulfilled') {
        const upcoming = (bookingsResult.value ?? [])
          .filter(item => {
            const start = new Date(item.startTime).getTime();
            return start >= now.getTime() && start <= in30Days.getTime();
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        setBookings(upcoming);
      } else {
        console.error('Erro ao carregar bookings:', bookingsResult.reason);
        setBookings([]);
        setError('Não foi possível atualizar seus próximos horários.');
      }

      if (offersResult.status === 'fulfilled') {
        setOffers(offersResult.value ?? []);
      } else {
        console.error('Erro ao carregar ofertas:', offersResult.reason);
        setOffers([]);
        setOffersError('Não foi possível carregar as sugestões agora.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  },
  [token],
);

  useEffect(() => {
    if (!token) {
      navigation.getParent()?.navigate('Login');
      return;
    }
    if (!isStudent) {
      navigation.getParent()?.navigate('TeacherDashboard');
      return;
    }
    loadData();
  }, [isStudent, loadData, navigation, token]);

  const handleRefresh = useCallback(() => {
    if (!token || !isStudent) return;
    loadData({ isRefresh: true });
  }, [isStudent, loadData, token]);

  const handleSearch = useCallback(() => {
    const term = searchTerm.trim();
    navigation.navigate('SearchProfessors', term ? { q: term } : undefined);
  }, [navigation, searchTerm]);

  const handleViewAgenda = useCallback(() => {
    navigation.navigate('Calendar');
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigation.getParent()?.navigate('Login');
  }, [navigation, signOut]);

  const renderBookings = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonRow}>
          {[1, 2].map(item => (
            <View key={item} style={styles.skeletonCard} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.stateRow}>
            <AlertCircle color={COLORS.accentPrimary} size={18} />
            <Text style={styles.stateTitle}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => loadData()}>
            <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!bookings.length) {
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Você ainda não tem aulas agendadas.</Text>
          <Text style={styles.stateSubtitle}>Encontre um professor e agende sua próxima aula.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSearch}>
            <Text style={styles.primaryButtonText}>Pesquisar aulas</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.listColumn}>
        {bookings.map(booking => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{(booking.status || 'PENDING').toUpperCase()}</Text>
              </View>
              <Text style={styles.bookingDate}>{formatDate(booking.startTime)}</Text>
            </View>
            <View style={styles.bookingRow}>
              <CalendarDays size={16} color={COLORS.accentPrimary} />
              <Text style={styles.bookingTime}>
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </Text>
            </View>
            <View style={styles.bookingRow}>
              <BookOpen size={16} color={COLORS.accentPrimary} />
              <Text style={styles.bookingTitle}>{booking.offer?.title ?? 'Aula agendada'}</Text>
            </View>
            {booking.teacher ? (
              <View style={styles.bookingRow}>
                <Sparkles size={16} color={COLORS.accentSecondary} />
                <Text style={styles.bookingTeacher}>Prof. {booking.teacher.name}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderOffers = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonRow}>
          {[1, 2, 3].map(item => (
            <View key={item} style={[styles.skeletonCard, styles.offerSkeleton]} />
          ))}
        </View>
      );
    }

    if (offersError) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.stateRow}>
            <AlertCircle color={COLORS.accentPrimary} size={18} />
            <Text style={styles.stateTitle}>{offersError}</Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => loadData()}>
            <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!offers.length) {
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Nenhuma oferta encontrada agora.</Text>
          <Text style={styles.stateSubtitle}>Tente buscar por outra matéria ou cidade.</Text>
        </View>
      );
    }

    return (
      <View style={styles.listColumn}>
        {offers.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.offerCard}
            activeOpacity={0.9}
            onPress={() => {
              if (item.teacherId) {
                navigation.navigate('ProfessorDetail', { teacherId: item.teacherId });
              }
            }}
          >
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerModality}>{item.modality}</Text>
            </View>
            {item.subject ? <Text style={styles.offerSubject}>{item.subject}</Text> : null}
            {item.description ? (
              <Text numberOfLines={2} style={styles.offerDescription}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.offerFooter}>
              <View style={styles.offerMeta}>
                <Clock3 size={14} color={COLORS.accentPrimary} />
                <Text style={styles.offerMetaText}>{item.durationMinutes} min</Text>
              </View>
              <View style={styles.offerMeta}>
                <MapPin size={14} color={COLORS.accentPrimary} />
                <Text style={styles.offerMetaText}>
                  {item.teacher?.teacherProfile?.city ??
                    item.teacher?.teacherProfile?.region ??
                    'Local não informado'}
                </Text>
              </View>
              <Text style={styles.offerPrice}>{formatPrice(item)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar
        showAuthButtons={false}
        links={[
          { label: 'Home', onPress: () => navigation.navigate('StudentHome') },
          { label: 'Buscar aulas', onPress: () => navigation.navigate('SearchProfessors') },
          { label: 'Agenda', onPress: handleViewAgenda },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accentPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient {...GRADIENTS.heroSection} style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.eyebrow}>Bem-vindo(a), {firstName}</Text>
              <Text style={styles.heroTitle}>Encontre seu professor ideal</Text>
              <Text style={styles.heroSubtitle}>
                Pesquise por matéria ou nome e veja rapidamente suas próximas aulas.
              </Text>
            </View>
            <View style={styles.searchBox}>
              <View style={styles.inputWrapper}>
                <Search size={18} color={COLORS.textSubtle} />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Matemática, inglês, música..."
                  placeholderTextColor={COLORS.textSubtle}
                  style={styles.input}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSearch}>
                <Text style={styles.primaryButtonText}>Pesquisar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas aulas</Text>
            <TouchableOpacity onPress={handleViewAgenda} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Ver agenda</Text>
            </TouchableOpacity>
          </View>
          {renderBookings()}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sugestões para você</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SearchProfessors')} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {renderOffers()}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSignOut} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const formatPrice = (offer: PublicTeacherClass) => {
  if (offer.priceCents !== null && offer.priceCents !== undefined) {
    return `R$ ${(offer.priceCents / 100).toFixed(2)}`;
  }
  if (offer.price !== null && offer.price !== undefined) {
    return `R$ ${Number(offer.price).toFixed(2)}`;
  }
  return 'Valor a combinar';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
  },
  heroContent: {
    gap: 14,
  },
  heroText: {
    gap: 6,
  },
  eyebrow: {
    color: COLORS.textSubtle,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: COLORS.heading,
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: COLORS.text,
    fontSize: 14,
  },
  searchBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.heading,
  },
  linkButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  linkButtonText: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  listColumn: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    color: COLORS.heading,
    fontWeight: '700',
    fontSize: 15,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingTime: {
    color: COLORS.text,
    fontWeight: '600',
  },
  bookingTitle: {
    color: COLORS.text,
    fontWeight: '700',
  },
  bookingTeacher: {
    color: COLORS.textSubtle,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.highlightSoft,
  },
  badgeText: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  offerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.heading,
    flex: 1,
  },
  offerModality: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentPrimary,
    marginLeft: 8,
  },
  offerSubject: {
    color: COLORS.text,
    fontWeight: '600',
  },
  offerDescription: {
    color: COLORS.textSubtle,
    fontSize: 13,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offerMetaText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  offerPrice: {
    color: COLORS.accentPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  stateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'flex-start',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateTitle: {
    color: COLORS.heading,
    fontWeight: '700',
    fontSize: 15,
  },
  stateSubtitle: {
    color: COLORS.textSubtle,
  },
  primaryButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    height: 110,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    opacity: 0.6,
  },
  offerSkeleton: {
    height: 130,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default StudentHomeScreen;
