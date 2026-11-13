import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import {
  DailyCalendarProps,
  SharedCalendarFriend,
  SharedScheduleItem,
  OverlappingFreeWindow,
  ScheduleColorVariant,
} from '../../types/sharedSchedule';

const HOUR_HEIGHT = 58;
const START_HOUR = 8.0;
const END_HOUR = 18.0;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 10 hours

const TIMELINE_HOURS = [
  { hour: 8, label: '8 AM' },
  { hour: 9, label: '9 AM' },
  { hour: 10, label: '10 AM' },
  { hour: 11, label: '11 AM' },
  { hour: 12, label: '12 PM' },
  { hour: 13, label: '1 PM' },
  { hour: 14, label: '2 PM' },
  { hour: 15, label: '3 PM' },
  { hour: 16, label: '4 PM' },
  { hour: 17, label: '5 PM' },
  { hour: 18, label: '6 PM' },
];

// Color palette styles for schedule tiles in the green color palette
const GREEN_TILE_PALETTES: Record<
  ScheduleColorVariant,
  { bg: string; border: string; title: string; time: string }
> = {
  forest: {
    bg: '#DDEADE',
    border: '#1A5A31',
    title: '#13301B',
    time: '#35543D',
  },
  teal: {
    bg: '#D8ECE4',
    border: '#1C675C',
    title: '#10352C',
    time: '#33574E',
  },
  olive: {
    bg: '#E2E9DC',
    border: '#46643F',
    title: '#22351E',
    time: '#445A41',
  },
  mint: {
    bg: '#D4EFE3',
    border: '#27AE60',
    title: '#0E4426',
    time: '#2B5E3F',
  },
  busy: {
    bg: '#DFE7E0',
    border: '#536657',
    title: '#1C2920',
    time: '#415546',
  },
};

