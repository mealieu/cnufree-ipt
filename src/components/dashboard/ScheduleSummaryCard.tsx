import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { ScheduleActivity } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface ScheduleSummaryCardProps {
  activities: ScheduleActivity[];
  onViewFullDay: () => void;
  timeMarkers?: string[];
  onToggleEmptyDemo?: () => void;
  isEmptyDemoActive?: boolean;
}

export const ScheduleSummaryCard: React.FC<ScheduleSummaryCardProps> = ({
  activities,
  onViewFullDay,
  timeMarkers = ['8:00AM', '1:00PM', '3:00 PM'],
  onToggleEmptyDemo,
  isEmptyDemoActive = false,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);

  const hasActivities = activities && activities.length > 0 && !isEmptyDemoActive;

  const handleSegmentPress = (activity: ScheduleActivity) => {
    setSelectedActivity((prev) => (prev?.id === activity.id ? null : activity));
  };

  // Day timeline range (8:00 AM to 9:00 PM = 13 total hours)
  const dayStartHour = 8.0;
  const dayEndHour = 21.0;
  const totalHours = dayEndHour - dayStartHour;

  // Axis markers with exact hour offsets matching the UI mockup
  const axisMarkers = [
    { label: '8:00AM', hour: 8.0 },
    { label: '1:00PM', hour: 13.0 },
    { label: '3:00 PM', hour: 15.0 },
  ];

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Schedule</Text>
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
          {/* Segmented Timeline Bar */}
          <View style={styles.timelineBar}>
            {activities.map((activity, index) => {
              const duration = Math.max(0.5, activity.endHour - activity.startHour);
              const isSelected = selectedActivity?.id === activity.id;

              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.segment,
                    { flex: duration },
                    activity.isBusy ? styles.segmentOccupied : styles.segmentFree,
                    isSelected && styles.segmentSelected,
                    index === 0 && styles.firstSegment,
                    index === activities.length - 1 && styles.lastSegment,
                  ]}
                  onPress={() => handleSegmentPress(activity)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${activity.title}, ${activity.startTime} to ${activity.endTime}, ${activity.isBusy ? 'Occupied' : 'Free'}`}
                />
              );
            })}
          </View>

          {/* Time Labels Axis Alignment */}
          <View style={styles.timeMarkersRow}>
            {axisMarkers.map((marker, idx) => {
              const leftPercent = ((marker.hour - dayStartHour) / totalHours) * 100;
              return (
                <View
                  key={idx}
                  style={[
                    styles.markerPositionWrapper,
                    { left: `${Math.max(2, Math.min(leftPercent, 88))}%` },
                  ]}
                >
                  <Text style={styles.markerText}>{marker.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Interactive Inspection Tooltip Popover */}
          {selectedActivity && (
            <View style={styles.inspectionTooltip}>
              <View style={styles.tooltipTopRow}>
                <View
                  style={[
                    styles.tooltipBadge,
                    selectedActivity.isBusy ? styles.tooltipBadgeBusy : styles.tooltipBadgeFree,
                  ]}
                >
                  <Text
                    style={[
                      styles.tooltipBadgeText,
                      selectedActivity.isBusy ? styles.textBusy : styles.textFree,
                    ]}
                  >
                    {selectedActivity.isBusy ? 'OCCUPIED' : 'VACANT / FREE'}
                  </Text>
                </View>

                <Text style={styles.tooltipTime}>
                  🕒 {selectedActivity.startTime} – {selectedActivity.endTime}
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedActivity(null)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={styles.closeTooltip}
                >
                  <Text style={styles.closeTooltipText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tooltipTitle}>{selectedActivity.title}</Text>
              {selectedActivity.room && (
                <Text style={styles.tooltipRoom}>📍 Room: {selectedActivity.room}</Text>
              )}
            </View>
          )}

          {/* Segment Tap Helper & Demo Empty State Switcher */}
          <View style={styles.footerRow}>
            <Text style={styles.helperText}>
              💡 Tap any segment above to inspect activity & room
            </Text>

            {onToggleEmptyDemo && (
              <TouchableOpacity
                onPress={onToggleEmptyDemo}
                style={styles.demoPill}
                activeOpacity={0.7}
              >
                <Text style={styles.demoPillText}>
                  {isEmptyDemoActive ? 'Show Normal' : 'Test Empty'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        /* Empty State for days with no scheduled activities */
        <View style={styles.emptyContainer}>
          {/* All-Day Free Segmented Bar */}
          <View style={styles.timelineBar}>
            <View style={[styles.segment, styles.segmentFree, { flex: 1 }]} />
          </View>

          <View style={styles.timeMarkersRow}>
            {axisMarkers.map((marker, idx) => {
              const leftPercent = ((marker.hour - dayStartHour) / totalHours) * 100;
              return (
                <View
                  key={idx}
                  style={[
                    styles.markerPositionWrapper,
                    { left: `${Math.max(2, Math.min(leftPercent, 88))}%` },
                  ]}
                >
                  <Text style={styles.markerText}>{marker.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.emptyNoticeBox}>
            <Text style={styles.emptyText}>No classes or activities scheduled today.</Text>
            <Text style={styles.emptySubtext}>
              You have completely open vacant time throughout the day!
            </Text>

            {onToggleEmptyDemo && (
              <TouchableOpacity
                onPress={onToggleEmptyDemo}
                style={[styles.demoPill, { marginTop: 10 }]}
                activeOpacity={0.7}
              >
                <Text style={styles.demoPillText}>Return to Normal Routine</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingTop: 16,
    paddingBottom: 12,
    marginHorizontal: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
      },
    }),
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
  segmentOccupied: {
    backgroundColor: COLORS.scheduleBarBusy, // Solid bright green
  },
  segmentFree: {
    backgroundColor: COLORS.scheduleBarFree, // Lighter pale mint/cream
  },
  segmentSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  firstSegment: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  lastSegment: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  timeMarkersRow: {
    position: 'relative',
    height: 22,
    marginTop: 8,
    width: '100%',
  },
  markerPositionWrapper: {
    position: 'absolute',
    transform: [{ translateX: -16 }],
  },
  markerText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
  inspectionTooltip: {
    backgroundColor: '#26382B',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3D5443',
  },
  tooltipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tooltipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tooltipBadgeBusy: {
    backgroundColor: '#2ECC71',
  },
  tooltipBadgeFree: {
    backgroundColor: '#D6EFE0',
  },
  tooltipBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  textBusy: {
    color: '#FFFFFF',
  },
  textFree: {
    color: '#1B7A43',
  },
  tooltipTime: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#BDD2C3',
  },
  closeTooltip: {
    padding: 4,
  },
  closeTooltipText: {
    fontSize: 12,
    color: '#8EA991',
    fontWeight: 'bold',
  },
  tooltipTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tooltipRoom: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#34D399',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#8EA991',
    flex: 1,
  },
  demoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  demoPillText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#D1E6D8',
  },
  emptyContainer: {
    width: '100%',
  },
  emptyNoticeBox: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderRadius: 10,
    marginTop: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  emptyText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#BDD2C3',
    marginTop: 2,
    textAlign: 'center',
  },
});
