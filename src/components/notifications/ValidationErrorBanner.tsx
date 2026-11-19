import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { ValidationErrorBannerProps } from '../../types/notifications';

export const ValidationErrorBanner: React.FC<ValidationErrorBannerProps> = ({
  errors,
  title = 'Action cannot be completed',
  onDismiss,
}) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.bannerContainer}
      accessibilityRole="alert"
      accessibilityLabel={`${title}: ${errors.map((e) => e.message).join('. ')}`}
    >
      <View style={styles.leftIconCircle}>
        <Text style={styles.leftIconText}>!</Text>
      </View>

      <View style={styles.contentColumn}>
        <Text style={styles.bannerTitle}>{title}</Text>
        {errors.map((err) => (
          <Text key={err.id} style={styles.errorText}>
            {err.message}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Dismiss validation warning"
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 6L6 18M6 6L18 18"
            stroke="#8E2424"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.notifBadgeNoAccessBg,
    borderWidth: 1.2,
    borderColor: COLORS.notifBadgeNoAccessBorder,
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  leftIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.notifBadgeNoAccessBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leftIconText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.notifErrorExclamation,
  },
  contentColumn: {
    flex: 1,
    marginRight: 8,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#7A1F1F',
    marginBottom: 2,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#5C1818',
    lineHeight: 17,
  },
  dismissButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
