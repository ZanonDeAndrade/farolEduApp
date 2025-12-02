import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Navbar from '../components/Navbar';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { fetchSchedules, type Schedule } from '../services/scheduleService';
import { useAuth } from '../context/AuthContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const ScheduledClassesScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { token } = useAuth();
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
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        );
      })
      .catch(err => {
        console.error('Erro ao buscar agenda:', err);
        if (!mounted) return;
        setError('Não foi possível carregar seus agendamentos.');
      })
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [navigation, token]);

  return (
    <View style={styles.container}>
      <Navbar
        links={[
          { label: 'Início', onPress: () => navigation.navigate('Home') },
          { label: 'Agenda', onPress: () => {} },
        ]}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Minha agenda</Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.accentPrimary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Nenhuma aula agendada.</Text>
          </View>
        ) : (
          items.map(item => {
            const date = new Date(item.date);
            const partner = item.student ?? item.teacher;
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
                <Text style={styles.time}>
                  {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {partner ? <Text style={styles.partner}>{partner.name}</Text> : null}
                {partner?.email ? <Text style={styles.email}>{partner.email}</Text> : null}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  time: { color: COLORS.text, fontWeight: '600' },
  partner: { color: COLORS.text },
  email: { color: COLORS.textSubtle, fontSize: 12 },
});

export default ScheduledClassesScreen;
