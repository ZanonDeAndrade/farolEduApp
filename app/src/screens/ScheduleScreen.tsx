import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Clock, Sparkles } from 'lucide-react-native';
import Navbar from '../components/Navbar';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { GRADIENTS } from '../theme/gradients';
import { useAuth } from '../context/AuthContext';
import { createSchedule } from '../services/scheduleService';
import { z } from 'zod';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Schedule'>;

const scheduleSchema = z.object({
  date: z.string().min(1, 'Informe a data e horário (ISO ou 2025-12-01 14:00)'),
});

const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { teacherId, teacherName } = route.params;
  const { token } = useAuth();
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(15, 0, 0, 0);
    return now.toISOString().slice(0, 16).replace('T', ' ');
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedTeacher = useMemo(() => teacherName ?? 'professor', [teacherName]);

  const handleSubmit = useCallback(async () => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    const parsed = scheduleSchema.safeParse({ date });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Data inválida');
      return;
    }

    const normalizedDate = new Date(parsed.data.date.replace(' ', 'T'));
    if (Number.isNaN(normalizedDate.getTime())) {
      setError('Formato de data inválido. Use AAAA-MM-DD HH:mm');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createSchedule(token, {
        teacherId,
        date: normalizedDate.toISOString(),
      });
      setSuccess('Aula agendada com sucesso!');
    } catch (err) {
      console.error('Erro ao agendar:', err);
      setError('Não foi possível agendar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [date, navigation, teacherId, token]);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={40}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.icon}>
                <Sparkles size={18} color={COLORS.accentPrimary} />
              </View>
              <View>
                <Text style={styles.title}>Agendar aula</Text>
                <Text style={styles.subtitle}>com {formattedTeacher}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <CalendarDays size={18} color={COLORS.textSubtle} />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="2025-12-01 14:00"
                placeholderTextColor={COLORS.textSubtle}
                accessibilityLabel="Data e horário no formato AAAA-MM-DD HH:mm"
              />
            </View>
            <Text style={styles.helper}>Use o formato AAAA-MM-DD HH:mm (hora local).</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.buttonRow}>
                  <Clock size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Confirmar agendamento</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { padding: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.14)',
  },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.heading },
  subtitle: { color: COLORS.textSubtle, fontSize: 14 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  helper: { color: COLORS.textSubtle, fontSize: 12 },
  button: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
  error: { color: '#dc2626', fontWeight: '600' },
  success: { color: '#16a34a', fontWeight: '700' },
});

export default ScheduleScreen;
