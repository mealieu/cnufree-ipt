import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import {
  NotificationItem,
  NotificationFilterMode,
  NotificationScreenStatus,
  FeedbackToastConfig,
  ValidationErrorItem,
  NotificationsScreenProps,
} from '../types/notifications';
import { FriendAvailability } from '../types/dashboard';
import {
  INITIAL_NOTIFICATIONS,
  getFilteredNotifications,
  groupNotificationsByTime,
  getUnreadNotificationCount,
  validateUserInteractionInput,
} from '../mock/notificationsData';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NotificationStateView } from '../components/notifications/NotificationStateView';
import { ConfirmDialogModal } from '../components/notifications/ConfirmDialogModal';
import { FeedbackToast } from '../components/notifications/FeedbackToast';
import { ValidationErrorBanner } from '../components/notifications/ValidationErrorBanner';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { FriendScheduleScreen } from './FriendScheduleScreen';
import { ReceivedFriendRequestsScreen } from './ReceivedFriendRequestsScreen';
import { FriendSearchScreen } from './FriendSearchScreen';

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateTab,
  onUnreadCountChange,
  onOpenFriendRequests,
  onOpenFindFriends,
  onOpenFriendSchedule,
}) => {
  // 1. Notifications Collection State (NS-01)
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  // 2. Filter Mode ('all' | 'unread') (NS-01)
  const [filterMode, setFilterMode] = useState<NotificationFilterMode>('all');

  // 3. Screen Status ('loaded' | 'loading' | 'empty' | 'error') (NS-02)
  const [screenStatus, setScreenStatus] =
    useState<NotificationScreenStatus>('loaded');

  // 4. Pull-to-refresh State
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 5. Navigation Target Sub-Screens (NS-01 navigation to relevant screens)
  const [viewingFriendSchedule, setViewingFriendSchedule] =
    useState<FriendAvailability | null>(null);
  const [isViewingFriendRequests, setIsViewingFriendRequests] =
    useState<boolean>(false);
  const [isViewingFindFriends, setIsViewingFindFriends] =
    useState<boolean>(false);

  // 6. Reusable Feedback Toast State (NS-03 / UI-57)
  const [activeToast, setActiveToast] = useState<FeedbackToastConfig | null>(
    null
  );

  // 7. Reusable Validation Error State (NS-03)
  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorItem[]
  >([]);

  // 8. Reusable Confirmation Dialog State (NS-03 / UI-57)
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    mode: 'block_user' | 'accept_request' | 'clear_all';
    targetNotification: NotificationItem | null;
    isSubmitting: boolean;
  }>({
    visible: false,
    mode: 'block_user',
    targetNotification: null,
    isSubmitting: false,
  });

  // Timers for clean resource management
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Show reusable toast helper (NS-03)
  const showToast = useCallback(
    (
      config: Omit<FeedbackToastConfig, 'id'>,
      autoDismissMs: number = 4200
    ) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setActiveToast({
        ...config,
        id: `toast-${Date.now()}`,
      });
      if (autoDismissMs > 0) {
        toastTimerRef.current = setTimeout(() => {
          setActiveToast(null);
        }, autoDismissMs);
      }
    },
    []
  );

  // Unread notifications count (syncs with BottomNavBar badge)
  const unreadCount = useMemo(() => {
    if (screenStatus === 'empty') {
      return 0;
    }
    return getUnreadNotificationCount(notifications);
  }, [notifications, screenStatus]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Filtered notifications according to 'all' vs 'unread'
  const filteredNotifications = useMemo(() => {
    return getFilteredNotifications(notifications, filterMode);
  }, [notifications, filterMode]);

  // Chronologically grouped notifications ('TODAY', 'YESTERDAY', 'EARLIER')
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(filteredNotifications);
  }, [filteredNotifications]);

  // Whether "Mark all read" is disabled
  const isMarkAllDisabled =
    screenStatus !== 'loaded' ||
    unreadCount === 0 ||
    filteredNotifications.length === 0;

  // Toggle single notification read/unread status (NS-01)
  const handleToggleRead = useCallback(
    (target: NotificationItem) => {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === target.id ? { ...item, isRead: !item.isRead } : item
        )
      );
    },
    []
  );

  // Mark all notifications as read (NS-01 & NS-03 feedback)
  const handleMarkAllRead = useCallback(() => {
    const errors = validateUserInteractionInput({
      actionType: 'mark_all_read',
      unreadCount,
    });
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    showToast({
      variant: 'success',
      title: 'All notifications marked as read',
      message: 'Your notification inbox is completely up to date.',
    });
  }, [unreadCount, showToast]);

  // Handle pressing a notification card: marks as read & navigates to relevant screen (NS-01)
  const handlePressNotification = useCallback(
    (item: NotificationItem) => {
      setValidationErrors([]);

      // Mark notification as read on tap
      if (!item.isRead) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      }

      // 1. Incoming friend request -> open confirmation or Friend Requests screen
      if (item.category === 'friend_request') {
        if (item.actorName === 'Jay N. Ty') {
          // For Jay N. Ty, allow testing the UI-57 "Block this user?" dialog or Friend Requests screen
          setDialogState({
            visible: true,
            mode: 'block_user',
            targetNotification: item,
            isSubmitting: false,
          });
          return;
        }

        if (onOpenFriendRequests) {
          onOpenFriendRequests();
          return;
        }
        setIsViewingFriendRequests(true);
        return;
      }

      // 2. Accepted friend request -> show toast & open friend's schedule
      if (item.category === 'request_accepted') {
        if (item.linkedFriendProfile) {
          if (onOpenFriendSchedule) {
            onOpenFriendSchedule(item.linkedFriendProfile);
            return;
          }
          setViewingFriendSchedule(item.linkedFriendProfile);
        }
        return;
      }

      // 3. Private / No-access schedule update -> validate permission & navigate to restricted schedule view
      if (item.category === 'no_access') {
        const errors = validateUserInteractionInput({
          actionType: 'schedule_access',
          notification: item,
        });
        setValidationErrors(errors);

        if (item.linkedFriendProfile) {
          if (onOpenFriendSchedule) {
            onOpenFriendSchedule(item.linkedFriendProfile);
            return;
          }
          setViewingFriendSchedule(item.linkedFriendProfile);
        }
        return;
      }

      // 4. Permitted friend schedule update -> navigate directly to FriendScheduleScreen
      if (item.linkedFriendProfile) {
        if (onOpenFriendSchedule) {
          onOpenFriendSchedule(item.linkedFriendProfile);
          return;
        }
        setViewingFriendSchedule(item.linkedFriendProfile);
      }
    },
    [onOpenFriendRequests, onOpenFriendSchedule]
  );

  // Confirm Dialog primary action handler (NS-03 / UI-57)
  const handleConfirmDialogAction = useCallback(() => {
    const target = dialogState.targetNotification;
    setDialogState((prev) => ({ ...prev, isSubmitting: true }));

    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = setTimeout(() => {
      if (dialogState.mode === 'block_user' && target) {
        setNotifications((prev) => prev.filter((n) => n.id !== target.id));
        showToast({
          variant: 'success',
          title: 'User blocked',
          message: `${target.actorName} can no longer view your schedule or send requests.`,
        });
      } else if (dialogState.mode === 'accept_request' && target) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === target.id
              ? {
                  ...n,
                  isRead: true,
                  category: 'request_accepted',
                  actionText: 'accepted your friend request',
                  detailText: `${target.actorUsername} · Now in your Friends`,
                  badgeLabel: 'Accepted',
                }
              : n
          )
        );
        showToast({
          variant: 'success',
          title: 'Friend request accepted',
          message: `${target.actorName} is now in your Friends.`,
        });
      }

      setDialogState({
        visible: false,
        mode: 'block_user',
        targetNotification: null,
        isSubmitting: false,
      });
    }, 350);
  }, [dialogState, showToast]);

  // Retry handler from Error state (NS-02 / UI-54)
  const handleRetryLoading = useCallback(() => {
    setScreenStatus('loading');
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    loadingTimerRef.current = setTimeout(() => {
      setNotifications(INITIAL_NOTIFICATIONS);
      setScreenStatus('loaded');
      showToast({
        variant: 'success',
        title: 'Notifications reloaded',
        message: 'Your latest requests and schedule updates are up to date.',
      });
    }, 850);
  }, [showToast]);

  // Find Friends handler from Empty state (NS-02 / UI-54)
  const handleFindFriends = useCallback(() => {
    if (onOpenFindFriends) {
      onOpenFindFriends();
      return;
    }
    setIsViewingFindFriends(true);
  }, [onOpenFindFriends]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    loadingTimerRef.current = setTimeout(() => {
      setRefreshing(false);
      if (screenStatus === 'error') {
        setScreenStatus('loaded');
      }
    }, 550);
  }, [screenStatus]);

  // Trigger exact UI-57 (NS-03) Dialog + Toast preview state
  const handleActivateUI57Preview = useCallback(() => {
    setScreenStatus('loaded');
    setFilterMode('all');
    setNotifications(INITIAL_NOTIFICATIONS);
    const jayNotification =
      INITIAL_NOTIFICATIONS.find((n) => n.actorName === 'Jay N. Ty') ||
      INITIAL_NOTIFICATIONS[1];

    setDialogState({
      visible: true,
      mode: 'block_user',
      targetNotification: jayNotification,
      isSubmitting: false,
    });

    showToast(
      {
        variant: 'success',
        title: 'Friend request accepted',
        message: 'Lalah Mohb is now in your Friends.',
      },
      0 // Keep visible while previewing UI-57
    );
  }, [showToast]);

  // Sub-screen navigation: Individual Friend Schedule (UI-30 / UI-31)
  if (viewingFriendSchedule) {
    return (
      <FriendScheduleScreen
        friend={viewingFriendSchedule}
        onBack={() => setViewingFriendSchedule(null)}
        onNavigateTab={(tab) => {
          setViewingFriendSchedule(null);
          onNavigateTab?.(tab);
        }}
        sourceScreen="friends"
      />
    );
  }

  // Sub-screen navigation: Received Friend Requests (FS-04 / FS-05)
  if (isViewingFriendRequests) {
    return (
      <ReceivedFriendRequestsScreen
        onBack={() => setIsViewingFriendRequests(false)}
        onNavigateTab={(tab) => {
          setIsViewingFriendRequests(false);
          onNavigateTab?.(tab);
        }}
        onAcceptRequest={(requestId, newFriend) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.linkedFriendRequest?.id === requestId
                ? {
                    ...n,
                    isRead: true,
                    category: 'request_accepted',
                    actionText: 'accepted your friend request',
                    detailText: `${n.actorUsername} · Now in your Friends`,
                    badgeLabel: 'Accepted',
                  }
                : n
            )
          );
          showToast({
            variant: 'success',
            title: 'Friend request accepted',
            message: `${newFriend?.name || 'Your friend'} is now in your Friends.`,
          });
        }}
      />
    );
  }

  // Sub-screen navigation: Find Friends (FS-02)
  if (isViewingFindFriends) {
    return (
      <FriendSearchScreen
        onBack={() => setIsViewingFindFriends(false)}
        onNavigateTab={(tab) => {
          setIsViewingFindFriends(false);
          onNavigateTab?.(tab);
        }}
      />
    );
  }

  const shouldShowEmptyView =
    screenStatus === 'empty' ||
    (screenStatus === 'loaded' && filteredNotifications.length === 0);

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
            onRefresh={handleRefresh}
            tintColor={COLORS.darkGreen}
            colors={[COLORS.darkGreen]}
          />
        }
      >
        {/* ================= 1. TOP HEADER (UI-49 to 54) ================= */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (onBack) {
                onBack();
              } else {
                onNavigateTab?.('home');
              }
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19L8 12L15 5"
                stroke="#4F6352"
                strokeWidth={2.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              Requests and schedule updates
            </Text>
          </View>

          <View style={styles.headerRightSpacer} />
        </View>

        {/* Full-Width Horizontal Divider Line */}
        <View style={styles.headerDivider} />

        <View style={styles.contentContainer}>
          {/* ================= 2. FILTER TOGGLE & MARK ALL READ ROW ================= */}
          <View style={styles.controlsRow}>
            {/* All | Unread Segmented Pill Toggle */}
            <View style={styles.filterToggleTrack}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterMode === 'all' && styles.filterOptionActive,
                ]}
                onPress={() => setFilterMode('all')}
                activeOpacity={0.85}
                accessibilityRole="tab"
                accessibilityState={{ selected: filterMode === 'all' }}
                accessibilityLabel="All notifications"
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterMode === 'all'
                      ? styles.filterOptionTextActive
                      : styles.filterOptionTextInactive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterMode === 'unread' && styles.filterOptionActive,
                ]}
                onPress={() => setFilterMode('unread')}
                activeOpacity={0.85}
                accessibilityRole="tab"
                accessibilityState={{ selected: filterMode === 'unread' }}
                accessibilityLabel="Unread notifications"
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterMode === 'unread'
                      ? styles.filterOptionTextActive
                      : styles.filterOptionTextInactive,
                  ]}
                >
                  Unread
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mark all read Button */}
            <TouchableOpacity
              style={[
                styles.markAllReadButton,
                isMarkAllDisabled && styles.markAllReadButtonDisabled,
              ]}
              onPress={handleMarkAllRead}
              activeOpacity={isMarkAllDisabled ? 1 : 0.78}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              accessibilityState={{ disabled: isMarkAllDisabled }}
            >
              <Text
                style={[
                  styles.markAllReadText,
                  isMarkAllDisabled && styles.markAllReadTextDisabled,
                ]}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reusable Validation Error Banner (NS-03) */}
          <ValidationErrorBanner
            errors={validationErrors}
            onDismiss={() => setValidationErrors([])}
          />

          {/* ================= 3. MAIN NOTIFICATIONS BOARD CONTAINER ================= */}
          <View style={styles.boardContainer}>
            {screenStatus === 'loading' ? (
              <NotificationStateView
                status="loading"
                filterMode={filterMode}
                onRetry={handleRetryLoading}
                onFindFriends={handleFindFriends}
              />
            ) : screenStatus === 'error' ? (
              <NotificationStateView
                status="error"
                filterMode={filterMode}
                onRetry={handleRetryLoading}
                onFindFriends={handleFindFriends}
              />
            ) : shouldShowEmptyView ? (
              <NotificationStateView
                status="empty"
                filterMode={filterMode}
                onRetry={handleRetryLoading}
                onFindFriends={handleFindFriends}
                onShowAllNotifications={() => setFilterMode('all')}
              />
            ) : (
              <View>
                {/* TODAY Section */}
                {groupedNotifications.TODAY.length > 0 && (
                  <View style={styles.timeGroupSection}>
                    <Text style={styles.timeGroupHeader}>TODAY</Text>
                    {groupedNotifications.TODAY.map((item) => (
                      <NotificationCard
                        key={item.id}
                        notification={item}
                        onPress={handlePressNotification}
                        onToggleRead={handleToggleRead}
                      />
                    ))}
                  </View>
                )}

                {/* YESTERDAY Section */}
                {groupedNotifications.YESTERDAY.length > 0 && (
                  <View style={styles.timeGroupSection}>
                    <Text style={styles.timeGroupHeader}>YESTERDAY</Text>
                    {groupedNotifications.YESTERDAY.map((item) => (
                      <NotificationCard
                        key={item.id}
                        notification={item}
                        onPress={handlePressNotification}
                        onToggleRead={handleToggleRead}
                      />
                    ))}
                  </View>
                )}

                {/* EARLIER Section Header (Matches UI-49 to 53 bottom section label) */}
                <View style={styles.earlierSection}>
                  <Text style={styles.timeGroupHeader}>EARLIER</Text>
                  {groupedNotifications.EARLIER.map((item) => (
                    <NotificationCard
                      key={item.id}
                      notification={item}
                      onPress={handlePressNotification}
                      onToggleRead={handleToggleRead}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ================= 5. REUSABLE CONFIRMATION DIALOG (NS-03 / UI-57) ================= */}
      <ConfirmDialogModal
        visible={dialogState.visible}
        title={
          dialogState.mode === 'block_user'
            ? 'Block this user?'
            : 'Accept friend request?'
        }
        description={
          dialogState.mode === 'block_user'
            ? "They won't be able to see your schedule or send you friend requests."
            : 'They will be added to your connected friends and able to view your shared availability.'
        }
        confirmLabel={dialogState.mode === 'block_user' ? 'Block' : 'Accept'}
        cancelLabel="Cancel"
        userPreview={
          dialogState.targetNotification
            ? {
                name: dialogState.targetNotification.actorName,
                username: dialogState.targetNotification.actorUsername,
                mutualFriendsCount:
                  dialogState.targetNotification.mutualFriendsCount,
                initials: dialogState.targetNotification.actorInitials,
              }
            : undefined
        }
        isSubmitting={dialogState.isSubmitting}
        onConfirm={handleConfirmDialogAction}
        onCancel={() =>
          setDialogState((prev) => ({
            ...prev,
            visible: false,
          }))
        }
      />

      {/* ================= 6. REUSABLE FLOATING SUCCESS / FEEDBACK TOAST (NS-03 / UI-57) ================= */}
      <FeedbackToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* ================= 7. BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar
        activeTab="notifications"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
        }}
        notificationBadgeCount={unreadCount > 0 ? unreadCount : 3}
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
    paddingBottom: 110,
  },

  /* 1. Header Section (UI-49 to 54) */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    color: COLORS.notifHeaderGreen,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#1E2A21',
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 34,
  },
  headerDivider: {
    height: 1.2,
    backgroundColor: COLORS.notifDividerLine,
    width: '100%',
  },

  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  /* 2. Controls Row (All | Unread & Mark all read) */
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 12,
  },
  filterToggleTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.notifToggleTrackBg,
    borderRadius: 24,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.16)',
      },
    }),
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionActive: {
    backgroundColor: COLORS.notifToggleActiveBg,
    borderWidth: 1.4,
    borderColor: '#FFFFFF',
  },
  filterOptionText: {
    fontSize: 13.5,
  },
  filterOptionTextActive: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  filterOptionTextInactive: {
    fontFamily: FONTS.medium,
    color: '#E9EFEA',
  },

  markAllReadButton: {
    backgroundColor: '#CFEAD6',
    borderWidth: 1.2,
    borderColor: '#748C78',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadButtonDisabled: {
    backgroundColor: '#DEE6DC',
    borderColor: '#9FB0A1',
    opacity: 0.65,
  },
  markAllReadText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#121F15',
  },
  markAllReadTextDisabled: {
    color: '#6C7D6F',
  },

  /* 3. Main Notifications Board Container */
  boardContainer: {
    backgroundColor: COLORS.notifBoardBg,
    borderWidth: 1.4,
    borderColor: COLORS.notifBoardBorder,
    borderRadius: 10,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    minHeight: 485,
  },
  timeGroupSection: {
    marginBottom: 6,
  },
  earlierSection: {
    marginTop: 2,
  },
  timeGroupHeader: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.notifSectionHeader,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* 4. Quick State Preview Bar */
  statePreviewBar: {
    marginTop: 14,
    paddingHorizontal: 18,
  },
  statePreviewLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#526455',
    marginBottom: 6,
    marginLeft: 2,
  },
  statePreviewPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  statePill: {
    backgroundColor: '#E4EAD9',
    borderWidth: 1,
    borderColor: '#98AA9A',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  statePillActive: {
    backgroundColor: '#384637',
    borderColor: '#384637',
  },
  statePillText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#233427',
  },
  statePillTextActive: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
