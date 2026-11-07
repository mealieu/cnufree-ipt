import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { TIMELINE_PERIODS, TimeSlotTimeline } from '../../mock/dashboardData';

interface AvailabilityTimelineSliderProps {
  onPeriodChange?: (period: TimeSlotTimeline) => void;
}

export const AvailabilityTimelineSlider: React.FC<AvailabilityTimelineSliderProps> = ({
  onPeriodChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPeriod = TIMELINE_PERIODS[currentIndex];

  const handlePrev = () => {
    const nextIdx = currentIndex === 0 ? TIMELINE_PERIODS.length - 1 : currentIndex - 1;
    setCurrentIndex(nextIdx);
    onPeriodChange?.(TIMELINE_PERIODS[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % TIMELINE_PERIODS.length;
    setCurrentIndex(nextIdx);
    onPeriodChange?.(TIMELINE_PERIODS[nextIdx]);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Arrow Button */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handlePrev}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous time period"
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        {/* Timeline Bar Track */}
        <View style={styles.track}>
          <View style={styles.trackFillContainer}>
            {/* Smooth segmented indicators showing friend availability density */}
            <View style={[styles.densitySegment, { flex: 1.5, backgroundColor: '#B8E7C5' }]} />
            <View style={[styles.densitySegment, { flex: 3.5, backgroundColor: '#75D895' }]} />
            <View style={[styles.densitySegment, { flex: 2.0, backgroundColor: '#9FE1B4' }]} />
            <View style={[styles.densitySegment, { flex: 3.0, backgroundColor: '#58C97E' }]} />
            <View style={[styles.densitySegment, { flex: 1.0, backgroundColor: '#C8EFD3' }]} />
          </View>
        </View>

        {/* Right Arrow Button */}
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handleNext}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next time period"
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(235, 240, 226, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrowButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.sliderArrow,
    lineHeight: 22,
  },
  track: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.sliderTrackBg,
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(35, 50, 38, 0.15)',
  },
  trackFillContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  densitySegment: {
    height: '100%',
  },
});
