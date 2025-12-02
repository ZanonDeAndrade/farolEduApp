import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { MapPin, Phone, Sparkles } from 'lucide-react-native';
import Navbar from '../components/Navbar';
import type { RootStackParamList } from '../navigation/types';
import { fetchPublicTeacher, type PublicTeacher } from '../services/professorService';
import { COLORS } from '../theme/colors';
import { GRADIENTS } from '../theme/gradients';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProfessorDetail'>;

const ProfessorDetailScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { teacherId } = route.params;
  const { token } = useAuth();
  const [teacher, setTeacher] = useState<PublicTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    fetchPublicTeacher(teacherId)
      .then(data => {
        if (!mounted) return;
        setTeacher(data);
      })
      .catch(err => {
        console.error('Erro ao buscar professor:', err);
        if (!mounted) return;
        setError('Não foi possível carregar o perfil do professor.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [teacherId]);

  const location = useMemo(() => {
    if (!teacher?.teacherProfile) return 'Local não informado';
    return teacher.teacherProfile.city || teacher.teacherProfile.region || 'Local não informado';
  }, [teacher]);

  return (
    <LinearGradient {...GRADIENTS.screenBackground} style={styles.gradient}>
      <Navbar
        links={[
          { label: 'Início', onPress: () => navigation.navigate('Home') },
          { label: 'Encontrar aulas', onPress: () => navigation.navigate('SearchProfessors') },
        ]}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.accentPrimary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : teacher ? (
          <>
            <View style={styles.header}>
              <LinearGradient {...GRADIENTS.heroHighlightIcon} style={styles.avatar}>
                <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.title}>{teacher.name}</Text>
                <Text style={styles.subtitle}>{teacher.teacherProfile?.experience || 'Professor'}</Text>
                <View style={styles.metaRow}>
                  <MapPin size={14} color={COLORS.accentPrimary} />
                  <Text style={styles.metaText}>{location}</Text>
                </View>
                {teacher.teacherProfile?.phone ? (
                  <View style={styles.metaRow}>
                    <Phone size={14} color={COLORS.accentPrimary} />
                    <Text style={styles.metaText}>{teacher.teacherProfile.phone}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.cta}
              onPress={() =>
                token
                  ? navigation.navigate('Schedule', { teacherId, teacherName: teacher.name })
                  : navigation.navigate('Login')
              }
              activeOpacity={0.9}
              accessibilityRole="button"
            >
              <Text style={styles.ctaText}>Agendar aula com {teacher.name.split(' ')[0]}</Text>
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aulas oferecidas</Text>
              {teacher.classes && teacher.classes.length ? (
                teacher.classes.map(cls => (
                  <View key={cls.id} style={styles.classCard}>
                    <View style={styles.classHeader}>
                      <Text style={styles.classTitle}>{cls.title}</Text>
                      <Text style={styles.modality}>{cls.modality}</Text>
                    </View>
                    {cls.subject ? <Text style={styles.classSubject}>{cls.subject}</Text> : null}
                    {cls.description ? (
                      <Text style={styles.classDescription} numberOfLines={3}>
                        {cls.description}
                      </Text>
                    ) : null}
                    <View style={styles.classFooter}>
                      <Text style={styles.classDuration}>{cls.durationMinutes} min</Text>
                      <Text style={styles.classPrice}>
                        {cls.price !== null && cls.price !== undefined
                          ? `R$ ${Number(cls.price).toFixed(2)}`
                          : 'Valor a combinar'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>Nenhuma aula cadastrada ainda.</Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 18, gap: 12 },
  center: { padding: 20, alignItems: 'center' },
  error: { color: COLORS.text, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.14)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.heading },
  subtitle: { fontSize: 14, color: COLORS.textSubtle },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: COLORS.text, fontSize: 13 },
  cta: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  classCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: { fontSize: 15, fontWeight: '700', color: COLORS.heading },
  modality: { fontSize: 12, fontWeight: '700', color: COLORS.accentPrimary },
  classSubject: { color: COLORS.text, fontWeight: '600' },
  classDescription: { color: COLORS.textSubtle, fontSize: 13 },
  classFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  classDuration: { color: COLORS.text, fontWeight: '600' },
  classPrice: { color: COLORS.accentPrimary, fontWeight: '700' },
  muted: { color: COLORS.textSubtle },
});

export default ProfessorDetailScreen;
