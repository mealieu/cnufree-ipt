import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import { OverlappingFreeWindow } from '../../types/sharedSchedule';

interface SharedFreeWindowBannerProps {
  freeWindows: OverlappingFreeWindow[];
  onPressBanner?: () => void;
  isHighlighted?: boolean;
}

export const SharedFreeWindowBanner: React.FC<SharedFreeWindowBannerProps> = ({
  freeWindows,
  onPressBanner,
  isHighlighted = true,
}) => {
  if (!freeWindows || freeWindows.length === 0) {
    return null;
  }

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
        accessibilityLabel={headerLabel}
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
  },
  containerHighlighted: {
    borderColor: '#C7D9C5',
    backgroundColor: '#EDF4EB',
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
  textContent: {
    flex: 1,
  },
  subText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#55695A',
  },
  mainTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#152419',
    marginTop: 2,
    letterSpacing: -0.2,
  },
});

