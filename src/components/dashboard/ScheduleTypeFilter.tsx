import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export type ScheduleFilterType = 'All' | 'Classes' | 'Free Time';

const FILTER_OPTIONS: ScheduleFilterType[] = ['All', 'Classes', 'Free Time'];

interface ScheduleTypeFilterProps {
  activeFilter?: ScheduleFilterType;
  onFilterChange?: (filter: ScheduleFilterType) => void;
}

export const ScheduleTypeFilter: React.FC<ScheduleTypeFilterProps> = ({
  activeFilter = 'All',
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onFilterChange?.(option)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${option}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.filterContainerBg || '#E4EAD9',
    borderRadius: 24,
    padding: 3,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.08,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 3.5px rgba(0,0,0,0.08)',
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.filterActiveBg || '#1C675C',
    borderWidth: 1,
    borderColor: COLORS.filterActiveBorder || '#D8B345',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      },
    }),
  },
  tabText: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  inactiveText: {
    fontFamily: FONTS.medium,
    color: COLORS.filterInactiveText || '#233427',
  },
  activeText: {
    fontFamily: FONTS.bold,
    color: COLORS.filterActiveText || '#FFFFFF',
  },
});
