import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { FeedbackToastProps } from '../../types/notifications';

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  toast,
  onDismiss,
}) => {
  if (!toast) {
    return null;
  }

  const isError = toast.variant === 'error' || toast.variant === 'warning';

  return (
    <View style={styles.toastWrapper} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.toastContainer,
          isError && styles.toastContainerError,
        ]}
        onPress={onDismiss}
        activeOpacity={0.9}
        accessibilityRole="alert"
        accessibilityLabel={`${toast.title}. ${toast.message}`}
      >
        {/* Left Mint Circle with Checkmark or Exclamation (UI-57 Reference) */}
        <View
          style={[
            styles.iconCircle,
            isError && styles.iconCircleError,
          ]}
        >
          {isError ? (
            <Text style={styles.exclamationText}>!</Text>
          ) : (
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke="#1E4635"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>

        {/* Text Column */}
        <View style={styles.textColumn}>
          <Text style={styles.titleText} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 74,
    zIndex: 120,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    maxWidth: 448,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.notifToastDarkBg,
    borderWidth: 1.2,
    borderColor: COLORS.notifToastBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0A1A11',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(10,26,17,0.28)',
      },
    }),
  },
  toastContainerError: {
    backgroundColor: '#5C2323',
    borderColor: '#A84848',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CFEAD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleError: {
    backgroundColor: '#FADBD8',
  },
  exclamationText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#8E2424',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#DCECE2',
    marginTop: 1,
  },
});
