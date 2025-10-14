import React, { useCallback } from 'react';
import { LayoutChangeEvent, Linking, Text, TouchableOpacity, View, Image } from 'react-native';
import { Linkedin, Instagram, Youtube } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { footerStyles } from '../styles/footerStyles';
import { COLORS } from '../../../theme/colors';
import type { SectionKey } from '../types';
import { LOGO_IMAGE } from '../assets';
import { GRADIENTS } from '../../../theme/gradients';

export type FooterSectionProps = {
  onLayout: (event: LayoutChangeEvent) => void;
  onNavigate: (key: SectionKey) => void;
};

const FooterSection: React.FC<FooterSectionProps> = ({ onLayout, onNavigate }) => {
  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      /* no-op */
    });
  }, []);

  return (
    <LinearGradient {...GRADIENTS.footer} style={footerStyles.container} onLayout={onLayout}>
      <View style={footerStyles.content}>
        <View style={footerStyles.brand}>
          <LinearGradient {...GRADIENTS.footerSocial} style={footerStyles.logoPill}>
            <Image source={LOGO_IMAGE} style={footerStyles.logo} resizeMode="contain" />
          </LinearGradient>
          <Text style={footerStyles.slogan}>
            Conectando alunos e professores com experiências de aprendizado personalizadas.
          </Text>
        </View>

        <View style={footerStyles.linksWrapper}>
          <View style={footerStyles.links}>
            <FooterLink label="Início" onPress={() => onNavigate('inicio')} />
            <FooterLink label="Oferecer aula" onPress={() => onNavigate('oferecer-aula')} />
            <FooterLink label="Sobre" onPress={() => onNavigate('sobre')} />
            <FooterLink label="Contato" onPress={() => openLink('mailto:contato@faroledu.com')} />
          </View>

          <View style={footerStyles.social}>
            <TouchableOpacity onPress={() => openLink('https://www.linkedin.com')} style={footerStyles.socialButton}>
              <LinearGradient {...GRADIENTS.footerSocial} style={footerStyles.socialButtonInner}>
                <Linkedin size={20} color={COLORS.footerText} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://www.instagram.com')} style={footerStyles.socialButton}>
              <LinearGradient {...GRADIENTS.footerSocial} style={footerStyles.socialButtonInner}>
                <Instagram size={20} color={COLORS.footerText} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('https://www.youtube.com')} style={footerStyles.socialButton}>
              <LinearGradient {...GRADIENTS.footerSocial} style={footerStyles.socialButtonInner}>
                <Youtube size={20} color={COLORS.footerText} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={footerStyles.bottom}>
        <Text style={footerStyles.copy}>© {new Date().getFullYear()} FarolEdu. Todos os direitos reservados.</Text>
        <View style={footerStyles.legal}>
          <FooterLink label="Política de privacidade" onPress={() => openLink('https://faroledu.com/politica')} />
          <FooterLink label="Termos de uso" onPress={() => openLink('https://faroledu.com/termos')} />
        </View>
      </View>
    </LinearGradient>
  );
};

const FooterLink: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={footerStyles.linkText}>{label}</Text>
  </TouchableOpacity>
);

export default FooterSection;
