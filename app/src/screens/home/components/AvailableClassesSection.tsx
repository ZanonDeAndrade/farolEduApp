import React, { useMemo } from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Wifi } from 'lucide-react-native';
import { availableStyles } from '../styles/availableStyles';
import { DEFAULT_SEARCH_FILTERS, TEACHERS } from '../constants';
import type { SearchFilters, Teacher } from '../types';
import { GRADIENTS } from '../../../theme/gradients';
import { COLORS } from '../../../theme/colors';

type AvailableClassesSectionProps = {
  search?: SearchFilters;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const matchText = (value: string | undefined, query: string) => {
  if (!query) {
    return true;
  }

  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
};

const AvailableClassesSection: React.FC<AvailableClassesSectionProps> = ({ search, onLayout }) => {
  const appliedFilters = search ?? DEFAULT_SEARCH_FILTERS;
  const subjectLabel = appliedFilters.subject.trim();
  const locationLabel = appliedFilters.location.trim();

  const filteredTeachers = useMemo(() => {
    const normalizedSubject = subjectLabel.toLowerCase();
    const normalizedLocation = locationLabel.toLowerCase();

    return TEACHERS.filter(teacher => {
      const matchesSubject =
        !normalizedSubject ||
        matchText(teacher.subject, normalizedSubject) ||
        matchText(teacher.description, normalizedSubject) ||
        matchText(teacher.name, normalizedSubject);

      const matchesLocation =
        !normalizedLocation ||
        matchText(teacher.city, normalizedLocation) ||
        (normalizedLocation === 'online' && teacher.modalities?.includes('online'));

      const matchesNearby =
        !appliedFilters.nearby || (teacher.distanceKm ?? Number.POSITIVE_INFINITY) <= 20 || normalizedLocation.length > 0;

      const matchesOnline = !appliedFilters.online || teacher.modalities?.includes('online');

      return matchesSubject && matchesLocation && matchesNearby && matchesOnline;
    });
  }, [appliedFilters.location, appliedFilters.nearby, appliedFilters.online, appliedFilters.subject]);

  const hasActiveFilters =
    subjectLabel.length > 0 ||
    locationLabel.length > 0 ||
    appliedFilters.online ||
    appliedFilters.nearby;

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

      {filteredTeachers.length === 0 ? (
        <View style={availableStyles.emptyState}>
          <Text style={availableStyles.emptyStateTitle}>Ainda não encontramos aulas com esse perfil.</Text>
          <Text style={availableStyles.emptyStateSubtitle}>
            Ajuste os filtros ou tente outro termo para descobrir novas oportunidades de aprendizado.
          </Text>
        </View>
      ) : (
        <View style={availableStyles.list}>
          {filteredTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </View>
      )}
    </LinearGradient>
  );
};

const TeacherCard: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <LinearGradient {...GRADIENTS.availableCard} style={availableStyles.card}>
    <View style={availableStyles.cardHeader}>
      <LinearGradient {...GRADIENTS.teacherAvatar} style={availableStyles.avatar}>
        <Text style={availableStyles.avatarText}>{teacher.subject.charAt(0)}</Text>
      </LinearGradient>
      <View style={availableStyles.info}>
        <Text style={availableStyles.subject}>{teacher.subject}</Text>
        {teacher.level ? <Text style={availableStyles.level}>{teacher.level}</Text> : null}
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
        {teacher.modalities?.map(mode => (
          <View key={mode} style={[availableStyles.metaTag, mode === 'online' && availableStyles.metaTagOnline]}>
            {mode === 'online' ? (
              <Wifi size={12} color={COLORS.white} />
            ) : (
              <MapPin size={12} color={COLORS.accentPrimary} />
            )}
            <Text
              style={[
                availableStyles.metaTagText,
                mode === 'online' ? availableStyles.metaTagTextInverted : undefined,
              ]}
            >
              {mode === 'online' ? 'Online' : 'Presencial'}
            </Text>
          </View>
        ))}
        {typeof teacher.distanceKm === 'number' ? (
          <View style={availableStyles.metaBadge}>
            <Text style={availableStyles.metaBadgeText}>{teacher.distanceKm} km</Text>
          </View>
        ) : null}
      </View>
    </View>

    <View style={availableStyles.footer}>
      <Text style={availableStyles.teacherName}>Prof. {teacher.name}</Text>
      <TouchableOpacity style={availableStyles.actionWrapper}>
        <LinearGradient {...GRADIENTS.buttonSecondary} style={availableStyles.action}>
          <Text style={availableStyles.actionText}>Ver aula</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

export default AvailableClassesSection;
