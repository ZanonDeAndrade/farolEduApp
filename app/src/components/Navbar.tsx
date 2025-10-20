import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Menu, X } from 'lucide-react-native';
import { GRADIENTS } from '../theme/gradients';
import { COLORS } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { SectionKey } from '../screens/home/types';

const LOGO_IMAGE = require('../../assets/Logo.png');

type AppRouteName = keyof RootStackParamList;

type NavbarLink = {
  label: string;
  onPress: () => void;
  isActive?: boolean;
};

type NavbarProps = {
  links?: NavbarLink[];
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  showAuthButtons?: boolean;
  onNavigateSection?: (key: SectionKey) => void;
};

const DEFAULT_LINKS: ReadonlyArray<{ label: string; key?: SectionKey }> = [
  { label: 'Início', key: 'inicio' },
  { label: 'Sobre', key: 'sobre' },
  { label: 'Oferecer aula', key: 'oferecer-aula' },
];

const Navbar: React.FC<NavbarProps> = ({
  links,
  onLoginPress,
  onRegisterPress,
  showAuthButtons = true,
  onNavigateSection,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, AppRouteName>>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const derivedLinks = useMemo<NavbarLink[]>(() => {
    if (links && links.length > 0) {
      return links;
    }

    if (route.name === 'Home' && onNavigateSection) {
      return DEFAULT_LINKS.map(item => ({
        label: item.label,
        onPress: () => item.key && onNavigateSection(item.key),
      }));
    }

    return [
      {
        label: 'Início',
        isActive: route.name === 'Home',
        onPress: () => navigation.navigate('Home'),
      },
    ];
  }, [links, navigation, onNavigateSection, route.name]);

  const handleLogoPress = () => {
    if (route.name !== 'Home') {
      navigation.navigate('Home');
      return;
    }

    if (onNavigateSection) {
      onNavigateSection('inicio');
    }
  };

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleLinkPress = useCallback(
    (link: NavbarLink) => {
      closeMenu();
      link.onPress();
    },
    [closeMenu],
  );

  useEffect(() => {
    closeMenu();
  }, [closeMenu, route.name]);

  return (
    <LinearGradient {...GRADIENTS.header} style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogoPress}
          style={styles.brandWrapper}
        >
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {showAuthButtons && (
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onLoginPress}
              disabled={!onLoginPress}
              style={[styles.loginButton, !onLoginPress && styles.buttonDisabled]}
            >
              <LinearGradient
                {...GRADIENTS.headerButtonGhost}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Entrar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onRegisterPress}
              disabled={!onRegisterPress}
              style={[styles.registerButton, !onRegisterPress && styles.buttonDisabled]}
            >
              <LinearGradient
                {...GRADIENTS.headerButtonWarm}
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {derivedLinks.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleMenu}
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel={isMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            accessibilityState={{ expanded: isMenuOpen }}
          >
            {isMenuOpen ? <X color="#4338CA" size={22} /> : <Menu color="#4338CA" size={22} />}
          </TouchableOpacity>
        )}
      </View>

      <Modal transparent animationType="fade" visible={isMenuOpen} onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <LinearGradient {...GRADIENTS.header} style={styles.menuCard}>
                {derivedLinks.map(link => (
                  <TouchableOpacity
                    key={link.label}
                    onPress={() => handleLinkPress(link)}
                    activeOpacity={0.75}
                    style={[styles.menuItem, link.isActive && styles.menuItemActive]}
                  >
                    <Text style={[styles.menuItemText, link.isActive && styles.menuItemTextActive]}>
                      {link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </LinearGradient>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 113, 198, 0.16)',
    shadowColor: 'rgba(17, 24, 39, 0.08)',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    flexWrap: 'wrap',
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  loginButton: {
    minWidth: 90,
    borderRadius: 999,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.heading,
    fontWeight: '600',
  },
  registerButton: {
    minWidth: 130,
    borderRadius: 999,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    paddingHorizontal: 24,
    paddingTop: 96,
    alignItems: 'flex-end',
  },
  menuCard: {
    width: 220,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    shadowColor: 'rgba(15, 23, 42, 0.2)',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
    gap: 8,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.heading,
  },
  menuItemTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});

export type { NavbarLink };
export default Navbar;
