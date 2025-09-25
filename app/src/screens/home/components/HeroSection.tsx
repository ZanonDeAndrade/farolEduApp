import React, { useCallback, useState } from 'react';
import { Image, LayoutChangeEvent, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Sparkles,
  Search,
  MapPin,
  Wifi,
  GraduationCap,
  Users,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { heroStyles } from '../styles/heroStyles';
import { COLORS } from '../../../theme/colors';
import { HERO_IMAGE } from '../assets';
import { HERO_COPY } from '../constants';
import { GRADIENTS } from '../../../theme/gradients';

export type HeroSectionProps = {
  onLayout: (event: LayoutChangeEvent) => void;
};

type FilterKey = 'nearby' | 'online';

const HighlightData = [
  { id: 'cities', text: HERO_COPY.highlights[0], icon: <Sparkles size={18} color={COLORS.accentWarmAlt} /> },
  { id: 'subjects', text: HERO_COPY.highlights[1], icon: <GraduationCap size={18} color={COLORS.accentPrimary} /> },
  { id: 'custom', text: HERO_COPY.highlights[2], icon: <Users size={18} color={COLORS.accentSecondary} /> },
];

const HeroSection: React.FC<HeroSectionProps> = ({ onLayout }) => {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({ nearby: true, online: false });

  const toggleFilter = useCallback((key: FilterKey) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSearch = useCallback(() => {
    console.log('Busca FarolEdu', { subject, location, filters });
  }, [subject, location, filters]);

  return (
    <View style={heroStyles.section} onLayout={onLayout}>
      <LinearGradient {...GRADIENTS.heroSection} style={heroStyles.sectionGradient} />

      <View style={heroStyles.cardWrapper}>
        <LinearGradient {...GRADIENTS.heroCard} style={heroStyles.cardBackground} />

        <View style={heroStyles.cardContent}>
          <View style={heroStyles.copyColumn}>
            <LinearGradient {...GRADIENTS.heroEyebrow} style={heroStyles.eyebrow}>
              <Sparkles size={16} color={COLORS.accentHighlight} />
              <Text style={heroStyles.eyebrowText}>{HERO_COPY.eyebrow}</Text>
            </LinearGradient>

            <Text style={heroStyles.title}>
              {HERO_COPY.title}{' '}
              <Text style={heroStyles.titleHighlight}>{HERO_COPY.titleHighlight}</Text>.
            </Text>

            <Text style={heroStyles.subtitle}>{HERO_COPY.subtitle}</Text>

            <View style={heroStyles.highlightList}>
              {HighlightData.map(item => (
                <View key={item.id} style={heroStyles.highlightRow}>
                  <LinearGradient {...GRADIENTS.heroHighlightIcon} style={heroStyles.highlightIcon}>
                    {item.icon}
                  </LinearGradient>
                  <Text style={heroStyles.highlightText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <LinearGradient {...GRADIENTS.heroForm} style={heroStyles.form}>
              <View style={heroStyles.field}>
                <Search size={18} color={COLORS.accentPrimary} />
                <TextInput
                  value={subject}
                  placeholder={HERO_COPY.placeholders.subject}
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={setSubject}
                  style={heroStyles.input}
                />
              </View>

              <View style={heroStyles.field}>
                <MapPin size={18} color={COLORS.accentPrimary} />
                <TextInput
                  value={location}
                  placeholder={HERO_COPY.placeholders.location}
                  placeholderTextColor={COLORS.textMuted}
                  onChangeText={setLocation}
                  style={heroStyles.input}
                />
              </View>

              <TouchableOpacity style={heroStyles.submitWrapper} onPress={handleSearch}>
                <LinearGradient {...GRADIENTS.heroButton} style={heroStyles.submitButton}>
                  <Text style={heroStyles.submitText}>{HERO_COPY.cta}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            <View style={heroStyles.filters}>
              <FilterChip
                label={HERO_COPY.filters.nearby}
                isActive={filters.nearby}
                onPress={() => toggleFilter('nearby')}
                icon={<MapPin size={16} color={filters.nearby ? COLORS.white : COLORS.accentPrimary} />}
              />
              <FilterChip
                label={HERO_COPY.filters.online}
                isActive={filters.online}
                onPress={() => toggleFilter('online')}
                icon={<Wifi size={16} color={filters.online ? COLORS.white : COLORS.accentPrimary} />}
              />
            </View>
          </View>

          <View style={heroStyles.visualColumn}>
            <LinearGradient {...GRADIENTS.heroImageCard} style={heroStyles.visualCard}>
              <Image source={HERO_IMAGE} style={heroStyles.visualImage} resizeMode="contain" />
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
};

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon: React.ReactNode;
};

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress, icon }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={heroStyles.chipTouchable}>
      {isActive ? (
        <LinearGradient {...GRADIENTS.heroFilterActive} style={[heroStyles.chipFill, heroStyles.chipFillActive]}>
          <View style={heroStyles.chipContent}>
            {icon}
            <Text style={[heroStyles.chipText, heroStyles.chipTextActive]}>{label}</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={[heroStyles.chipFill, heroStyles.chipFillInactive]}>
          <View style={heroStyles.chipContent}>
            {icon}
            <Text style={heroStyles.chipText}>{label}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default HeroSection;
