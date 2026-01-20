import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Navbar from '../components/Navbar';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { fetchSchedules, type Schedule } from '../services/scheduleService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Grouped = Record<string, Schedule[]>;

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { token, signOut } = useAuth();
  const [items, setItems] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    setIsLoading(true);
    setError(null);

    fetchSchedules(token)
      .then(data => {
        if (!mounted) return;
        setItems(
          (data ?? []).sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          ),
        );
      })
      .catch(err => {
        console.error('Erro ao carregar calendÇürio:', err);
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 401) {
          setError('SessÇœo expirada. Entre novamente.');
          signOut().finally(() => navigation.navigate('Login'));
          return;
        }
        setError('NÇœo foi possÇðvel carregar o calendÇürio.');
      })
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [navigation, signOut, token]);

  const grouped = useMemo(() => {
    return items.reduce<Grouped>((acc, booking) => {
      const key = new Date(booking.startTime).toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    }, {});
  }, [items]);

  const orderedDays = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  return (
    <View style={styles.container}>
      <Navbar
        links={[
          { label: 'InÇðcio', onPress: () => navigation.navigate('Home') },
          { label: 'CalendÇürio', onPress: () => {} },
        ]}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>CalendÇürio</Text>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.accentPrimary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : orderedDays.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Nenhuma aula agendada.</Text>
          </View>
        ) : (
          orderedDays.map(day => {
            const bookings = grouped[day];
            return (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>
                  {new Date(day).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
                {bookings.map(item => {
                  const start = new Date(item.startTime);
                  const partner = item.student ?? item.teacher;
                  return (
                    <View key={item.id} style={styles.bookingRow}>
                      <View style={styles.timeBlock}>
                        <Text style={styles.timeText}>
                          {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={styles.status}>{(item.status || 'PENDING').toUpperCase()}</Text>
                      </View>
                      <View style={styles.bookingDetails}>
                        <Text style={styles.bookingTitle}>{item.offer?.title ?? 'Aula'}</Text>
                        {partner ? <Text style={styles.partner}>{partner.name}</Text> : null}
                        {partner?.email ? <Text style={styles.email}>{partner.email}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.heading },
  center: { alignItems: 'center', padding: 20 },
  muted: { color: COLORS.textSubtle },
  error: { color: '#dc2626', fontWeight: '700' },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  dayTitle: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  bookingRow: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeBlock: { minWidth: 76, alignItems: 'flex-start', gap: 4 },
  timeText: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  status: {
    fontSize: 11,
    color: COLORS.accentPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingDetails: { flex: 1, gap: 4 },
  bookingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.heading },
  partner: { color: COLORS.text },
  email: { color: COLORS.textSubtle, fontSize: 12 },
});

export default CalendarScreen;
