import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ScheduleActivity } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface ScheduleSummaryCardProps {
  activities: ScheduleActivity[];
  onViewFullDay: () => void;
  timeMarkers?: string[];
}

export const ScheduleSummaryCard: React.FC<ScheduleSummaryCardProps> = ({
  activities,
  onViewFullDay,
  timeMarkers = ['8:00AM', '1:00PM', '3:00 PM'],
}) => {
  const hasActivities = activities && activities.length > 0;

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today’s Schedule</Text>
        <TouchableOpacity
          style={styles.viewAction}
          onPress={onViewFullDay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View full day schedule"
        >
          <Text style={styles.viewActionText}>View full day</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {hasActivities ? (
        <View style={styles.timelineContainer}>
          {/* Capsule Timeline Bar */}
          <View style={styles.timelineBar}>
            {/* 1st segment: 8:00 - 10:30 (Free, light mint) */}
            <View style={[styles.segment, { flex: 2.5, backgroundColor: COLORS.scheduleBarFree }]} />
            {/* 2nd segment: 10:30 - 1:00 (Busy, bright green) */}
            <View style={[styles.segment, { flex: 2.5, backgroundColor: COLORS.scheduleBarBusy }]} />
            {/* 3rd segment: 1:00 - 2:30 (Free, light mint) */}
            <View style={[styles.segment, { flex: 3.0, backgroundColor: COLORS.scheduleBarFree }]} />
            {/* 4th segment: 2:30 - 4:00 (Busy, bright green) */}
            <View style={[styles.segment, { flex: 2.2, backgroundColor: COLORS.scheduleBarBusy }]} />
            {/* 5th segment: 4:00 - onwards (Free, light mint) */}
            <View style={[styles.segment, { flex: 4.0, backgroundColor: COLORS.scheduleBarFree }]} />
          </View>

          {/* Time Markers Row */}
          <View style={styles.timeMarkersRow}>
            {timeMarkers.map((marker, idx) => (
              <Text
                key={idx}
                style={[
                  styles.markerText,
                  idx === 0 && styles.markerLeft,
                  idx === timeMarkers.length - 1 && styles.markerRight,
                ]}
              >
                {marker}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes or activities scheduled today.</Text>
          <Text style={styles.emptySubtext}>You have an open schedule!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.scheduleCardBg,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.scheduleGreenText,
    letterSpacing: -0.2,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  viewActionText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.scheduleSubText,
    marginRight: 4,
  },
  chevron: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.scheduleSubText,
    lineHeight: 18,
  },
  timelineContainer: {
    width: '100%',
  },
  timelineBar: {
    height: 22,
    borderRadius: 11,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: COLORS.scheduleBarTrack,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  segment: {
    height: '100%',
  },
  timeMarkersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  markerText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
  markerLeft: {
    textAlign: 'left',
  },
  markerRight: {
    textAlign: 'right',
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.scheduleSubText,
    marginTop: 2,
    textAlign: 'center',
  },
});
