import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLogin && styles.activeButton]}
        onPress={() => onToggle(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, isLogin && styles.activeText]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !isLogin && styles.activeButton]}
        onPress={() => onToggle(false)}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, !isLogin && styles.activeText]}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#7A8374', 
    borderRadius: 30,
    padding: 4,
    marginTop: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#1C1F1B', 
  },
  text: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  activeText: {
    fontFamily: 'DMSans_700Bold',
  },
});
