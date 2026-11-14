import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import {
  WeeklySharedCalendarProps,
  SharedCalendarFriend,
  ScheduleColorVariant,
} from '../../types/sharedSchedule';
import {
  formatDateKey,
  getWeekDaysForDate,
  calculateWeeklyAvailabilityRows,
  getFriendScheduleForDateKey,
} from '../../mock/sharedScheduleData';

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

export const WeeklySharedCalendar: React.FC<WeeklySharedCalendarProps> = ({
  currentDate,
  onSelectDate,
  friends,
  layoutMode,
  onLayoutModeChange,
  onFriendPress,
  onScheduleItemPress,
  onOpenDayView,
}) => {
  const [selectedFriendFilterId, setSelectedFriendFilterId] = useState<
    string | 'all'
  >('all');

  const selectedDateKey = useMemo(
    () => formatDateKey(currentDate),
    [currentDate]
  );

  // 7 days of the week (Mon - Sun) for currentDate
  const weekDays = useMemo(
    () => getWeekDaysForDate(currentDate),
    [currentDate]
  );

  // Weekly availability rows & total common windows across the week
  const { rows: weeklyRows, totalWeekWindows } = useMemo(
    () => calculateWeeklyAvailabilityRows(friends, weekDays),
    [friends, weekDays]
  );

  // Selected day's availability row
  const activeDayRow = useMemo(() => {
    return (
      weeklyRows.find((r) => r.day.dateKey === selectedDateKey) ||
      weeklyRows[0]
    );
  }, [weeklyRows, selectedDateKey]);

  // Filtered friends for the Multi-Person Weekly Calendar view
  const displayedFriends = useMemo(() => {
    if (selectedFriendFilterId === 'all') {
      return friends;
    }
    return friends.filter((f) => f.id === selectedFriendFilterId);
  }, [friends, selectedFriendFilterId]);

  const summaryBannerText = useMemo(() => {
    if (friends.length === 0) {
      return 'No friends in this group';
    }
    if (totalWeekWindows === 0) {
      return `No common free windows this week`;
    }
    return `All ${friends.length} free · ${totalWeekWindows} ${
      totalWeekWindows === 1 ? 'window' : 'windows'
    } this week`;
  }, [friends.length, totalWeekWindows]);

  // Empty state if group has 0 friends
  if (friends.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconCircle}>
          <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
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
          No friends have been added to this group yet. Select another group to
          view weekly shared schedules.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= 1. WEEKLY COMMON FREE-TIME SUMMARY BANNER (UI-27/28) ================= */}
      <View style={styles.summaryBannerWrapper}>
        <TouchableOpacity
          style={styles.summaryBanner}
          onPress={() =>
            onLayoutModeChange(
              layoutMode === 'common-timeline'
                ? 'multi-person'
                : 'common-timeline'
            )
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${summaryBannerText}. Tap to switch weekly layout`}
        >
          <View style={styles.summaryLeftRow}>
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              style={styles.summaryCheckIcon}
            >
              <Path
                d="M20 6L9 17L4 12"
                stroke="#253A2A"
                strokeWidth={2.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.summaryBannerText} numberOfLines={1}>
              {summaryBannerText}
            </Text>
          </View>

          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18L15 12L9 6"
              stroke="#3B4D3F"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* ================= 2. 7-DAY WEEK STRIP SELECTOR (Mon 19 – Sun 25) ================= */}
      <View style={styles.weekStripContainer}>
        {weekDays.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;
          return (
            <TouchableOpacity
              key={day.dateKey}
              style={styles.weekDayColumn}
              onPress={() => onSelectDate(day.date)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${day.dayShort} ${day.dayNumber}`}
            >
              <Text
                style={[
                  styles.weekDayAbbrev,
                  isSelected && styles.weekDayAbbrevSelected,
                ]}
              >
                {day.dayShort}
              </Text>
              <View
                style={[
                  styles.weekDayNumberCircle,
                  isSelected && styles.weekDayNumberCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.weekDayNumberText,
                    isSelected && styles.weekDayNumberTextSelected,
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= 3A. COMMON-AVAILABILITY TIMELINE LAYOUT (UI-27, UI-28) ================= */}
      {layoutMode === 'common-timeline' ? (
        <>
          <View style={styles.timelineRowsList}>
            {weeklyRows.map((row) => {
              const isSelected = row.day.dateKey === selectedDateKey;

              return (
                <TouchableOpacity
                  key={row.day.dateKey}
                  style={[
                    styles.timelineDayRow,
                    isSelected && styles.timelineDayRowSelected,
                  ]}
                  onPress={() => {
                    if (isSelected && onOpenDayView) {
                      onOpenDayView(row.day.date);
                    } else {
                      onSelectDate(row.day.date);
                    }
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.day.rowLabel}, ${row.windowLabel}`}
                >
                  {/* Left active indicator bar when selected */}
                  {isSelected && <View style={styles.selectedRowLeftAccent} />}

                  {/* Day & Date Label (e.g. "Mon 19") */}
                  <Text
                    style={[
                      styles.rowDayLabel,
                      isSelected && styles.rowDayLabelSelected,
                    ]}
                  >
                    {row.day.rowLabel}
                  </Text>

                  {/* Segmented Horizontal Availability Timeline Bar */}
                  <View style={styles.timelineBarTrack}>
                    {row.segments.map((seg) => (
                      <View
                        key={seg.id}
                        style={[
                          styles.timelineSegment,
                          { flex: seg.durationRatio },
                          seg.status === 'all-free'
                            ? styles.segmentAllFree
                            : seg.status === 'some-free'
                              ? styles.segmentSomeFree
                              : styles.segmentBusy,
                        ]}
                      />
                    ))}
                  </View>

                  {/* Right Window Count + Chevron */}
                  <TouchableOpacity
                    style={styles.rowRightInfo}
                    onPress={() => {
                      onSelectDate(row.day.date);
                      onOpenDayView?.(row.day.date);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.rowWindowText,
                        !row.hasOverlap && styles.rowWindowTextMuted,
                      ]}
                      numberOfLines={1}
                    >
                      {row.windowLabel}
                    </Text>
                    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M9 18L15 12L9 6"
                        stroke="#4B5E4F"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Legend & Alternative Layout Switcher */}
          <View style={styles.footerRow}>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.swatchAllFree]} />
                <Text style={styles.legendLabel}>All free</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.swatchSomeFree]} />
                <Text style={styles.legendLabel}>Some free</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.swatchBusy]} />
                <Text style={styles.legendLabel}>Busy</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.layoutSwitchChip}
              onPress={() => onLayoutModeChange('multi-person')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Switch to Multi-Person Weekly Calendar"
            >
              <Text style={styles.layoutSwitchChipText}>Multi-person view</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* ================= 3B. MULTI-PERSON WEEKLY CALENDAR LAYOUT ================= */
        <View style={styles.multiPersonContainer}>
          {/* Top Bar: Layout Switch back to Common Timeline + Active Day Heading */}
          <View style={styles.multiPersonHeaderRow}>
            <View>
              <Text style={styles.multiPersonDayTitle}>
                {activeDayRow.day.fullLabel}
              </Text>
              <Text style={styles.multiPersonDaySub}>
                {activeDayRow.windowLabel} · Tap any friend or block for details
              </Text>
            </View>

            <TouchableOpacity
              style={styles.layoutSwitchChip}
              onPress={() => onLayoutModeChange('common-timeline')}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Switch to Common-Availability Timeline"
            >
              <Text style={styles.layoutSwitchChipText}>Timeline view</Text>
            </TouchableOpacity>
          </View>

          {/* Friend Filter Pills */}
          <View style={styles.friendPillsRow}>
            <TouchableOpacity
              style={[
                styles.friendFilterPill,
                selectedFriendFilterId === 'all' &&
                  styles.friendFilterPillActive,
              ]}
              onPress={() => setSelectedFriendFilterId('all')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.friendFilterPillText,
                  selectedFriendFilterId === 'all' &&
                    styles.friendFilterPillTextActive,
                ]}
              >
                All ({friends.length})
              </Text>
            </TouchableOpacity>

            {friends.map((friend) => {
              const isSelected = selectedFriendFilterId === friend.id;
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendFilterPill,
                    isSelected && styles.friendFilterPillActive,
                  ]}
                  onPress={() =>
                    setSelectedFriendFilterId(isSelected ? 'all' : friend.id)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.friendFilterPillText,
                      isSelected && styles.friendFilterPillTextActive,
                    ]}
                  >
                    {friend.nickname || friend.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Common Free Windows for the Selected Day in the Week */}
          {activeDayRow.allFreeWindows.length > 0 && (
            <View style={styles.dayCommonWindowsCard}>
              <Text style={styles.dayCommonWindowsLabel}>
                Common Free Windows on {activeDayRow.day.rowLabel}
              </Text>
              <View style={styles.dayCommonPillsWrap}>
                {activeDayRow.allFreeWindows.map((win) => (
                  <View key={win.id} style={styles.commonWinBadge}>
                    <Text style={styles.commonWinBadgeText}>
                      ✓ {win.timeRange} ({win.label})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Multi-Person Weekly Schedule Cards */}
          <View style={styles.multiPersonCardsList}>
            {displayedFriends.map((friend: SharedCalendarFriend) => {
              const dayItems = getFriendScheduleForDateKey(
                friend,
                activeDayRow.day.dateKey
              ).filter((item) => item.isBusy);

              return (
                <View key={friend.id} style={styles.memberWeekCard}>
                  <TouchableOpacity
                    style={styles.memberCardHeader}
                    onPress={() => onFriendPress?.(friend)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {friend.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberNameText}>{friend.name}</Text>
                        {(friend.isPrivate || friend.scheduleState === 'privacy-restricted') && (
                          <Svg
                            width={12}
                            height={12}
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <Rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              stroke="#485B4C"
                              strokeWidth="2.2"
                            />
                            <Path
                              d="M7 11V7a5 5 0 0 1 10 0v4"
                              stroke="#485B4C"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          </Svg>
                        )}
                        {(friend.hasMissingSchedule || friend.scheduleState === 'missing') && (
                          <Svg
                            width={12}
                            height={12}
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <Circle cx="12" cy="12" r="10" stroke="#7E6822" strokeWidth={2} />
                            <Path
                              d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                              stroke="#7E6822"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </Svg>
                        )}
                        {(friend.isUnavailable || friend.scheduleState === 'unavailable') && (
                          <Svg
                            width={12}
                            height={12}
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <Circle cx="12" cy="12" r="10" stroke="#7E6822" strokeWidth={2} />
                            <Path
                              d="M12 16v-4M12 8h.01"
                              stroke="#7E6822"
                              strokeWidth={2.2}
                              strokeLinecap="round"
                            />
                          </Svg>
                        )}
                      </View>
                      <Text style={styles.memberStatusSub}>
                        {friend.isUnavailable || friend.scheduleState === 'unavailable'
                          ? "Couldn't load schedule · Tap to retry"
                          : friend.hasMissingSchedule || friend.scheduleState === 'missing'
                            ? 'Schedule not shared · Tap to request'
                            : friend.isPrivate || friend.scheduleState === 'privacy-restricted'
                              ? 'Shares availability only'
                              : `${dayItems.length} ${
                                  dayItems.length === 1 ? 'class' : 'classes'
                                } on ${activeDayRow.day.rowLabel}`}
                      </Text>
                    </View>

                    {onOpenDayView && (
                      <TouchableOpacity
                        style={styles.openDayGridBtn}
                        onPress={() => onOpenDayView(activeDayRow.day.date)}
                      >
                        <Text style={styles.openDayGridBtnText}>Day grid</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {/* Member's Schedule Blocks on this Day */}
                  {friend.isUnavailable || friend.scheduleState === 'unavailable' ? (
                    <View style={styles.memberEmptyScheduleBox}>
                      <Text style={styles.memberEmptyScheduleText}>
                        Couldn't load schedule for {friend.nickname || friend.name}. Tap card to retry.
                      </Text>
                    </View>
                  ) : friend.hasMissingSchedule || friend.scheduleState === 'missing' ? (
                    <View style={styles.memberEmptyScheduleBox}>
                      <Text style={styles.memberEmptyScheduleText}>
                        No schedule data shared for {friend.nickname || friend.name}. Tap card to ask.
                      </Text>
                    </View>
                  ) : dayItems.length === 0 ? (
                    <View style={styles.memberFreeAllDayBox}>
                      <Text style={styles.memberFreeAllDayText}>
                        ✓ Free all day (8:00 AM – 6:00 PM)
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.memberBlocksRow}>
                      {dayItems.map((item) => {
                        const palette =
                          GREEN_TILE_PALETTES[item.colorVariant || 'forest'];
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.memberScheduleBlock,
                              {
                                backgroundColor: palette.bg,
                                borderLeftColor: palette.border,
                              },
                            ]}
                            onPress={() => onScheduleItemPress?.(item, friend)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.memberBlockTitle,
                                { color: palette.title },
                              ]}
                              numberOfLines={1}
                            >
                              {item.isPrivate ? '🔒 Busy' : item.title}
                            </Text>
                            <Text
                              style={[
                                styles.memberBlockTime,
                                { color: palette.time },
                              ]}
                            >
                              {item.timeRange ||
                                `${item.startTime} – ${item.endTime}`}
                              {item.room && !item.isPrivate
                                ? ` · ${item.room}`
                                : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 18,
  },

  /* 1. Weekly Summary Pill Banner */
  summaryBannerWrapper: {
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 14,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF3EC',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  summaryLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  summaryCheckIcon: {
    marginRight: 10,
  },
  summaryBannerText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#152419',
    letterSpacing: -0.2,
  },

  /* 2. 7-Day Week Strip Selector */
  weekStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekDayAbbrev: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5B7060',
    marginBottom: 6,
  },
  weekDayAbbrevSelected: {
    fontFamily: FONTS.bold,
    color: '#2B3E2F',
  },
  weekDayNumberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNumberCircleSelected: {
    backgroundColor: '#566859',
  },
  weekDayNumberText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#152419',
  },
  weekDayNumberTextSelected: {
    color: '#FFFFFF',
  },

  /* 3A. Common-Availability Timeline Rows (UI-27, UI-28) */
  timelineRowsList: {
    paddingHorizontal: 14,
    gap: 2,
  },
  timelineDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  timelineDayRowSelected: {
    backgroundColor: '#EEF3EC',
    ...Platform.select({
      ios: {
        shadowColor: '#152419',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(21,36,25,0.05)',
      },
    }),
  },
  selectedRowLeftAccent: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#4C5D50',
  },
  rowDayLabel: {
    width: 64,
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#152419',
    letterSpacing: -0.2,
  },
  rowDayLabelSelected: {
    color: '#152419',
  },
  timelineBarTrack: {
    flex: 1,
    height: 15,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#DFE5DE',
    marginHorizontal: 8,
  },
  timelineSegment: {
    height: '100%',
  },
  segmentAllFree: {
    backgroundColor: '#4C5D50',
  },
  segmentSomeFree: {
    backgroundColor: '#D5DDD4',
  },
  segmentBusy: {
    backgroundColor: '#DFE5DE',
  },
  rowRightInfo: {
    width: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  rowWindowText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#152419',
  },
  rowWindowTextMuted: {
    fontFamily: FONTS.medium,
    color: '#5B7060',
  },

  /* Legend & Layout Switcher Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 10,
    borderRadius: 3,
  },
  swatchAllFree: {
    backgroundColor: '#4C5D50',
  },
  swatchSomeFree: {
    backgroundColor: '#ECEFE9',
    borderWidth: 1,
    borderColor: '#9AA99B',
  },
  swatchBusy: {
    backgroundColor: '#D6DDD5',
  },
  legendLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#55695A',
  },
  layoutSwitchChip: {
    backgroundColor: '#E6ECE4',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0DDD0',
  },
  layoutSwitchChipText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#243728',
  },

  /* 3B. Multi-Person Weekly Calendar Layout */
  multiPersonContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  multiPersonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  multiPersonDayTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#152419',
  },
  multiPersonDaySub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#55695A',
    marginTop: 1,
  },
  friendPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },
  friendFilterPill: {
    backgroundColor: '#E6ECE4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  friendFilterPillActive: {
    backgroundColor: '#4C5D50',
  },
  friendFilterPillText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#243728',
  },
  friendFilterPillTextActive: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  dayCommonWindowsCard: {
    backgroundColor: '#EEF3EC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D7E3D5',
  },
  dayCommonWindowsLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#344737',
    marginBottom: 6,
  },
  dayCommonPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  commonWinBadge: {
    backgroundColor: '#D4EFE3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  commonWinBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#13301B',
  },
  multiPersonCardsList: {
    gap: 10,
  },
  memberWeekCard: {
    backgroundColor: '#EEF3EC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#566859',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberNameText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#152419',
  },
  memberStatusSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#55695A',
  },
  openDayGridBtn: {
    backgroundColor: '#E0E8DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  openDayGridBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#243728',
  },
  memberBlocksRow: {
    gap: 6,
  },
  memberScheduleBlock: {
    borderRadius: 8,
    borderLeftWidth: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  memberBlockTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  memberBlockTime: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    marginTop: 2,
  },
  memberFreeAllDayBox: {
    backgroundColor: 'rgba(212, 239, 227, 0.55)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  memberFreeAllDayText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#1A5A31',
  },
  memberEmptyScheduleBox: {
    backgroundColor: '#E5EBE3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  memberEmptyScheduleText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#55695A',
  },

  /* Empty Group State */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 46,
    paddingHorizontal: 24,
    backgroundColor: '#EFF3EC',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
