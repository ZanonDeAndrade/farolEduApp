import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { availableStyles } from '../styles/availableStyles';
import { TEACHERS } from '../constants';
import type { Teacher } from '../types';
import { GRADIENTS } from '../../../theme/gradients';

const AvailableClassesSection: React.FC = () => {
  return (
    <LinearGradient {...GRADIENTS.availableBackground} style={availableStyles.container}>
      <Text style={availableStyles.title}>
        Aulas disponíveis <Text style={availableStyles.titleHighlight}>perto de você</Text>
      </Text>

      <View style={availableStyles.list}>
        {TEACHERS.map(teacher => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </View>
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
