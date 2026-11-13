import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { SharedDateNavigationProps } from '../../types/sharedSchedule';
import { formatNavigationDate } from '../../mock/sharedScheduleData';

export const SharedDateNavigation: React.FC<SharedDateNavigationProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
  isToday,
}) => {
  const { main, sub } = formatNavigationDate(currentDate);

  return (
    <View style={styles.container}>
      {/* Date Titles */}
      <View style={styles.titleColumn}>
        <Text style={styles.mainDateText}>{main}</Text>
        <Text style={styles.subDateText}>{sub}</Text>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controlsRow}>
        {/* Today Button */}
        <TouchableOpacity
          style={[styles.todayButton, isToday && styles.todayButtonActive]}
          onPress={onToday}
          activeOpacity={0.7}
          accessibilityLabel="Go to Today"
          accessibilityRole="button"
        >
          <Text style={[styles.todayButtonText, isToday && styles.todayButtonTextActive]}>
            Today
          </Text>
        </TouchableOpacity>

        {/* Previous Day Chevron */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onPrevDay}
          activeOpacity={0.7}
          accessibilityLabel="Previous Day"
          accessibilityRole="button"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke="#2B3E2F"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Next Day Chevron */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onNextDay}
          activeOpacity={0.7}
          accessibilityLabel="Next Day"
          accessibilityRole="button"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 6L15 12L9 18"
              stroke="#2B3E2F"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 2,
  },
  titleColumn: {
    flex: 1,
  },
  mainDateText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#152419',
    letterSpacing: -0.3,
  },
  subDateText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#5B7060',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    backgroundColor: '#E6ECE4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButtonActive: {
    backgroundColor: '#DEE6DC',
    borderWidth: 1,
    borderColor: '#C3D4C2',
  },
  todayButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#243728',
  },
  todayButtonTextActive: {
    fontFamily: FONTS.bold,
    color: '#16311D',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6ECE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

