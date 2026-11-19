import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FONTS } from '../../constants/typography';
import { WeeklyScheduleDay, WeeklyScheduleSlot } from '../../types/personalSchedule';

export interface WeeklyScheduleGridProps {
  days: WeeklyScheduleDay[];
  onSelectDay: (day: WeeklyScheduleDay) => void;
  onSelectSlot: (day: WeeklyScheduleDay, slot: WeeklyScheduleSlot) => void;
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  days,
  onSelectDay,
  onSelectSlot,
}) => {
  // Left column: Sunday, Tuesday, Thursday, Saturday
  // Right column: Monday, Wednesday, Friday
  const leftColumnDays = days.filter((d) =>
    ['sun', 'tue', 'thu', 'sat'].includes(d.dayKey)
  );
  const rightColumnDays = days.filter((d) =>
    ['mon', 'wed', 'fri'].includes(d.dayKey)
  );

  const renderDayCard = (day: WeeklyScheduleDay) => {
    return (
      <View key={day.dayKey} style={styles.dayCard}>
        {/* Day Name Header Pill (Tappable to view day details) */}
        <TouchableOpacity
          style={styles.dayBadgePill}
          onPress={() => onSelectDay(day)}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={`View full schedule for ${day.dayName}`}
        >
          <Text style={styles.dayBadgeText}>{day.dayName}</Text>
        </TouchableOpacity>

        {/* 8 Uniform Time Slot Pills */}
        <View style={styles.slotsContainer}>
          {day.slots.map((slot, index) => {
            return (
              <TouchableOpacity
                key={`${day.dayKey}-${slot.time}-${index}`}
                style={styles.slotPill}
                onPress={() => onSelectSlot(day, slot)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${day.dayName} ${slot.time}: ${slot.status}`}
              >
                <Text style={styles.slotTimeText} numberOfLines={1}>
                  {slot.time}
                </Text>
                <Text style={styles.slotStatusText} numberOfLines={1}>
                  {slot.status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.gridContainer}>
      {/* Left Column */}
      <View style={styles.gridColumn}>
        {leftColumnDays.map(renderDayCard)}
      </View>

      {/* Right Column */}
      <View style={styles.gridColumn}>
        {rightColumnDays.map(renderDayCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridColumn: {
    flex: 1,
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#5C7057',
    borderRadius: 24,
    padding: 10,
  },
  dayBadgePill: {
    backgroundColor: '#ACC5A6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dayBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#18251B',
    letterSpacing: 0.3,
  },
  slotsContainer: {
    gap: 4.5,
  },
  slotPill: {
    height: 26,
    backgroundColor: '#F4F1D8',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slotTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#1A251D',
  },
  slotStatusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#1A251D',
  },
});
