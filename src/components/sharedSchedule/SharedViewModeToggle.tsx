import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import { SharedViewMode } from '../../types/sharedSchedule';

interface SharedViewModeToggleProps {
  viewMode: SharedViewMode;
  onViewModeChange: (mode: SharedViewMode) => void;
}

export const SharedViewModeToggle: React.FC<SharedViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Day Button */}
        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'day' && styles.activeSegment]}
          onPress={() => onViewModeChange('day')}
          activeOpacity={0.8}
          accessibilityLabel="Day View"
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'day' }}
        >
          <Text
            style={[
              styles.segmentText,
              viewMode === 'day' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Day
          </Text>
        </TouchableOpacity>

        {/* Week Button */}
        <TouchableOpacity
          style={[styles.segmentButton, viewMode === 'week' && styles.activeSegment]}
          onPress={() => onViewModeChange('week')}
          activeOpacity={0.8}
          accessibilityLabel="Week View"
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'week' }}
        >
          <Text
            style={[
              styles.segmentText,
              viewMode === 'week' ? styles.activeText : styles.inactiveText,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#E6EAE3',
    borderRadius: 24,
    padding: 3,
    height: 44,
    alignItems: 'center',
  },
  segmentButton: {
    flex: 1,
    height: '100%',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: '#F5F3E7',
    borderWidth: 1.2,
    borderColor: '#4A5B4C',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
  },
  activeText: {
    fontFamily: FONTS.bold,
    color: '#152419',
  },
  inactiveText: {
    color: '#657769',
  },
});

