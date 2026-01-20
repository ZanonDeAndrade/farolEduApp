import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import SearchProfessorsScreen from '../screens/SearchProfessorsScreen';
import ProfessorDetailScreen from '../screens/ProfessorDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ScheduledClassesScreen from '../screens/ScheduledClassesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import type { RootStackParamList } from './types';
import StudentNavigator from './StudentNavigator';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

enableScreens();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7F9FC',
  },
};

const AppNavigator: React.FC = () => {
  const { profile, isRestoring } = useAuth();
  const role = (profile as { role?: string } | null)?.role?.toLowerCase?.() ?? '';
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const initialRoute = isStudent ? 'StudentHome' : isTeacher ? 'TeacherDashboard' : 'Home';
  const navigatorKey = isStudent ? 'student-stack' : isTeacher ? 'teacher-stack' : 'public-stack';

  if (isRestoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: navigationTheme.colors.background }}>
        <ActivityIndicator size="large" color="#6A40B4" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator key={navigatorKey} initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StudentHome" component={StudentNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
        <Stack.Screen name="SearchProfessors" component={SearchProfessorsScreen} />
        <Stack.Screen name="ProfessorDetail" component={ProfessorDetailScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="ScheduledClasses" component={ScheduledClassesScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