export const DailySharedCalendar: React.FC<DailyCalendarProps> = ({
  date,
  dateKey,
  friends,
  overlappingWindows = [],
  onFriendPress,
  onScheduleItemPress,
  showCurrentTimeIndicator = true,
  highlightFreeWindows = true,
}) => {
  // Current time position (reference: 10:15 AM = 10.25)
  const currentTimeHour = 10.25;
  const currentTimeTop = (currentTimeHour - START_HOUR) * HOUR_HEIGHT;

  // Separate all-free windows vs partial free windows
  const allFreeWindows = useMemo(
    () => overlappingWindows.filter((w) => w.isAllFree),
    [overlappingWindows]
  );
  const partialWindows = useMemo(
    () => overlappingWindows.filter((w) => !w.isAllFree),
    [overlappingWindows]
  );

  // Check if every friend has zero classes today (Empty State)
  const totalClassesToday = useMemo(() => {
    return friends.reduce((acc, friend) => {
      const schedule = friend.scheduleByDate[dateKey] || [];
      return acc + schedule.filter((s) => s.isBusy).length;
    }, 0);
  }, [friends, dateKey]);

  return (
    <View style={styles.calendarContainer}>
      {/* ================= 1. FRIENDS HEADER ROW ================= */}
      <View style={styles.headerRow}>
        {/* Left spacer matching time axis width */}
        <View style={styles.timeAxisSpacer} />

        {/* Friend Column Headers */}
        <View style={styles.friendHeadersContainer}>
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendHeaderCol}
              onPress={() => onFriendPress?.(friend)}
              activeOpacity={onFriendPress ? 0.7 : 1}
              accessibilityLabel={`View schedule for ${friend.name}`}
            >
              {/* Initials Avatar */}
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{friend.initials}</Text>
              </View>

              {/* Friend Name + Privacy Lock if restricted */}
              <View style={styles.nameRow}>
                <Text style={styles.friendNameText} numberOfLines={1}>
                  {friend.nickname || friend.name}
                </Text>
                {friend.isPrivate && (
                  <Svg
                    width={11}
                    height={11}
                    viewBox="0 0 24 24"
                    fill="none"
                    style={styles.lockIcon}
                  >
                    <Rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                      stroke="#485B4C"
                      strokeWidth="2.4"
                    />
                    <Path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="#485B4C"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ================= 2. EMPTY STATE (IF NO FRIENDS OR NO CLASSES) ================= */}
      {friends.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Circle cx="9" cy="8" r="3.5" stroke="#2B5E38" strokeWidth={1.8} />
              <Path
                d="M2.5 19C2.5 15.5 5.5 13.5 9 13.5C12.5 13.5 15.5 15.5 15.5 19"
                stroke="#2B5E38"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              <Path
                d="M17 11V17M14 14H20"
                stroke="#2B5E38"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text style={styles.emptyStateTitle}>Empty Friend Group</Text>
          <Text style={styles.emptyStateSub}>
            No friends have been added to this group yet. Select another group to view shared schedules.
          </Text>
        </View>
      ) : totalClassesToday === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                stroke="#2B5E38"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M15.5 14L10 17.5V10.5L15.5 14Z"
                fill="#2B5E38"
                opacity={0.7}
              />
            </Svg>
          </View>
          <Text style={styles.emptyStateTitle}>No Classes Scheduled</Text>
          <Text style={styles.emptyStateSub}>
            All {friends.length} members are completely free on this day!
          </Text>
        </View>
      ) : (
        /* ================= 3. TIMELINE & CALENDAR GRID ================= */
        <View style={styles.timelineGridWrapper}>
          {/* Left Column: Vertical Time Axis (8 AM - 6 PM) */}
          <View style={styles.timeAxisColumn}>
            {TIMELINE_HOURS.map((item, index) => (
              <View
                key={item.hour}
                style={[
                  styles.timeAxisItem,
                  { top: index * HOUR_HEIGHT - 7 },
                ]}
              >
                <Text style={styles.timeAxisLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Right Area: Grid Lines, Friend Columns, Free Bands, and Blocks */}
          <View
            style={[
              styles.gridContentArea,
              { height: TOTAL_HOURS * HOUR_HEIGHT },
            ]}
          >
            {/* Horizontal Hour Grid Lines */}
            {TIMELINE_HOURS.map((item, index) => (
              <View
                key={`grid-${item.hour}`}
                style={[styles.gridLine, { top: index * HOUR_HEIGHT }]}
              />
            ))}

            {/* Overlapping All-Free Bands (Architectural slot for SS-04) */}
            {highlightFreeWindows &&
              allFreeWindows.map((fw) => {
                const top = (fw.startHour - START_HOUR) * HOUR_HEIGHT;
                const height = (fw.endHour - fw.startHour) * HOUR_HEIGHT;
                return (
                  <View
                    key={fw.id}
                    style={[
                      styles.freeWindowBand,
                      {
                        top,
                        height,
                      },
                    ]}
                  >
                    <View style={styles.freeBandBadgeRow}>
                      <View style={styles.allFreePill}>
                        <Svg
                          width={11}
                          height={11}
                          viewBox="0 0 24 24"
                          fill="none"
                          style={{ marginRight: 4 }}
                        >
                          <Path
                            d="M20 6L9 17L4 12"
                            stroke="#FFFFFF"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                        <Text style={styles.allFreePillText}>{fw.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.freeBandTimeText}>{fw.timeRange}</Text>
                  </View>
                );
              })}

            {/* Partial Free Pills (e.g. "3 of 4") (Architectural slot for SS-04) */}
            {highlightFreeWindows &&
              partialWindows.map((pfw) => {
                const top = (pfw.startHour - START_HOUR) * HOUR_HEIGHT + 4;
                return (
                  <View
                    key={pfw.id}
                    style={[styles.partialFreePillContainer, { top }]}
                  >
                    <View style={styles.partialFreePill}>
                      <Text style={styles.partialFreePillText}>
                        {pfw.label}
                      </Text>
                    </View>
                  </View>
                );
              })}

            {/* Friend Columns with Schedule Tiles */}
            <View style={styles.columnsContainer}>
              {friends.map((friend) => {
                const schedule = friend.scheduleByDate[dateKey] || [];
                return (
                  <View key={`col-${friend.id}`} style={styles.friendColumn}>
                    {schedule.map((item) => {
                      if (!item.isBusy) return null;

                      const clampedStart = Math.max(START_HOUR, item.startHour);
                      const clampedEnd = Math.min(END_HOUR, item.endHour);
                      const duration = Math.max(0.5, clampedEnd - clampedStart);

                      const blockTop =
                        (clampedStart - START_HOUR) * HOUR_HEIGHT + 2;
                      const blockHeight = duration * HOUR_HEIGHT - 4;

                      const palette =
                        GREEN_TILE_PALETTES[item.colorVariant || 'forest'];

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.scheduleTile,
                            {
                              top: blockTop,
                              height: blockHeight,
                              backgroundColor: palette.bg,
                              borderLeftColor: palette.border,
                            },
                          ]}
                          onPress={() =>
                            onScheduleItemPress?.(item, friend)
                          }
                          activeOpacity={0.8}
                          accessibilityLabel={`${item.title}, ${
                            item.timeRange || `${item.startTime} to ${item.endTime}`
                          }`}
                        >
                          {/* Tile Title Row with Optional Lock */}
                          <View style={styles.tileTitleRow}>
                            {item.isPrivate && (
                              <Svg
                                width={10}
                                height={10}
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ marginRight: 3 }}
                              >
                                <Rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  stroke={palette.title}
                                  strokeWidth="2.5"
                                />
                                <Path
                                  d="M7 11V7a5 5 0 0 1 10 0v4"
                                  stroke={palette.title}
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </Svg>
                            )}
                            <Text
                              style={[
                                styles.tileTitle,
                                { color: palette.title },
                              ]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                          </View>

                          {/* Time Range */}
                          <Text
                            style={[
                              styles.tileTimeRange,
                              { color: palette.time },
                            ]}
                            numberOfLines={1}
                          >
                            {item.timeRange ||
                              `${item.startTime}–${item.endTime}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>

            {/* Current Time Indicator Line (e.g. 10:15 AM) */}
            {showCurrentTimeIndicator && (
              <View
                style={[
                  styles.currentTimeLineContainer,
                  { top: currentTimeTop },
                ]}
              >
                <View style={styles.currentTimeKnob} />
                <View style={styles.currentTimeLine} />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    paddingHorizontal: 12,
    marginTop: 6,
    paddingBottom: 20,
  },

  /* 1. Friends Header Row */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeAxisSpacer: {
    width: 44,
  },
  friendHeadersContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  friendHeaderCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#566859',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  friendNameText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#16251A',
    letterSpacing: -0.2,
  },
  lockIcon: {
    marginTop: 1,
  },

  /* 2. Timeline Grid Layout */
  timelineGridWrapper: {
    flexDirection: 'row',
    position: 'relative',
  },
  timeAxisColumn: {
    width: 44,
    position: 'relative',
    marginRight: 4,
  },
  timeAxisItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'flex-start',
  },
  timeAxisLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#556858',
    letterSpacing: 0.1,
  },
  gridContentArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE5DD',
  },

  /* 3. Free Period Bands & Indicators (Architectural Context for SS-04) */
  freeWindowBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(215, 239, 222, 0.55)',
    borderLeftWidth: 3.5,
    borderLeftColor: '#354839',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    zIndex: 1,
  },
  freeBandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allFreePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4C5D50',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  allFreePillText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  freeBandTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1A291E',
    marginTop: 4,
  },
  partialFreePillContainer: {
    position: 'absolute',
    left: 10,
    zIndex: 3,
  },
  partialFreePill: {
    backgroundColor: '#E4ECE2',
    borderWidth: 1,
    borderColor: '#C6D6C4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  partialFreePillText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#344737',
  },

  /* 4. Multi-Friend Columns & Green Schedule Tiles */
  columnsContainer: {
    flexDirection: 'row',
    height: '100%',
    zIndex: 2,
  },
  friendColumn: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 2,
  },
  scheduleTile: {
    position: 'absolute',
    left: 1,
    right: 1,
    borderRadius: 9,
    borderLeftWidth: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#172B1B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(23,43,27,0.08)',
      },
    }),
  },
  tileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  tileTimeRange: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    marginTop: 2,
  },

  /* 5. Current Time Indicator */
  currentTimeLineContainer: {
    position: 'absolute',
    left: -6,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
  },
  currentTimeKnob: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#354839',
  },
  currentTimeLine: {
    flex: 1,
    height: 1.8,
    backgroundColor: '#354839',
  },

  /* 6. Empty State */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    backgroundColor: '#EFF3EC',
    borderRadius: 18,
    marginHorizontal: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBE7DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#152419',
    marginBottom: 4,
  },
  emptyStateSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#55695A',
    textAlign: 'center',
    lineHeight: 18,
  },
});

