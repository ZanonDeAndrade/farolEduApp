import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { SectionKey } from '../types';
import { headerStyles } from '../styles/headerStyles';
import { LOGO_IMAGE } from '../assets';
import { GRADIENTS } from '../../../theme/gradients';

export type HeaderSectionProps = {
  onNavigate: (key: SectionKey) => void;
  onLoginPress: () => void;
  onRegisterPress: () => void;
};

const HeaderSection: React.FC<HeaderSectionProps> = ({ onNavigate, onLoginPress, onRegisterPress }) => {
  return (
    <LinearGradient {...GRADIENTS.header} style={headerStyles.outer}>
      <View style={headerStyles.content}>
        <View style={headerStyles.logoWrapper}>
          <Image source={LOGO_IMAGE} style={headerStyles.logo} resizeMode="contain" />
          <Text style={headerStyles.title}>FarolEdu</Text>
        </View>

        <View style={headerStyles.navigation}>
          <TouchableOpacity onPress={() => onNavigate('inicio')} style={headerStyles.navLink}>
            <Text style={headerStyles.navLinkText}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('sobre')} style={headerStyles.navLink}>
            <Text style={headerStyles.navLinkText}>Sobre</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('oferecer-aula')} style={headerStyles.navLink}>
            <Text style={headerStyles.navLinkText}>Oferecer aula</Text>
          </TouchableOpacity>
        </View>

        <View style={headerStyles.ctas}>
          <TouchableOpacity style={headerStyles.ghostButton} onPress={onLoginPress}>
            <LinearGradient {...GRADIENTS.headerButtonGhost} style={headerStyles.ghostButtonGradient}>
              <Text style={headerStyles.ghostButtonText}>Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={headerStyles.primaryButton} onPress={onRegisterPress}>
            <LinearGradient {...GRADIENTS.headerButtonWarm} style={headerStyles.primaryButtonGradient}>
              <Text style={headerStyles.primaryButtonText}>Cadastrar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HeaderSection;
