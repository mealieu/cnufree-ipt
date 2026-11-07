import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export interface WeekDayOption {
  day: string;
  date: string;
  fullDate: string;
}

export const PERSONAL_WEEK_DAYS: WeekDayOption[] = [
  { day: 'Mon', date: '19', fullDate: 'Mon, October 19' },
  { day: 'Tue', date: '20', fullDate: 'Tues, October 20' },
  { day: 'Wed', date: '21', fullDate: 'Wed, October 21' },
  { day: 'Thurs', date: '22', fullDate: 'Thurs, October 22' },
  { day: 'Fri', date: '23', fullDate: 'Fri, October 23' },
  { day: 'Sat', date: '24', fullDate: 'Sat, October 24' },
  { day: 'Sun', date: '25', fullDate: 'Sun, October 25' },
];

interface WeeklyDateFilterProps {
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export const WeeklyDateFilter: React.FC<WeeklyDateFilterProps> = ({
  selectedDate = '20',
  onSelectDate,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PERSONAL_WEEK_DAYS.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <TouchableOpacity
              key={item.date}
              style={[
                styles.dayTab,
                isSelected ? styles.dayTabActive : styles.dayTabInactive,
              ]}
              onPress={() => onSelectDate?.(item.date)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${item.day} ${item.date}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected ? styles.dayTextActive : styles.dayTextInactive,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isSelected ? styles.dateTextActive : styles.dateTextInactive,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  scrollContent: {
    paddingVertical: 2,
    gap: 7,
  },
  dayTab: {
    width: 48,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 3.5px rgba(0,0,0,0.1)',
      },
    }),
  },
  dayTabInactive: {
    backgroundColor: COLORS.dayTabBg || '#C5D6C7',
  },
  dayTabActive: {
    backgroundColor: COLORS.dayTabActiveBg || '#4A5F50',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      },
    }),
  },
  dayText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginBottom: 2,
  },
  dayTextInactive: {
    color: COLORS.dayTabTextSubtle || '#2E3D31',
  },
  dayTextActive: {
    color: '#DCE8DE',
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  dateTextInactive: {
    color: COLORS.dayTabTextDark || '#1A231D',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
});
