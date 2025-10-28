import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isCompact = width < 640;

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

  const renderInlineActions = showAuthButtons && !isCompact;
  const renderMenuAuthActions = showAuthButtons && isCompact;
  const shouldRenderMenuButton = derivedLinks.length > 0 || renderMenuAuthActions;

  return (
    <LinearGradient {...GRADIENTS.header} style={styles.container}>
      <View style={[styles.content, isCompact && styles.contentCompact]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogoPress}
          style={styles.brandWrapper}
        >
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {renderInlineActions && (
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

        {shouldRenderMenuButton && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleMenu}
            style={[styles.menuButton, isCompact && styles.menuButtonCompact]}
            accessibilityRole="button"
            accessibilityLabel={isMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            accessibilityState={{ expanded: isMenuOpen }}
          >
            {isMenuOpen ? (
              <X color={COLORS.accentPrimary} size={22} />
            ) : (
              <Menu color={COLORS.accentPrimary} size={22} />
            )}
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

                {renderMenuAuthActions && (
                  <View style={styles.menuActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        closeMenu();
                        onLoginPress?.();
                      }}
                      style={styles.menuActionButton}
                      disabled={!onLoginPress}
                    >
                      <Text style={styles.menuActionText}>Entrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        closeMenu();
                        onRegisterPress?.();
                      }}
                      style={[styles.menuActionButton, styles.menuActionPrimary]}
                      disabled={!onRegisterPress}
                    >
                      <Text style={[styles.menuActionText, styles.menuActionPrimaryText]}>Cadastrar</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    borderBottomColor: 'rgba(106, 64, 180, 0.18)',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(88, 48, 156, 0.12)',
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
  contentCompact: {
    gap: 10,
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
    borderColor: 'rgba(106, 64, 180, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  menuButtonCompact: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    borderColor: 'rgba(106, 64, 180, 0.18)',
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
    backgroundColor: 'rgba(31, 37, 71, 0.4)',
    paddingHorizontal: 24,
    paddingTop: 96,
    alignItems: 'flex-end',
  },
  menuCard: {
    width: 240,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.18)',
    shadowColor: 'rgba(88, 48, 156, 0.24)',
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
    backgroundColor: 'rgba(106, 64, 180, 0.16)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.heading,
  },
  menuItemTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  menuActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 64, 180, 0.16)',
    gap: 10,
  },
  menuActionButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 64, 180, 0.18)',
    backgroundColor: 'rgba(228, 236, 255, 0.75)',
    alignItems: 'center',
  },
  menuActionPrimary: {
    backgroundColor: '#6A40B4',
    borderColor: 'transparent',
    shadowColor: 'rgba(106, 64, 180, 0.22)',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuActionPrimaryText: {
    color: COLORS.white,
  },
});

export type { NavbarLink };
export default Navbar;
