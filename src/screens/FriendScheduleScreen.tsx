import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { FriendAvailability, FriendScheduleItem } from '../types/dashboard';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { UserAvatarSilhouette } from '../components/icons/NavIcons';
import {
  INITIAL_SCHEDULE_ACTIVITIES,
  calculateMutualFreeWindows,
  formatDecimalHourToTime,
} from '../mock/dashboardData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';

interface FriendScheduleScreenProps {
  friend: FriendAvailability;
  onBack: () => void;
}

export const FriendScheduleScreen: React.FC<FriendScheduleScreenProps> = ({
  friend,
  onBack,
}) => {
  const [selectedItem, setSelectedItem] = useState<FriendScheduleItem | null>(null);

  const isVacant = friend.status === 'free';

  // Compute friend's schedule items (use structured schedule or fallback from freeSlots)
  const scheduleItems: FriendScheduleItem[] = useMemo(() => {
    if (friend.schedule && friend.schedule.length > 0) {
      return friend.schedule;
    }
    return [
      {
        id: 'fallback-1',
        title: 'Morning Class',
        startTime: '8:00 AM',
        endTime: '10:30 AM',
        startHour: 8.0,
        endHour: 10.5,
        room: 'Main Hall',
        isBusy: friend.status === 'busy',
      },
      {
        id: 'fallback-2',
        title: 'Midday Open Window',
        startTime: '10:30 AM',
        endTime: '1:00 PM',
        startHour: 10.5,
        endHour: 13.0,
        room: 'Library',
        isBusy: false,
      },
      {
        id: 'fallback-3',
        title: 'Afternoon Laboratory',
        startTime: '1:00 PM',
        endTime: '3:30 PM',
        startHour: 13.0,
        endHour: 15.5,
        room: 'Lab D216',
        isBusy: true,
      },
      {
        id: 'fallback-4',
        title: 'Evening Free Window',
        startTime: '3:30 PM',
        endTime: '9:00 PM',
        startHour: 15.5,
        endHour: 21.0,
        room: 'Campus Commons',
        isBusy: false,
      },
    ];
  }, [friend]);

  // Compute mutual free time windows with Bernadette
  const mutualWindows = useMemo(() => {
    return calculateMutualFreeWindows(INITIAL_SCHEDULE_ACTIVITIES, friend);
  }, [friend]);

  const totalMutualMinutes = useMemo(() => {
    return mutualWindows.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  }, [mutualWindows]);

  const formatMinutes = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `${hrs}h`;
    return `${hrs}h ${m}m`;
  };

  // Timeline axis setup (8:00 AM to 9:00 PM)
  const dayStartHour = 8.0;
  const dayEndHour = 21.0;
  const totalHours = dayEndHour - dayStartHour;

  const axisMarkers = [
    { label: '8:00AM', hour: 8.0 },
    { label: '1:00PM', hour: 13.0 },
    { label: '3:00 PM', hour: 15.0 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= TOP NAVIGATION APP BAR ================= */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to Dashboard"
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backButtonText}>Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.screenHeaderTitle}>Friend's Routine</Text>

        <View style={{ width: 85 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. FRIEND PROFILE & STATUS HEADER ================= */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.profileRow}>
              {/* Avatar with Live Status Indicator Ring */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  <UserAvatarSilhouette size={48} color="#6F8472" />
                </View>
                <View
                  style={[
                    styles.statusRingDot,
                    isVacant ? styles.statusRingVacant : styles.statusRingBusy,
                  ]}
                />
              </View>

              {/* Friend Info & Real-Time Badge */}
              <View style={styles.profileInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.statusSubtext}>
                  {isVacant
                    ? `Free until ${friend.untilTime}${friend.nextActivity ? ` | Next: ${friend.nextActivity}` : ''}`
                    : `Busy until ${friend.untilTime}${friend.currentActivity ? ` | ${friend.currentActivity}` : ''}`}
                </Text>

                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.statusPillBadge,
                      isVacant ? styles.pillVacant : styles.pillBusy,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isVacant ? styles.textVacant : styles.textBusy,
                      ]}
                    >
                      {isVacant ? '● VACANT NOW' : '■ CURRENTLY BUSY'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Location & Group Affiliations */}
            <View style={styles.metaRow}>
              {friend.currentLocation && (
                <View style={styles.locationTag}>
                  <Text style={styles.locationText}>📍 {friend.currentLocation}</Text>
                </View>
              )}

              <View style={styles.groupsTagRow}>
                {friend.groups.map((grp) => {
                  const label =
                    grp === 'bora' ? 'Bora' : grp === 'courtside' ? 'Court Side' : 'DYD';
                  return (
                    <View key={grp} style={styles.groupBadge}>
                      <Text style={styles.groupBadgeText}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ================= 2. MUTUAL FREE TIME HIGHLIGHT BANNER ================= */}
          <View style={styles.mutualBanner}>
            <View style={styles.mutualBannerHeader}>
              <View style={styles.mutualTitleRow}>
                <Text style={styles.sparkleIcon}>✨</Text>
                <Text style={styles.mutualTitle}>MUTUAL FREE WINDOWS</Text>
              </View>

              {mutualWindows.length > 0 && (
                <View style={styles.totalSharedPill}>
                  <Text style={styles.totalSharedText}>
                    {formatMinutes(totalMutualMinutes)} Total Shared
                  </Text>
                </View>
              )}
            </View>

            {mutualWindows.length > 0 ? (
              <View>
                <Text style={styles.mutualDescription}>
                  You and {friend.name.split(' ')[0]} share{' '}
                  <Text style={styles.boldGreenText}>
                    {mutualWindows.length} open window{mutualWindows.length > 1 ? 's' : ''}
                  </Text>{' '}
                  today:
                </Text>

                <View style={styles.chipsRow}>
                  {mutualWindows.map((win, idx) => (
                    <View key={idx} style={styles.mutualChip}>
                      <Text style={styles.chipTimeText}>
                        🕒 {win.startTime} – {win.endTime}
                      </Text>
                      <Text style={styles.chipDurationText}>
                        ({formatMinutes(win.durationMinutes)})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.noMutualText}>
                No overlapping free daytime windows found today.
              </Text>
            )}
          </View>

          {/* ================= 3. FRIEND DAILY SCHEDULE TIMELINE CARD ================= */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.timelineTitle}>
                {friend.name.split(' ')[0]}'s Timeline
              </Text>
              <Text style={styles.timelineBadge}>8:00 AM – 9:00 PM</Text>
            </View>

            {/* Segmented Timeline Bar */}
            <View style={styles.timelineBar}>
              {scheduleItems.map((item, index) => {
                const duration = Math.max(0.5, item.endHour - item.startHour);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.segment,
                      { flex: duration },
                      item.isBusy ? styles.segmentOccupied : styles.segmentFree,
                      isSelected && styles.segmentSelected,
                      index === 0 && styles.firstSegment,
                      index === scheduleItems.length - 1 && styles.lastSegment,
                    ]}
                    onPress={() =>
                      setSelectedItem((prev) => (prev?.id === item.id ? null : item))
                    }
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}, ${item.startTime} to ${item.endTime}, ${item.isBusy ? 'Occupied' : 'Free'}`}
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

            {/* Tap Inspection Tooltip */}
            {selectedItem && (
              <View style={styles.inspectionTooltip}>
                <View style={styles.tooltipTopRow}>
                  <View
                    style={[
                      styles.tooltipBadge,
                      selectedItem.isBusy ? styles.tooltipBadgeBusy : styles.tooltipBadgeFree,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tooltipBadgeText,
                        selectedItem.isBusy ? styles.textBusyMini : styles.textFreeMini,
                      ]}
                    >
                      {selectedItem.isBusy ? 'OCCUPIED' : 'VACANT'}
                    </Text>
                  </View>

                  <Text style={styles.tooltipTime}>
                    🕒 {selectedItem.startTime} – {selectedItem.endTime}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    style={styles.closeTooltip}
                  >
                    <Text style={styles.closeTooltipText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.tooltipTitle}>{selectedItem.title}</Text>
                {selectedItem.room && (
                  <Text style={styles.tooltipRoom}>📍 Room: {selectedItem.room}</Text>
                )}
                {selectedItem.description && (
                  <Text style={styles.tooltipDesc}>{selectedItem.description}</Text>
                )}
              </View>
            )}

            <Text style={styles.helperText}>
              💡 Tap any block above to inspect subject, room, and status
            </Text>
          </View>

          {/* ================= 4. FULL CHRONOLOGICAL ROUTINE BREAKDOWN ================= */}
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownSectionTitle}>Chronological Routine</Text>

            {scheduleItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.routineCard,
                  item.isBusy ? styles.routineCardBusy : styles.routineCardFree,
                ]}
              >
                {/* Left Time Column */}
                <View style={styles.timeCol}>
                  <Text style={styles.timeStartText}>{item.startTime}</Text>
                  <Text style={styles.timeEndText}>{item.endTime}</Text>
                </View>

                {/* Right Content */}
                <View style={styles.detailCol}>
                  <View style={styles.detailHeaderRow}>
                    <Text style={styles.detailTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.miniBadge,
                        item.isBusy ? styles.miniBadgeBusy : styles.miniBadgeFree,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniBadgeText,
                          item.isBusy ? styles.miniTextBusy : styles.miniTextFree,
                        ]}
                      >
                        {item.isBusy ? 'BUSY' : 'VACANT'}
                      </Text>
                    </View>
                  </View>

                  {item.room && (
                    <View style={styles.roomRow}>
                      <Text style={styles.roomLabel}>📍 {item.room}</Text>
                      {item.code && (
                        <View style={styles.codeTag}>
                          <Text style={styles.codeTagText}>{item.code}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {item.description && (
                    <Text style={styles.descText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="home"
        onTabChange={() => onBack()}
        notificationBadgeCount={0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(35, 50, 38, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE5D8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  backChevron: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.darkGreen,
    marginRight: 4,
    lineHeight: 20,
  },
  backButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.darkGreen,
  },
  screenHeaderTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.darkGreen,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 85,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  profileHeaderCard: {
    backgroundColor: '#9AAFA0', // Sage green from mockup
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#172B1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(23, 43, 30, 0.1)',
      },
    }),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAE6D8',
    borderWidth: 2,
    borderColor: '#D4E2D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRingDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusRingVacant: {
    backgroundColor: '#2ECC71',
  },
  statusRingBusy: {
    backgroundColor: '#C0392B',
  },
  profileInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 17.5,
    fontFamily: FONTS.bold,
    color: '#142218',
    letterSpacing: -0.2,
  },
  statusSubtext: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#283B2F',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusPillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  pillVacant: {
    backgroundColor: '#D7F1E1',
    borderColor: '#34D399',
  },
  pillBusy: {
    backgroundColor: '#FDECEB',
    borderColor: '#F5B7B1',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  textVacant: {
    color: '#136738',
  },
  textBusy: {
    color: '#C0392B',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    flexWrap: 'wrap',
    gap: 6,
  },
  locationTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#19492A',
  },
  groupsTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  groupBadge: {
    backgroundColor: '#204F43',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupBadgeText: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  mutualBanner: {
    backgroundColor: '#E7F2EB',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: '#B8DAC4',
  },
  mutualBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mutualTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleIcon: {
    fontSize: 14,
  },
  mutualTitle: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#1A5331',
    letterSpacing: 0.5,
  },
  totalSharedPill: {
    backgroundColor: '#D1EBD9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  totalSharedText: {
    fontSize: 10.5,
    fontFamily: FONTS.bold,
    color: '#13582E',
  },
  mutualDescription: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: '#284634',
    marginBottom: 8,
  },
  boldGreenText: {
    fontFamily: FONTS.bold,
    color: '#0D4522',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mutualChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A8D2B7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipTimeText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: '#155B32',
  },
  chipDurationText: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: '#4B735B',
  },
  noMutualText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#556E5E',
    fontStyle: 'italic',
  },
  timelineCard: {
    backgroundColor: COLORS.scheduleCardBg,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    marginVertical: 8,
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
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.scheduleGreenText,
  },
  timelineBadge: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.scheduleSubText,
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
    backgroundColor: COLORS.scheduleBarBusy,
  },
  segmentFree: {
    backgroundColor: COLORS.scheduleBarFree,
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
  textBusyMini: {
    color: '#FFFFFF',
  },
  textFreeMini: {
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
  tooltipDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#BDD2C3',
    marginTop: 2,
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#8EA991',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownSection: {
    marginTop: 14,
  },
  breakdownSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGreen,
    marginBottom: 10,
  },
  routineCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  routineCardBusy: {
    backgroundColor: '#EFF6F1',
    borderColor: '#C6DDD0',
    borderLeftWidth: 5,
    borderLeftColor: COLORS.scheduleBarBusy,
  },
  routineCardFree: {
    backgroundColor: '#F8FAF8',
    borderColor: '#DEE8E0',
    borderLeftWidth: 5,
    borderLeftColor: '#34D399',
  },
  timeCol: {
    width: 72,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0EAE2',
    paddingRight: 8,
  },
  timeStartText: {
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    color: '#142218',
  },
  timeEndText: {
    fontSize: 10.5,
    fontFamily: FONTS.medium,
    color: '#556E5E',
    marginTop: 2,
  },
  detailCol: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  detailTitle: {
    fontSize: 13.5,
    fontFamily: FONTS.bold,
    color: '#142218',
    flex: 1,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniBadgeBusy: {
    backgroundColor: '#FCEBEA',
    borderColor: '#F5B7B1',
  },
  miniBadgeFree: {
    backgroundColor: '#EAF7EE',
    borderColor: '#34D399',
  },
  miniBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
  miniTextBusy: {
    color: '#C0392B',
  },
  miniTextFree: {
    color: '#136738',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  roomLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#1B7A43',
  },
  codeTag: {
    backgroundColor: '#DAE8DF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  codeTagText: {
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    color: '#214D35',
  },
  descText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#556E5E',
    marginTop: 3,
  },
});
