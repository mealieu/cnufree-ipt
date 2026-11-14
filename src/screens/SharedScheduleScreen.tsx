import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';
import {
  SharedCalendarFriend,
  SharedFriendGroup,
  SharedScheduleItem,
  SharedViewMode,
  WeeklyCalendarLayoutMode,
  SharedScheduleScreenProps,
  OverlappingFreeWindow,
} from '../types/sharedSchedule';
import {
  MOCK_TODAY_DATE,
  SHARED_FRIEND_GROUPS,
  formatDateKey,
  calculateOverlappingWindows,
  formatWeekNavigationRange,
} from '../mock/sharedScheduleData';
import { SharedDateNavigation } from '../components/sharedSchedule/SharedDateNavigation';
import { SharedViewModeToggle } from '../components/sharedSchedule/SharedViewModeToggle';
import { SharedGroupFilter } from '../components/sharedSchedule/SharedGroupFilter';
import { SharedFreeWindowBanner } from '../components/sharedSchedule/SharedFreeWindowBanner';
import { DailySharedCalendar } from '../components/sharedSchedule/DailySharedCalendar';
import { WeeklySharedCalendar } from '../components/sharedSchedule/WeeklySharedCalendar';
import { FriendGroupSelectorModal } from '../components/sharedSchedule/FriendGroupSelectorModal';
import { CommonFreeTimeModal } from '../components/sharedSchedule/CommonFreeTimeModal';
import { FriendScheduleScreen } from './FriendScheduleScreen';

