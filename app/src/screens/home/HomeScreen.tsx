import React, { useCallback, useMemo, useRef } from 'react';
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
import type { SectionKey } from './types';
import type { RootStackParamList } from '../../navigation/types';
import Navbar, { type NavbarLink } from '../../components/Navbar';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<SectionKey, number>>({
    inicio: 0,
    sobre: 0,
    'oferecer-aula': 0,
    rodape: 0,
  });

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

  const homeNavLinks = useMemo<NavbarLink[]>(
    () => [
      { label: 'Início', onPress: () => scrollToSection('inicio'), isActive: true },
      { label: 'Sobre', onPress: () => scrollToSection('sobre') },
      { label: 'Oferecer aula', onPress: () => scrollToSection('oferecer-aula') },
    ],
    [scrollToSection],
  );

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
        <HeroSection onLayout={handleSectionLayout('inicio')} />
        <AvailableClassesSection />
        <AboutSection onLayout={handleSectionLayout('sobre')} />
        <TeacherSection
          onLayout={handleSectionLayout('oferecer-aula')}
          onRegisterPress={() => navigation.navigate('Register')}
        />
        <FooterSection onLayout={handleSectionLayout('rodape')} onNavigate={scrollToSection} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
