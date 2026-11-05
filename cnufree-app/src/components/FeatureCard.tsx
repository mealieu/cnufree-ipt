import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

interface FeatureCardProps {
  title: string;
  description: string;
  isCenter?: boolean;
  alignRight?: boolean; 
  style?: ViewStyle;
  icon?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  isCenter = false, 
  alignRight = false,
  style, 
  icon 
}) => {
  return (
    <View style={[
      styles.card, 
      isCenter ? styles.centerCard : styles.sideCard, 
      alignRight && styles.alignRightContainer, 
      style
    ]}>
      <Text style={[styles.icon, alignRight && styles.alignRightText]}>{icon}</Text>
      <Text style={[
        styles.title, 
        isCenter ? styles.centerText : styles.sideText,
        alignRight && styles.alignRightText
      ]}>{title}</Text>
      <Text style={[
        styles.description, 
        isCenter ? styles.centerDescription : styles.sideDescription,
        alignRight && styles.alignRightText
      ]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 220,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000', 
    position: 'absolute',
  },
  centerCard: {
    backgroundColor: COLORS.darkGreen,
    zIndex: 10,
    height: 240, 
    width: 150,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  sideCard: {
    backgroundColor: COLORS.lightMutedGreen,
    zIndex: 1,
  },
  icon: {
    fontSize: 24, 
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontFamily: FONTS.italic,
    fontSize: 13,
    lineHeight: 16,
  },
  centerText: {
    color: COLORS.white,
  },
  centerDescription: {
    color: COLORS.white,
  },
  sideText: {
    color: COLORS.white,
  },
  sideDescription: {
    color: COLORS.white,
  },
  // New styles for right-alignment
  alignRightContainer: {
    alignItems: 'flex-end',
  },
  alignRightText: {
    textAlign: 'right',
  }
});