import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StudentStackParamList } from './types';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import SearchProfessorsScreen from '../screens/SearchProfessorsScreen';
import ProfessorDetailScreen from '../screens/ProfessorDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ScheduledClassesScreen from '../screens/ScheduledClassesScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="StudentHome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="SearchProfessors" component={SearchProfessorsScreen} />
      <Stack.Screen name="ProfessorDetail" component={ProfessorDetailScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="ScheduledClasses" component={ScheduledClassesScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
