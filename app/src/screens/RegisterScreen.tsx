import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegisterScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Cadastro (em desenvolvimento)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
  },
  text: {
    fontSize: 18,
    color: '#1E2338',
  },
});

export default RegisterScreen;
