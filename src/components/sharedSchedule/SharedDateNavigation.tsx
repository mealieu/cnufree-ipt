import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { SharedDateNavigationProps } from '../../types/sharedSchedule';
import {
  formatNavigationDate,
  formatWeekNavigationRange,
} from '../../mock/sharedScheduleData';

export const SharedDateNavigation: React.FC<SharedDateNavigationProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
  isToday,
  viewMode = 'day',
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek = true,
}) => {
  const isWeekMode = viewMode === 'week';

  const dateDisplay = isWeekMode
    ? formatWeekNavigationRange(currentDate)
    : formatNavigationDate(currentDate);

  const isResetActive = isWeekMode ? isCurrentWeek : isToday;
  const resetLabel = isWeekMode ? 'This week' : 'Today';

  const handlePrev = () => {
    if (isWeekMode && onPrevWeek) {
      onPrevWeek();
    } else {
      onPrevDay();
    }
  };

  const handleNext = () => {
    if (isWeekMode && onNextWeek) {
      onNextWeek();
    } else {
      onNextDay();
    }
  };

  const handleReset = () => {
    if (isWeekMode && onThisWeek) {
      onThisWeek();
    } else {
      onToday();
    }
  };

  return (
    <View style={styles.container}>
      {/* Date / Week Range Titles */}
      <View style={styles.titleColumn}>
        <Text style={styles.mainDateText}>{dateDisplay.main}</Text>
        <Text style={styles.subDateText}>{dateDisplay.sub}</Text>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controlsRow}>
        {/* Today / This week Button */}
        <TouchableOpacity
          style={[styles.todayButton, isResetActive && styles.todayButtonActive]}
          onPress={handleReset}
          activeOpacity={0.7}
          accessibilityLabel={isWeekMode ? 'Go to This week' : 'Go to Today'}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.todayButtonText,
              isResetActive && styles.todayButtonTextActive,
            ]}
          >
            {resetLabel}
          </Text>
        </TouchableOpacity>

        {/* Previous Day / Week Chevron */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handlePrev}
          activeOpacity={0.7}
          accessibilityLabel={isWeekMode ? 'Previous Week' : 'Previous Day'}
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

        {/* Next Day / Week Chevron */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handleNext}
          activeOpacity={0.7}
          accessibilityLabel={isWeekMode ? 'Next Week' : 'Next Day'}
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
    backgroundColor: '#E6ECE4',
  },
  todayButtonText: {
    fontFamily: FONTS.bold,
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
