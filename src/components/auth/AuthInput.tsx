import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#1C1F1B"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#000000',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)', // Primary Green (#22C55E) with opacity for the light green fill
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#000000',
    fontStyle: 'italic', // To match placeholders like "Name@gmail.com"
  },
});