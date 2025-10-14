import React from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { Compass, Users, ShieldCheck, Clock3, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { aboutStyles } from '../styles/aboutStyles';
import { COLORS } from '../../../theme/colors';
import { ABOUT_STATS } from '../constants';
import { GRADIENTS } from '../../../theme/gradients';

export type AboutSectionProps = {
  onLayout: (event: LayoutChangeEvent) => void;
};

const AboutSection: React.FC<AboutSectionProps> = ({ onLayout }) => {
  return (
    <LinearGradient {...GRADIENTS.aboutBackground} style={aboutStyles.container} onLayout={onLayout}>
      <View style={aboutStyles.intro}>
        <LinearGradient {...GRADIENTS.aboutEyebrow} style={aboutStyles.eyebrow}>
          <Compass size={16} color={COLORS.accentPrimary} />
          <Text style={aboutStyles.eyebrowText}>Sobre o FarolEdu</Text>
        </LinearGradient>
        <Text style={aboutStyles.title}>Um ecossistema feito para conectar pessoas que ensinam e aprendem.</Text>
        <Text style={aboutStyles.subtitle}>
          Apoiamos professores independentes e instituições locais a construírem experiências de ensino inspiradoras,
          enquanto estudantes encontram caminhos personalizados para evoluir rápido.
        </Text>

        <View style={aboutStyles.stats}>
          {ABOUT_STATS.map(stat => (
            <LinearGradient key={stat.value} {...GRADIENTS.statPill} style={aboutStyles.stat}>
              <Text style={aboutStyles.statValue}>{stat.value}</Text>
              <Text style={aboutStyles.statLabel}>{stat.label}</Text>
            </LinearGradient>
          ))}
        </View>
      </View>

      <View style={aboutStyles.cards}>
        <AboutCard
          icon={<Users size={20} color={COLORS.accentPrimary} />}
          title="Foco na relação humana"
          description="Sugerimos o melhor encontro entre aluno e professor, priorizando afinidade, objetivos e ritmo de aprendizagem."
        />
        <AboutCard
          icon={<ShieldCheck size={20} color={COLORS.accentPrimary} />}
          title="Segurança e qualidade"
          description="Perfis verificados, avaliações recorrentes e suporte dedicado garantem aulas confiáveis em qualquer modalidade."
        />
        <AboutCard
          icon={<Clock3 size={20} color={COLORS.accentPrimary} />}
          title="Flexibilidade real"
          description="Agenda inteligente, aulas presenciais ou online e pacotes personalizados que se encaixam na rotina de cada pessoa."
        />
        <AboutCard
          icon={<Award size={20} color={COLORS.accentPrimary} />}
          title="Resultados comprovados"
          description="Programas especiais para vestibulares, certificações e desenvolvimento profissional com acompanhamento próximo."
        />
      </View>
    </LinearGradient>
  );
};

const AboutCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <LinearGradient {...GRADIENTS.aboutCard} style={aboutStyles.card}>
    <LinearGradient {...GRADIENTS.aboutCardIcon} style={aboutStyles.cardIcon}>
      {icon}
    </LinearGradient>
    <Text style={aboutStyles.cardTitle}>{title}</Text>
    <Text style={aboutStyles.cardDescription}>{description}</Text>
  </LinearGradient>
);

export default AboutSection;
