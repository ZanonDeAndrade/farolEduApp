import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Wifi } from 'lucide-react-native';
import { availableStyles } from '../styles/availableStyles';
import { DEFAULT_SEARCH_FILTERS } from '../constants';
import type { SearchFilters, TeacherClassPreview } from '../types';
import { GRADIENTS } from '../../../theme/gradients';
import { COLORS } from '../../../theme/colors';
import {
  fetchPublicTeacherClasses,
  type PublicTeacherClass,
} from '../../../services/teacherClassService';

const mapToPreview = (entry: PublicTeacherClass): TeacherClassPreview => ({
  id: entry.id,
  title: entry.title,
  subject: entry.subject ?? undefined,
  description: entry.description ?? undefined,
  modality: entry.modality,
  price: entry.price ?? null,
  teacherName: entry.teacher?.name ?? undefined,
  city: entry.teacher?.profile?.city ?? entry.teacher?.profile?.region ?? undefined,
});

const formatModality = (value: string) => {
  switch (value) {
    case 'online':
      return 'Online';
    case 'home':
      return 'Na casa do professor';
    case 'travel':
      return 'Professor vai até você';
    case 'hybrid':
      return 'Modelo híbrido';
    default:
      return 'Presencial';
  }
};

type AvailableClassesSectionProps = {
  search?: SearchFilters;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const AvailableClassesSection: React.FC<AvailableClassesSectionProps> = ({ search, onLayout }) => {
  const appliedFilters = search ?? DEFAULT_SEARCH_FILTERS;
  const subjectLabel = appliedFilters.subject.trim();
  const locationLabel = appliedFilters.location.trim();

  const [classes, setClasses] = useState<TeacherClassPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const query = {
      q: appliedFilters.subject.trim() || undefined,
      city: appliedFilters.location.trim() || undefined,
      modality: appliedFilters.online ? 'online' : undefined,
      take: 12,
    };

    fetchPublicTeacherClasses(query)
      .then(data => {
        if (!isMounted) return;
        setClasses(data.map(mapToPreview));
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Erro ao buscar aulas públicas:', err);
        setError('Não foi possível carregar as aulas agora. Tente novamente em instantes.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [appliedFilters.location, appliedFilters.online, appliedFilters.subject]);

  const hasActiveFilters = useMemo(() => {
    return (
      subjectLabel.length > 0 ||
      locationLabel.length > 0 ||
      appliedFilters.online ||
      appliedFilters.nearby
    );
  }, [appliedFilters.nearby, appliedFilters.online, subjectLabel.length, locationLabel.length]);

  return (
    <LinearGradient {...GRADIENTS.availableBackground} style={availableStyles.container} onLayout={onLayout}>
      <Text style={availableStyles.title}>
        Aulas disponíveis <Text style={availableStyles.titleHighlight}>perto de você</Text>
      </Text>

      {hasActiveFilters ? (
        <View style={availableStyles.filtersSummary}>
          <Text style={availableStyles.filtersSummaryLabel}>Filtros em uso:</Text>
          {subjectLabel ? (
            <View style={availableStyles.filterPill}>
              <Text style={availableStyles.filterPillText}>Assunto · {subjectLabel}</Text>
            </View>
          ) : null}
          {locationLabel ? (
            <View style={availableStyles.filterPill}>
              <Text style={availableStyles.filterPillText}>Local · {locationLabel}</Text>
            </View>
          ) : null}
          {appliedFilters.nearby ? (
            <View style={[availableStyles.filterPill, availableStyles.filterPillHighlighted]}>
              <Text style={[availableStyles.filterPillText, availableStyles.filterPillTextInverted]}>Perto de mim</Text>
            </View>
          ) : null}
          {appliedFilters.online ? (
            <View style={[availableStyles.filterPill, availableStyles.filterPillHighlighted]}>
              <Text style={[availableStyles.filterPillText, availableStyles.filterPillTextInverted]}>Online</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {isLoading ? (
        <View style={availableStyles.loadingWrapper}>
          <ActivityIndicator color={COLORS.accentPrimary} size="small" />
          <Text style={availableStyles.loadingText}>Carregando aulas...</Text>
        </View>
      ) : error ? (
        <View style={availableStyles.emptyState}>
          <Text style={availableStyles.emptyStateTitle}>{error}</Text>
        </View>
      ) : classes.length === 0 ? (
        <View style={availableStyles.emptyState}>
          <Text style={availableStyles.emptyStateTitle}>Ainda não encontramos aulas com esse perfil.</Text>
          <Text style={availableStyles.emptyStateSubtitle}>
            Ajuste os filtros ou tente outro termo para descobrir novas oportunidades de aprendizado.
          </Text>
        </View>
      ) : (
        <View style={availableStyles.list}>
          {classes.map(item => (
            <TeacherCard key={item.id} teacher={item} />
          ))}
        </View>
      )}
    </LinearGradient>
  );
};

const TeacherCard: React.FC<{ teacher: TeacherClassPreview }> = ({ teacher }) => (
  <LinearGradient {...GRADIENTS.availableCard} style={availableStyles.card}>
    <View style={availableStyles.cardHeader}>
      <LinearGradient {...GRADIENTS.teacherAvatar} style={availableStyles.avatar}>
        <Text style={availableStyles.avatarText}>{(teacher.subject || teacher.title).charAt(0)}</Text>
      </LinearGradient>
      <View style={availableStyles.info}>
        <Text style={availableStyles.subject}>{teacher.subject || teacher.title}</Text>
        <Text style={availableStyles.level}>{formatModality(teacher.modality)}</Text>
        {teacher.description ? <Text style={availableStyles.description}>{teacher.description}</Text> : null}
      </View>
    </View>

    <View style={availableStyles.metaRow}>
      {teacher.city ? (
        <View style={availableStyles.metaItem}>
          <MapPin size={14} color={COLORS.accentPrimary} />
          <Text style={availableStyles.metaLocation}>{teacher.city}</Text>
        </View>
      ) : null}
      <View style={availableStyles.metaTags}>
        <View style={[availableStyles.metaTag, teacher.modality === 'online' && availableStyles.metaTagOnline]}>
          {teacher.modality === 'online' ? (
            <Wifi size={12} color={COLORS.white} />
          ) : (
            <MapPin size={12} color={COLORS.accentPrimary} />
          )}
          <Text
            style={[
              availableStyles.metaTagText,
              teacher.modality === 'online' ? availableStyles.metaTagTextInverted : undefined,
            ]}
          >
            {teacher.modality === 'online' ? 'Online' : 'Presencial'}
          </Text>
        </View>
      </View>
    </View>

    <View style={availableStyles.footer}>
      <View>
        {teacher.teacherName ? <Text style={availableStyles.teacherName}>Prof. {teacher.teacherName}</Text> : null}
        <Text style={availableStyles.teacherPrice}>
          {teacher.price !== null && teacher.price !== undefined
            ? `R$ ${Number(teacher.price).toFixed(2)}`
            : 'Valor a combinar'}
        </Text>
      </View>
      <TouchableOpacity style={availableStyles.actionWrapper}>
        <LinearGradient {...GRADIENTS.buttonSecondary} style={availableStyles.action}>
          <Text style={availableStyles.actionText}>Ver aula</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

export default AvailableClassesSection;