export const SharedScheduleScreen: React.FC<SharedScheduleScreenProps> = ({
  onNavigateTab,
  initialGroupId = 'grp-project-team',
  initialDate = MOCK_TODAY_DATE,
  onViewFriendSchedule,
}) => {
  // 1. Date State
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  // 2. View Mode State ('day' vs 'week') & Weekly Layout Mode ('common-timeline' vs 'multi-person')
  const [viewMode, setViewMode] = useState<SharedViewMode>('day');
  const [weeklyLayoutMode, setWeeklyLayoutMode] =
    useState<WeeklyCalendarLayoutMode>('common-timeline');

  // 3. Friend Group State
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);

  // 4. Free Window Highlight Toggle
  const [highlightFreeWindows, setHighlightFreeWindows] = useState<boolean>(true);

  // 4B. Selected Free Window Modal State (SS-04)
  const [selectedFreeWindow, setSelectedFreeWindow] =
    useState<OverlappingFreeWindow | null>(null);
  const [isEmptyFreeTimeModalOpen, setIsEmptyFreeTimeModalOpen] =
    useState<boolean>(false);

  // 5. Selected Schedule Item Modal State
  const [selectedItemModal, setSelectedItemModal] = useState<{
    item: SharedScheduleItem;
    friend: SharedCalendarFriend;
  } | null>(null);

  // 6. Selected Friend for Individual Schedule (SS-05)
  const [selectedFriend, setSelectedFriend] =
    useState<SharedCalendarFriend | null>(null);

  const handleOpenFriendSchedule = useCallback(
    (friend: SharedCalendarFriend) => {
      if (onViewFriendSchedule) {
        onViewFriendSchedule(friend);
      } else {
        setSelectedFriend(friend);
      }
    },
    [onViewFriendSchedule]
  );

  // 7. Pull to Refresh State
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Active Group
  const activeGroup: SharedFriendGroup = useMemo(() => {
    return (
      SHARED_FRIEND_GROUPS.find((g) => g.id === selectedGroupId) ||
      SHARED_FRIEND_GROUPS[0]
    );
  }, [selectedGroupId]);

  // Current Date Key
  const dateKey = useMemo(() => formatDateKey(currentDate), [currentDate]);

  // Check if current date is today's reference date
  const isToday = useMemo(() => {
    return formatDateKey(currentDate) === formatDateKey(MOCK_TODAY_DATE);
  }, [currentDate]);

  // Check if current week matches reference week
  const isCurrentWeek = useMemo(() => {
    return formatWeekNavigationRange(currentDate).isCurrentWeek;
  }, [currentDate]);

  // Overlapping Free Windows for current date and friends
  const { allFreeWindows, partialWindows } = useMemo(() => {
    return calculateOverlappingWindows(activeGroup.members, dateKey);
  }, [activeGroup.members, dateKey]);

  const combinedWindows = useMemo(() => {
    return [...allFreeWindows, ...partialWindows];
  }, [allFreeWindows, partialWindows]);

  // Date navigation handlers
  const handlePrevDay = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(MOCK_TODAY_DATE);
  }, []);

  // Weekly navigation handlers (SS-03)
  const handlePrevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const handleThisWeek = useCallback(() => {
    setCurrentDate(MOCK_TODAY_DATE);
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // =========================================================================
  // SS-05: INDIVIDUAL FRIEND SCHEDULE SCREEN NAVIGATION
  // =========================================================================
  if (selectedFriend) {
    return (
      <FriendScheduleScreen
        friend={selectedFriend}
        friendId={selectedFriend.id}
        initialDate={currentDate}
        sourceScreen="shared"
        onBack={() => setSelectedFriend(null)}
        onNavigateTab={(tab) => {
          setSelectedFriend(null);
          onNavigateTab?.(tab);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.darkGreen}
            colors={[COLORS.darkGreen]}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. SCREEN HEADER ================= */}
          <View style={styles.topHeaderRow}>
            <Text style={styles.screenTitle}>Shared Tracker</Text>

            {/* Top Right Group Action Button */}
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={() => {
                // Architectural context: switch or view group info
              }}
              activeOpacity={0.7}
              accessibilityLabel="Shared Tracker Group Info"
              accessibilityRole="button"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="9" cy="8" r="3.2" stroke="#253A2A" strokeWidth={2} />
                <Path
                  d="M2.5 19C2.5 15.5 5 13.5 9 13.5C11.5 13.5 13.2 14.5 14 16.2"
                  stroke="#253A2A"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Circle cx="16.5" cy="9.5" r="2.6" stroke="#253A2A" strokeWidth={2} />
                <Path
                  d="M13.5 19C13.5 16.8 15 15.2 17 15.2C19.2 15.2 21.5 16.5 21.5 19"
                  stroke="#253A2A"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* ================= 2. DATE / WEEK NAVIGATION ================= */}
          <SharedDateNavigation
            currentDate={currentDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
            isToday={isToday}
            viewMode={viewMode}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onThisWeek={handleThisWeek}
            isCurrentWeek={isCurrentWeek}
          />

          {/* ================= 3. DAY / WEEK VIEW TOGGLE ================= */}
          <SharedViewModeToggle
            viewMode={viewMode}
            onViewModeChange={(mode) => setViewMode(mode)}
          />

          {/* ================= 4. FRIEND GROUP FILTER ================= */}
          <SharedGroupFilter
            groups={SHARED_FRIEND_GROUPS}
            selectedGroupId={selectedGroupId}
            onSelectGroup={(g) => setSelectedGroupId(g.id)}
            onOpenSelector={() => setIsGroupModalOpen(true)}
          />

          {/* ================= 5. WEEKLY OR DAILY SHARED CALENDAR ================= */}
          {viewMode === 'week' ? (
            <WeeklySharedCalendar
              currentDate={currentDate}
              onSelectDate={(date) => setCurrentDate(date)}
              friends={activeGroup.members}
              layoutMode={weeklyLayoutMode}
              onLayoutModeChange={(mode) => setWeeklyLayoutMode(mode)}
              onFriendPress={(friend) => handleOpenFriendSchedule(friend)}
              onScheduleItemPress={(item, friend) =>
                setSelectedItemModal({ item, friend })
              }
              onOpenDayView={(date) => {
                setCurrentDate(date);
                setViewMode('day');
              }}
            />
          ) : (
            <>
              {/* ================= 5A. OVERLAPPING FREE WINDOW BANNER (SS-04) ================= */}
              {activeGroup.members.length > 0 && (
                <SharedFreeWindowBanner
                  freeWindows={allFreeWindows}
                  currentDate={currentDate}
                  onPressBanner={() => {
                    if (allFreeWindows.length > 0) {
                      setSelectedFreeWindow(allFreeWindows[0]);
                    } else {
                      setIsEmptyFreeTimeModalOpen(true);
                    }
                  }}
                  isHighlighted={highlightFreeWindows}
                />
              )}

              {/* ================= 6. DAILY SHARED CALENDAR ================= */}
              <DailySharedCalendar
                date={currentDate}
                dateKey={dateKey}
                friends={activeGroup.members}
                overlappingWindows={combinedWindows}
                highlightFreeWindows={highlightFreeWindows}
                selectedWindowId={selectedFreeWindow?.id}
                onFreeWindowPress={(window) => setSelectedFreeWindow(window)}
                onFriendPress={(friend) => handleOpenFriendSchedule(friend)}
                onScheduleItemPress={(item, friend) =>
                  setSelectedItemModal({ item, friend })
                }
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* ================= 7. SCHEDULE ITEM DETAIL MODAL ================= */}
      {selectedItemModal && (
        <Modal
          visible={!!selectedItemModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItemModal(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSelectedItemModal(null)}
          >
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <TouchableOpacity
                  style={styles.detailAvatarBadge}
                  onPress={() => {
                    const targetFriend = selectedItemModal.friend;
                    setSelectedItemModal(null);
                    handleOpenFriendSchedule(targetFriend);
                  }}
                  activeOpacity={0.75}
                  accessibilityLabel={`View ${selectedItemModal.friend.name}'s schedule`}
                  accessibilityRole="button"
                >
                  <Text style={styles.detailAvatarText}>
                    {selectedItemModal.friend.initials}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    const targetFriend = selectedItemModal.friend;
                    setSelectedItemModal(null);
                    handleOpenFriendSchedule(targetFriend);
                  }}
                  activeOpacity={0.75}
                  accessibilityLabel={`View ${selectedItemModal.friend.name}'s schedule`}
                  accessibilityRole="button"
                >
                  <Text style={styles.detailFriendName}>
                    {selectedItemModal.friend.name}'s Schedule
                  </Text>
                  <Text style={styles.detailActivityTitle}>
                    {selectedItemModal.item.isPrivate || selectedItemModal.friend.isPrivate
                      ? 'Busy'
                      : selectedItemModal.item.title}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedItemModal(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="#2E4233"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={styles.detailBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {selectedItemModal.item.timeRange ||
                      `${selectedItemModal.item.startTime} – ${selectedItemModal.item.endTime}`}
                  </Text>
                </View>

                {selectedItemModal.item.room &&
                  !selectedItemModal.item.isPrivate &&
                  !selectedItemModal.friend.isPrivate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>
                        {selectedItemModal.item.room}
                      </Text>
                    </View>
                  )}

                {(selectedItemModal.item.isPrivate || selectedItemModal.friend.isPrivate) && (
                  <View style={styles.privacyNoticeBadge}>
                    <Text style={styles.privacyNoticeText}>
                      🔒 Event titles and rooms are hidden by {selectedItemModal.friend.nickname || selectedItemModal.friend.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action to view individual friend schedule (SS-05) */}
              <TouchableOpacity
                style={styles.viewFriendScheduleButton}
                onPress={() => {
                  const targetFriend = selectedItemModal.friend;
                  setSelectedItemModal(null);
                  handleOpenFriendSchedule(targetFriend);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Open ${selectedItemModal.friend.name}'s full schedule`}
              >
                <Text style={styles.viewFriendScheduleButtonText}>
                  View {selectedItemModal.friend.name}’s Schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setSelectedItemModal(null)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* ================= 8. BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar
        activeTab="shared"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
        }}
        notificationBadgeCount={0}
      />

      {/* ================= 9. FRIEND GROUP SELECTOR BOTTOM SHEET (SS-02) ================= */}
      <FriendGroupSelectorModal
        visible={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={SHARED_FRIEND_GROUPS}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(g) => setSelectedGroupId(g.id)}
      />

      {/* ================= 10. COMMON FREE TIME BOTTOM SHEET MODAL (SS-04) ================= */}
      <CommonFreeTimeModal
        visible={!!selectedFreeWindow || isEmptyFreeTimeModalOpen}
        onClose={() => {
          setSelectedFreeWindow(null);
          setIsEmptyFreeTimeModalOpen(false);
        }}
        window={selectedFreeWindow}
        friends={activeGroup.members}
        date={currentDate}
        isEmptyState={isEmptyFreeTimeModalOpen}
        onSwitchToWeek={() => {
          setSelectedFreeWindow(null);
          setIsEmptyFreeTimeModalOpen(false);
          setViewMode('week');
        }}
        onFriendPress={(friend) => handleOpenFriendSchedule(friend)}
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
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 95,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  /* 1. Screen Header */
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  screenTitle: {
    fontFamily: FONTS.bold,
    fontSize: 27,
    color: '#152419',
    letterSpacing: -0.4,
  },
  topActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6ECE4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Week Placeholder (SS-03 slot) */
  weekPlaceholderCard: {
    backgroundColor: '#EFF3EC',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE7DD',
  },
  weekPlaceholderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DDE8DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  weekPlaceholderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#152419',
    marginBottom: 6,
  },
  weekPlaceholderSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#55695A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  returnToDayButton: {
    backgroundColor: '#1E5830',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  returnToDayText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  /* Modal Details */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 36, 25, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#FAF7EF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderWidth: 1.2,
    borderColor: '#D7E2D5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECE0',
  },
  detailAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4C5D50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  detailAvatarBadgeLarge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4C5D50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarTextLarge: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  detailFriendName: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#55695A',
  },
  detailActivityTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#152419',
    marginTop: 2,
  },
  detailBody: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#475B4C',
    width: 70,
  },
  detailValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#152419',
  },
  privacyNoticeBadge: {
    marginTop: 6,
    backgroundColor: '#E7EFE6',
    padding: 8,
    borderRadius: 8,
  },
  privacyNoticeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#344737',
  },
  viewFriendScheduleButton: {
    backgroundColor: '#26392B',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  viewFriendScheduleButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeModalButton: {
    backgroundColor: '#3F5644',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
