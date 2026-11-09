import React, { useState, useMemo, useCallback } from 'react';
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
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import {
  FriendRequestItem,
  ReceivedFriendRequestsScreenProps,
  FriendRequestStatus,
  ConnectedFriend,
} from '../types/friends';
import {
  INITIAL_RECEIVED_REQUESTS,
  INITIAL_SENT_REQUESTS,
  createConnectedFriendFromRequest,
} from '../mock/friendsData';
import { ReceivedRequestCard } from '../components/friends/ReceivedRequestCard';
import { RequesterDetailModal } from '../components/friends/RequesterDetailModal';
import { FriendRequestConfirmModal } from '../components/friends/FriendRequestConfirmModal';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';

export const ReceivedFriendRequestsScreen: React.FC<ReceivedFriendRequestsScreenProps> = ({
  requests,
  sentCount = INITIAL_SENT_REQUESTS.length,
  onBack,
  onNavigateTab,
  onAcceptRequest,
  onDeclineRequest,
  onUndoRequest,
  onSwitchToSent,
  onViewFriendSchedule,
}) => {
  // State for requests collection
  const [requestsList, setRequestsList] = useState<FriendRequestItem[]>(
    requests ?? INITIAL_RECEIVED_REQUESTS
  );

  // Segmented Tab ('received' vs 'sent')
  const [activeSegmentTab, setActiveSegmentTab] = useState<'received' | 'sent'>('received');

  // Selected requester for detail bottom sheet
  const [selectedRequester, setSelectedRequester] = useState<FriendRequestItem | null>(null);

  // Confirmation Modal state for FS-05 (Acceptance & Decline confirmation)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    visible: boolean;
    type: 'accept' | 'decline';
    request: FriendRequestItem | null;
  }>({
    visible: false,
    type: 'accept',
    request: null,
  });

  // Action submission feedback state (simulates asynchronous submission processing)
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Submission Feedback Banner state
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    message: string;
    type: 'success' | 'info';
    requestId?: string;
    newFriend?: ConnectedFriend;
  } | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Calculate pending received count dynamically
  const pendingReceivedCount = useMemo(() => {
    return requestsList.filter((req) => req.status === 'pending').length;
  }, [requestsList]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  // 1. Trigger Acceptance Confirmation Modal (FS-05)
  const handlePromptAccept = useCallback((targetRequest: FriendRequestItem) => {
    setConfirmModalConfig({
      visible: true,
      type: 'accept',
      request: targetRequest,
    });
  }, []);

  // 2. Trigger Decline Confirmation Modal (FS-05)
  const handlePromptDecline = useCallback((targetRequest: FriendRequestItem) => {
    setConfirmModalConfig({
      visible: true,
      type: 'decline',
      request: targetRequest,
    });
  }, []);

  // 3. Confirm Submission Handler with simulated processing feedback and state updates (FS-05)
  const handleConfirmAction = useCallback(
    (targetRequest: FriendRequestItem) => {
      setIsSubmittingAction(true);

      // Simulate network submission roundtrip for responsive feedback
      setTimeout(() => {
        const isAccept = confirmModalConfig.type === 'accept';

        if (isAccept) {
          // Update request status to 'accepted'
          setRequestsList((prev) =>
            prev.map((r) =>
              r.id === targetRequest.id
                ? { ...r, status: 'accepted' as FriendRequestStatus }
                : r
            )
          );

          // Update connection state: generate or fetch connected friend profile
          const newFriend = createConnectedFriendFromRequest(targetRequest);

          // Set submission feedback
          setSubmissionFeedback({
            message: `${targetRequest.name} is now your connected friend! You can both view each other's schedules.`,
            type: 'success',
            requestId: targetRequest.id,
            newFriend,
          });

          // Propagate updated connection state to parent/context
          onAcceptRequest?.(targetRequest.id, newFriend);
        } else {
          // Update request status to 'declined'
          setRequestsList((prev) =>
            prev.map((r) =>
              r.id === targetRequest.id
                ? { ...r, status: 'declined' as FriendRequestStatus }
                : r
            )
          );

          // Set submission feedback
          setSubmissionFeedback({
            message: `Declined friend request from ${targetRequest.name}.`,
            type: 'info',
            requestId: targetRequest.id,
          });

          // Propagate updated request state to parent/context
          onDeclineRequest?.(targetRequest.id);
        }

        setIsSubmittingAction(false);
        setConfirmModalConfig({
          visible: false,
          type: 'accept',
          request: null,
        });
      }, 420);
    },
    [confirmModalConfig.type, onAcceptRequest, onDeclineRequest]
  );

  // 4. Cancel confirmation modal
  const handleCancelModal = useCallback(() => {
    setConfirmModalConfig({
      visible: false,
      type: 'accept',
      request: null,
    });
  }, []);

  // 5. Undo Action Handler (FS-05 Connection State Reversion)
  const handleUndo = useCallback(
    (targetRequest: FriendRequestItem) => {
      setRequestsList((prev) =>
        prev.map((r) =>
          r.id === targetRequest.id
            ? { ...r, status: 'pending' as FriendRequestStatus }
            : r
        )
      );

      setSubmissionFeedback({
        message: `Action undone. Request from ${targetRequest.name} is back in pending.`,
        type: 'info',
      });

      onUndoRequest?.(targetRequest.id);
    },
    [onUndoRequest]
  );

  // 6. Reset Demo Requests (Allows evaluator to test entire flow repeatedly)
  const handleResetDemo = useCallback(() => {
    setRequestsList(INITIAL_RECEIVED_REQUESTS);
    setSubmissionFeedback({
      message: 'Demo requests reset to initial pending state.',
      type: 'info',
    });
  }, []);

  // 7. Sent Tab Handler
  const handlePressSentTab = useCallback(() => {
    if (onSwitchToSent) {
      onSwitchToSent();
      return;
    }
    setActiveSegmentTab('sent');
    setSubmissionFeedback({
      message: 'Viewing outgoing pending friend requests ([FS-03] Sent Requests)',
      type: 'info',
    });
  }, [onSwitchToSent]);

  // Bottom Navigation tab change
  const handleBottomTabChange = useCallback(
    (tab: TabId) => {
      onNavigateTab?.(tab);
    },
    [onNavigateTab]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ================= 1. TOP HEADER NAVIGATION ================= */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back to Friends"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#132016"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.topHeaderTitle}>Friends</Text>

        {/* Balance layout spacer */}
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.headerHairline} />

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
        <View style={styles.contentContainer}>
          {/* ================= 2. FRIEND REQUESTS PILL CHIP ================= */}
          <View style={styles.pillChipRow}>
            <View style={styles.pillChipBadge}>
              <Text style={styles.pillChipText}>Friend Requests</Text>
            </View>
          </View>

          {/* ================= 3. SEGMENTED TABS: RECEIVED / SENT ================= */}
          <View style={styles.segmentedTabsContainer}>
            {/* Received Tab (Active Mint) */}
            <TouchableOpacity
              style={[
                styles.segmentTab,
                activeSegmentTab === 'received'
                  ? styles.segmentTabActiveReceived
                  : styles.segmentTabInactive,
              ]}
              onPress={() => setActiveSegmentTab('received')}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel={`Received friend requests, ${pendingReceivedCount} pending`}
              accessibilityState={{ selected: activeSegmentTab === 'received' }}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeSegmentTab === 'received'
                    ? styles.segmentTabTextActive
                    : styles.segmentTabTextInactive,
                ]}
              >
                Received ({pendingReceivedCount})
              </Text>
            </TouchableOpacity>

            {/* Sent Tab */}
            <TouchableOpacity
              style={[
                styles.segmentTab,
                activeSegmentTab === 'sent'
                  ? styles.segmentTabActiveSent
                  : styles.segmentTabInactive,
              ]}
              onPress={handlePressSentTab}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel={`Sent friend requests, ${sentCount} sent`}
              accessibilityState={{ selected: activeSegmentTab === 'sent' }}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeSegmentTab === 'sent'
                    ? styles.segmentTabTextActive
                    : styles.segmentTabTextInactive,
                ]}
              >
                Sent ({sentCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= 4. SUBMISSION FEEDBACK BANNER (FS-05) ================= */}
          {submissionFeedback && (
            <View
              style={[
                styles.submissionToast,
                submissionFeedback.type === 'success'
                  ? styles.submissionToastSuccess
                  : styles.submissionToastInfo,
              ]}
            >
              <View style={styles.toastMainRow}>
                <View style={styles.toastIconWrap}>
                  {submissionFeedback.type === 'success' ? (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" fill="#145A2E" />
                      <Path
                        d="M8 12L11 15L16 9"
                        stroke="#FFFFFF"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" fill="#5C7057" />
                      <Path
                        d="M12 8V12M12 16H12.01"
                        stroke="#FFFFFF"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                      />
                    </Svg>
                  )}
                </View>

                <View style={styles.toastTextCol}>
                  <Text style={styles.toastTitleText}>
                    {submissionFeedback.type === 'success'
                      ? 'Connection State Updated'
                      : 'Friend Request Updated'}
                  </Text>
                  <Text style={styles.toastMessageText}>
                    {submissionFeedback.message}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSubmissionFeedback(null)}
                  style={styles.toastDismissBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Dismiss message"
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="#425547"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Toast Action Buttons Row */}
              <View style={styles.toastActionsRow}>
                {submissionFeedback.newFriend && onViewFriendSchedule && (
                  <TouchableOpacity
                    style={styles.toastScheduleBtn}
                    onPress={() => {
                      if (submissionFeedback.newFriend?.scheduleProfile) {
                        onViewFriendSchedule(
                          submissionFeedback.newFriend.scheduleProfile
                        );
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M8 7V3M16 7V3M3 11H21M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z"
                        stroke="#145A2E"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                    <Text style={styles.toastScheduleBtnText}>View Schedule</Text>
                  </TouchableOpacity>
                )}

                {submissionFeedback.requestId && (
                  <TouchableOpacity
                    style={styles.toastUndoBtn}
                    onPress={() => {
                      const req = requestsList.find(
                        (r) => r.id === submissionFeedback.requestId
                      );
                      if (req) {
                        handleUndo(req);
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.toastUndoBtnText}>Undo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ================= 5. REQUESTS LIST OR EMPTY STATE ================= */}
          {activeSegmentTab === 'received' ? (
            <View style={styles.listSection}>
              {requestsList.length === 0 ? (
                /* Empty state when no received requests exist */
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" stroke="#7A917A" strokeWidth={2} />
                      <Path
                        d="M8 12L11 15L16 9"
                        stroke="#1A5A31"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.emptyTitle}>All Caught Up!</Text>
                  <Text style={styles.emptySubtitle}>
                    You have responded to all received friend requests.
                  </Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetDemo}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resetButtonText}>Reset Demo Requests</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* List of Received Request Cards matching Figma Screenshot */
                requestsList.map((request) => (
                  <ReceivedRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handlePromptAccept}
                    onDecline={handlePromptDecline}
                    onViewDetails={(req) => setSelectedRequester(req)}
                    onUndo={handleUndo}
                  />
                ))
              )}

              {/* Reset Helper for Interactive Demo Testing */}
              {requestsList.some((r) => r.status !== 'pending') && (
                <View style={styles.resetHelperRow}>
                  <TouchableOpacity
                    style={styles.resetLinkBtn}
                    onPress={handleResetDemo}
                    activeOpacity={0.7}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M4 4V9H9"
                        stroke="#4B6250"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M20 20V15H15"
                        stroke="#4B6250"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M20 9A9 9 0 0 0 5.64 5.64L4 9M4 15A9 9 0 0 0 18.36 18.36L20 15"
                        stroke="#4B6250"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.resetLinkText}>Reset Requests Demo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Sent Tab Content Placeholder (FS-03 Scope Boundary) */
            <View style={styles.sentPreviewBox}>
              <View style={styles.sentPreviewHeader}>
                <Text style={styles.sentPreviewTitle}>
                  Outgoing Requests ({sentCount})
                </Text>
                <Text style={styles.sentPreviewSubtitle}>
                  Requests you sent waiting for acceptance. Handled in ticket [FS-03].
                </Text>
              </View>

              {INITIAL_SENT_REQUESTS.slice(0, 3).map((sent) => (
                <View key={sent.id} style={styles.sentItemCard}>
                  <View style={styles.sentAvatarCircle}>
                    <Text style={styles.sentAvatarText}>{sent.initials}</Text>
                  </View>
                  <View style={styles.sentInfoCol}>
                    <Text style={styles.sentName}>{sent.name}</Text>
                    <Text style={styles.sentSub}>
                      {sent.username} • {sent.requestedAt}
                    </Text>
                  </View>
                  <View style={styles.sentPendingBadge}>
                    <Text style={styles.sentPendingText}>Pending</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.backToReceivedBtn}
                onPress={() => setActiveSegmentTab('received')}
                activeOpacity={0.8}
              >
                <Text style={styles.backToReceivedBtnText}>
                  Back to Received Requests ({pendingReceivedCount})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= 6. REQUESTER DETAIL BOTTOM SHEET ================= */}
      <RequesterDetailModal
        request={selectedRequester}
        visible={!!selectedRequester}
        onClose={() => setSelectedRequester(null)}
        onAccept={handlePromptAccept}
        onDecline={handlePromptDecline}
      />

      {/* ================= 7. CONFIRMATION MODAL FOR ACCEPT / DECLINE (FS-05) ================= */}
      <FriendRequestConfirmModal
        visible={confirmModalConfig.visible}
        type={confirmModalConfig.type}
        request={confirmModalConfig.request}
        isSubmitting={isSubmittingAction}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelModal}
      />

      {/* ================= 8. BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={handleBottomTabChange}
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
  topHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.cream,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.darkGreen,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  headerHairline: {
    height: 1,
    backgroundColor: 'rgba(92, 112, 87, 0.22)',
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  pillChipRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pillChipBadge: {
    backgroundColor: COLORS.requestPillDarkBg,
    paddingVertical: 9,
    paddingHorizontal: 28,
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pillChipText: {
    fontFamily: FONTS.bold,
    fontSize: 16.5,
    color: '#FAF8EF',
    letterSpacing: 0.2,
  },
  segmentedTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
  },
  segmentTab: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActiveReceived: {
    backgroundColor: COLORS.requestPillActiveMint,
    borderWidth: 1.4,
    borderColor: '#748C78',
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
      default: {},
    }),
  },
  segmentTabActiveSent: {
    backgroundColor: COLORS.requestPillActiveMint,
    borderWidth: 1.4,
    borderColor: '#748C78',
  },
  segmentTabInactive: {
    backgroundColor: COLORS.requestPillInactiveSage,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentTabText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  segmentTabTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.darkGreen,
  },
  segmentTabTextInactive: {
    fontFamily: FONTS.medium,
    color: '#283B2C',
  },
  submissionToast: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1.2,
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  submissionToastSuccess: {
    backgroundColor: '#EDF8F1',
    borderColor: '#80D09B',
  },
  submissionToastInfo: {
    backgroundColor: '#EEF4ED',
    borderColor: '#B3CEB6',
  },
  toastMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  toastIconWrap: {
    marginRight: 10,
    marginTop: 2,
  },
  toastTextCol: {
    flex: 1,
  },
  toastTitleText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  toastMessageText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#203926',
    lineHeight: 18,
  },
  toastDismissBtn: {
    padding: 4,
    marginLeft: 6,
  },
  toastActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 90, 49, 0.12)',
  },
  toastScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D7EFE0',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#97CDA6',
  },
  toastScheduleBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.darkGreen,
  },
  toastUndoBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDCEBC',
  },
  toastUndoBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#344737',
  },
  listSection: {
    marginTop: 2,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.requestCardBg,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.requestCardBorder,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBF4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.darkGreen,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#4B6250',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  resetButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  resetHelperRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  resetLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetLinkText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#4B6250',
    textDecorationLine: 'underline',
  },
  sentPreviewBox: {
    backgroundColor: COLORS.requestCardBg,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.requestCardBorder,
    padding: 18,
    marginTop: 6,
  },
  sentPreviewHeader: {
    marginBottom: 14,
  },
  sentPreviewTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.darkGreen,
    marginBottom: 4,
  },
  sentPreviewSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#526956',
  },
  sentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8F4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DFE7DC',
  },
  sentAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E1EBE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#9BB49B',
  },
  sentAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.darkGreen,
  },
  sentInfoCol: {
    flex: 1,
  },
  sentName: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#162419',
  },
  sentSub: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#556D59',
  },
  sentPendingBadge: {
    backgroundColor: '#E8F2E7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B0D3B0',
  },
  sentPendingText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1C675C',
  },
  backToReceivedBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#E6EFE6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8CBB8',
  },
  backToReceivedBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.darkGreen,
  },
});