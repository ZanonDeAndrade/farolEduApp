import React from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles, NotebookPen, CalendarRange, MonitorPlay, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { teacherStyles } from '../styles/teacherStyles';
import { COLORS } from '../../../theme/colors';
import { GRADIENTS } from '../../../theme/gradients';

export type TeacherSectionProps = {
  onLayout: (event: LayoutChangeEvent) => void;
  onRegisterPress: () => void;
};

const TeacherSection: React.FC<TeacherSectionProps> = ({ onLayout, onRegisterPress }) => {
  return (
    <LinearGradient {...GRADIENTS.teacherBackground} style={teacherStyles.container} onLayout={onLayout}>
      <View style={teacherStyles.copy}>
        <LinearGradient {...GRADIENTS.teacherEyebrow} style={teacherStyles.eyebrow}>
          <Sparkles size={16} color={COLORS.accentSecondary} />
          <Text style={teacherStyles.eyebrowText}>Transforme conhecimento em impacto real</Text>
        </LinearGradient>
        <Text style={teacherStyles.title}>
          É professor? <Text style={teacherStyles.titleHighlight}>Ofereça suas aulas no FarolEdu.</Text>
        </Text>
        <Text style={teacherStyles.description}>
          Crie seu perfil, defina disponibilidade, modalidades (online ou presencial) e receba solicitações de alunos
          que combinam com a sua experiência.
        </Text>

        <View style={teacherStyles.highlights}>
          <HighlightItem
            icon={<NotebookPen size={18} color={COLORS.accentPrimary} />}
            text="Perfil completo com portfólio, disciplinas e valores personalizados."
          />
          <HighlightItem
            icon={<CalendarRange size={18} color={COLORS.accentPrimary} />}
            text="Agenda inteligente para controlar horários e confirmar aulas."
          />
          <HighlightItem
            icon={<MonitorPlay size={18} color={COLORS.accentPrimary} />}
            text="Suporte a aulas híbridas com ferramentas digitais integradas."
          />
        </View>

        <TouchableOpacity style={teacherStyles.ctaWrapper} onPress={onRegisterPress}>
          <LinearGradient {...GRADIENTS.heroButton} style={teacherStyles.cta}>
            <Text style={teacherStyles.ctaText}>Cadastrar minha aula</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <LinearGradient {...GRADIENTS.teacherCard} style={teacherStyles.card}>
        <View style={teacherStyles.cardHeader}>
          <LinearGradient {...GRADIENTS.teacherAvatar} style={teacherStyles.cardAvatar}>
            <Text style={teacherStyles.cardAvatarText}>CM</Text>
          </LinearGradient>
          <View>
            <Text style={teacherStyles.cardName}>Camila Martins</Text>
            <Text style={teacherStyles.cardSubject}>Matemática & ENEM</Text>
          </View>
        </View>

        <View style={teacherStyles.cardBody}>
          <View style={teacherStyles.cardStat}>
            <ShieldCheck size={18} color={COLORS.accentSecondary} />
            <Text style={teacherStyles.cardStatText}>Perfil verificado</Text>
          </View>
          <Text style={teacherStyles.cardDescription}>
            +120 alunos aprovados no último ano com aulas online personalizadas.
          </Text>
        </View>

        <View style={teacherStyles.cardFooter}>
          <View>
            <Text style={teacherStyles.cardPrice}>R$ 65</Text>
            <Text style={teacherStyles.cardPriceCaption}>/hora</Text>
          </View>
          <TouchableOpacity style={teacherStyles.cardButtonWrapper}>
            <LinearGradient {...GRADIENTS.teacherButton} style={teacherStyles.cardButton}>
              <Text style={teacherStyles.cardButtonText}>Solicitar aula</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
};

const HighlightItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <LinearGradient {...GRADIENTS.teacherHighlight} style={teacherStyles.highlightBadge}>
    <View style={teacherStyles.highlightRow}>
      {icon}
      <Text style={teacherStyles.highlightText}>{text}</Text>
    </View>
  </LinearGradient>
);

export default TeacherSection;
