import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.mutedGreen,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
  },
  label: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
});