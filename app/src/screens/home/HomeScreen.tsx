import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { layoutStyles } from './styles/layoutStyles';
import HeroSection from './components/HeroSection';
import AvailableClassesSection from './components/AvailableClassesSection';
import AboutSection from './components/AboutSection';
import TeacherSection from './components/TeacherSection';
import FooterSection from './components/FooterSection';
import { DEFAULT_SEARCH_FILTERS } from './constants';
import type { SearchFilters, SectionKey } from './types';
import type { RootStackParamList } from '../../navigation/types';
import Navbar, { type NavbarLink } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<SectionKey, number>>({
    inicio: 0,
    aulas: 0,
    sobre: 0,
    'oferecer-aula': 0,
    rodape: 0,
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const { profile, isRestoring } = useAuth();

  const isTeacher = useMemo(() => {
    if (!profile || typeof profile !== 'object') return false;
    const role = (profile as { role?: string }).role;
    return (role || '').toLowerCase() === 'teacher';
  }, [profile]);
  const isStudent = useMemo(() => {
    if (!profile || typeof profile !== 'object') return false;
    const role = (profile as { role?: string }).role;
    return (role || '').toLowerCase() === 'student';
  }, [profile]);

  useEffect(() => {
    if (isRestoring) return;
    if (isStudent) {
      navigation.replace('StudentHome');
    }
  }, [isRestoring, isStudent, navigation]);

  const handleSectionLayout = useCallback(
    (key: SectionKey) => (event: LayoutChangeEvent) => {
      sectionPositions.current[key] = event.nativeEvent.layout.y;
    },
    [],
  );

  const scrollToSection = useCallback(
    (key: SectionKey) => {
      const position = sectionPositions.current[key];
      if (typeof position === 'number') {
        scrollRef.current?.scrollTo({ y: Math.max(position - 24, 0), animated: true });
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      setSearchFilters({ ...filters });
      scrollToSection('aulas');
    },
    [scrollToSection],
  );

  const homeNavLinks = useMemo<NavbarLink[]>(
    () => {
      const links: NavbarLink[] = [
        { label: 'Início', onPress: () => scrollToSection('inicio'), isActive: true },
        { label: 'Sobre', onPress: () => scrollToSection('sobre') },
      ];
      if (!isStudent) {
        links.push({ label: 'Oferecer aula', onPress: () => scrollToSection('oferecer-aula') });
      }
      return links;
    },
    [isStudent, scrollToSection],
  );

  const handleTeacherCTA = useCallback(() => {
    if (isTeacher) {
      navigation.navigate('TeacherDashboard');
      return;
    }
    navigation.navigate('Register');
  }, [isTeacher, navigation]);

  return (
    <SafeAreaView style={layoutStyles.safeArea}>
      <Navbar
        links={homeNavLinks}
        onNavigateSection={scrollToSection}
        onLoginPress={() => navigation.navigate('Login')}
        onRegisterPress={() => navigation.navigate('Register')}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={layoutStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection onLayout={handleSectionLayout('inicio')} onSearch={handleSearch} initialSearch={searchFilters} />
        <AvailableClassesSection onLayout={handleSectionLayout('aulas')} search={searchFilters} />
        <AboutSection onLayout={handleSectionLayout('sobre')} />
        {!isStudent && (
          <TeacherSection
            onLayout={handleSectionLayout('oferecer-aula')}
            onRegisterPress={handleTeacherCTA}
          />
        )}
        <FooterSection onLayout={handleSectionLayout('rodape')} onNavigate={scrollToSection} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
