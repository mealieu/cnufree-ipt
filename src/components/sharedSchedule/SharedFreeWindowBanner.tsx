import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import { SharedFreeWindowBannerProps } from '../../types/sharedSchedule';

export const SharedFreeWindowBanner: React.FC<SharedFreeWindowBannerProps> = ({
  freeWindows,
  currentDate,
  onPressBanner,
  isHighlighted = true,
}) => {
  // Format short date (e.g. "Wed, Oct 21") for empty overlap state matching SS-04
  const shortDateLabel = useMemo(() => {
    if (!currentDate) return 'selected day';
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${daysShort[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}`;
  }, [currentDate]);

  // ================= 1. EMPTY OVERLAP STATE (SS-04 RIGHT SCREEN) =================
  if (!freeWindows || freeWindows.length === 0) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={onPressBanner}
          activeOpacity={0.8}
          accessibilityLabel={`Common free time: None found for ${shortDateLabel}`}
          accessibilityRole="button"
        >
          {/* Left Info (i) Icon Circle */}
          <View style={styles.infoCircle}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="9.5"
                stroke="#687A6C"
                strokeWidth={1.8}
              />
              <Path
                d="M12 8.2V8.5M12 11.5V16"
                stroke="#687A6C"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.subTextMuted}>Common free time</Text>
            <Text style={styles.emptyMainText} numberOfLines={1}>
              None found for {shortDateLabel}
            </Text>
          </View>

          {/* Right Chevron */}
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18L15 12L9 6"
              stroke="#5D7061"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= 2. ACTIVE OVERLAPPING FREE WINDOW STATE (SS-01 / SS-04 LEFT) =================
  const primaryWindow = freeWindows[0];
  const additionalCount = freeWindows.length - 1;
  const friendsCount = primaryWindow.freeCount;

  const headerLabel = `All ${friendsCount} friends free · ${freeWindows.length} ${
    freeWindows.length === 1 ? 'window' : 'windows'
  }`;

  const mainTimeLabel = `${primaryWindow.timeRange}${
    additionalCount > 0 ? ` +${additionalCount} more` : ''
  }`;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.container, isHighlighted && styles.containerHighlighted]}
        onPress={onPressBanner}
        activeOpacity={0.8}
        accessibilityLabel={`${headerLabel}: ${mainTimeLabel}`}
        accessibilityRole="button"
      >
        {/* Left Badge: Checkmark inside Dark Circle */}
        <View style={styles.checkCircle}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17L4 12"
              stroke="#FFFFFF"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.subText}>{headerLabel}</Text>
          <Text style={styles.mainTimeText} numberOfLines={1}>
            {mainTimeLabel}
          </Text>
        </View>

        {/* Right Arrow */}
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18L15 12L9 6"
            stroke="#3B4D3F"
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
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3EC',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DFE7DD',
    ...Platform.select({
      ios: {
        shadowColor: '#1A3320',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  containerHighlighted: {
    borderColor: '#C7D9C5',
    backgroundColor: '#EDF4EB',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0E6',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E3DDD1',
    ...Platform.select({
      ios: {
        shadowColor: '#1A3320',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4E5F52',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6E2D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  subText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#55695A',
  },
  subTextMuted: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#657869',
  },
  mainTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#152419',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  emptyMainText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#1A291E',
    marginTop: 2,
    letterSpacing: -0.2,
  },
});
