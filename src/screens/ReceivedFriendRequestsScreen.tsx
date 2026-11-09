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
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import {
  FriendRequestItem,
  ReceivedFriendRequestsScreenProps,
  FriendRequestStatus,
} from '../types/friends';
import { INITIAL_RECEIVED_REQUESTS, INITIAL_SENT_REQUESTS } from '../mock/friendsData';
import { ReceivedRequestCard } from '../components/friends/ReceivedRequestCard';
import { RequesterDetailModal } from '../components/friends/RequesterDetailModal';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { TabId } from '../types/navigation';

export const ReceivedFriendRequestsScreen: React.FC<ReceivedFriendRequestsScreenProps> = ({
  requests,
  sentCount = INITIAL_SENT_REQUESTS.length,
  onBack,
  onNavigateTab,
  onAcceptRequest,
  onDeclineRequest,
  onSwitchToSent,
}) => {
  // State for requests collection
  const [requestsList, setRequestsList] = useState<FriendRequestItem[]>(
    requests ?? INITIAL_RECEIVED_REQUESTS
  );

  // Segmented Tab ('received' vs 'sent')
  const [activeSegmentTab, setActiveSegmentTab] = useState<'received' | 'sent'>('received');

  // Selected requester for detail modal
  const [selectedRequester, setSelectedRequester] = useState<FriendRequestItem | null>(null);

  // Decline confirmation modal state
  const [declineTarget, setDeclineTarget] = useState<FriendRequestItem | null>(null);

  // Feedback Banner Notification state
  const [feedbackBanner, setFeedbackBanner] = useState<{
    message: string;
    type: 'success' | 'info';
    requestId?: string;
  } | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

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

  // Accept Request Handler (Functional)
  const handleAccept = useCallback(
    (targetRequest: FriendRequestItem) => {
      setRequestsList((prev) =>
        prev.map((r) =>
          r.id === targetRequest.id ? { ...r, status: 'accepted' as FriendRequestStatus } : r
        )
      );

      setFeedbackBanner({
        message: `Accepted friend request from ${targetRequest.name}`,
        type: 'success',
        requestId: targetRequest.id,
      });

      onAcceptRequest?.(targetRequest.id);
    },
    [onAcceptRequest]
  );

  // Prompt Decline Request (opens confirmation dialog)
  const handlePromptDecline = useCallback((targetRequest: FriendRequestItem) => {
    setDeclineTarget(targetRequest);
  }, []);

  // Confirm Decline Request Handler (Functional)
  const handleConfirmDecline = useCallback(() => {
    if (!declineTarget) return;

    const target = declineTarget;
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === target.id ? { ...r, status: 'declined' as FriendRequestStatus } : r
      )
    );

    setFeedbackBanner({
      message: `Declined friend request from ${target.name}`,
      type: 'info',
      requestId: target.id,
    });

    onDeclineRequest?.(target.id);
    setDeclineTarget(null);
  }, [declineTarget, onDeclineRequest]);

  // Undo Action Handler
  const handleUndo = useCallback((targetRequest: FriendRequestItem) => {
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === targetRequest.id ? { ...r, status: 'pending' as FriendRequestStatus } : r
      )
    );
    setFeedbackBanner({
      message: `Reverted request for ${targetRequest.name} back to pending`,
      type: 'info',
    });
  }, []);

  // Reset Demo Requests (Allows reviewer to test acceptance/decline repeatedly)
  const handleResetDemo = useCallback(() => {
    setRequestsList(INITIAL_RECEIVED_REQUESTS);
    setFeedbackBanner({
      message: 'Reset received friend requests demo data',
      type: 'info',
    });
  }, []);

  // Sent Tab Press Handler
  const handlePressSentTab = useCallback(() => {
    if (onSwitchToSent) {
      onSwitchToSent();
      return;
    }
    setActiveSegmentTab('sent');
    setFeedbackBanner({
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

          {/* ================= 4. FEEDBACK NOTIFICATION BANNER ================= */}
          {feedbackBanner && (
            <View
              style={[
                styles.feedbackToast,
                feedbackBanner.type === 'success'
                  ? styles.feedbackToastSuccess
                  : styles.feedbackToastInfo,
              ]}
            >
              <View style={styles.feedbackToastLeft}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill="#145A2E" />
                  <Path
                    d="M8 12L11 15L16 9"
                    stroke="#FFFFFF"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.feedbackToastText} numberOfLines={2}>
                  {feedbackBanner.message}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setFeedbackBanner(null)}
                style={styles.feedbackDismissBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.feedbackDismissText}>Dismiss</Text>
              </TouchableOpacity>
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
                    You have no pending friend requests to review right now.
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
                    onAccept={handleAccept}
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
                <Text style={styles.sentPreviewTitle}>Outgoing Requests ({sentCount})</Text>
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
                    <Text style={styles.sentSub}>{sent.username} • {sent.requestedAt}</Text>
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

      {/* ================= 6. REQUESTER DETAIL BOTTOM SHEET / MODAL ================= */}
      <RequesterDetailModal
        request={selectedRequester}
        visible={!!selectedRequester}
        onClose={() => setSelectedRequester(null)}
        onAccept={handleAccept}
        onDecline={handlePromptDecline}
      />

      {/* ================= 7. DECLINE CONFIRMATION MODAL ================= */}
      <Modal
        visible={!!declineTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeclineTarget(null)}
      >
        <View style={styles.confirmOverlay}>
          <TouchableOpacity
            style={styles.confirmBackdrop}
            activeOpacity={1}
            onPress={() => setDeclineTarget(null)}
          />

          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#B25D5D" strokeWidth={2} />
                <Path
                  d="M15 9L9 15M9 9L15 15"
                  stroke="#B25D5D"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            <Text style={styles.confirmTitle}>Decline Friend Request?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to decline the friend request from{' '}
              <Text style={{ fontFamily: FONTS.bold }}>{declineTarget?.name}</Text>? They won't be
              notified that you declined.
            </Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setDeclineTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeclineBtn}
                onPress={handleConfirmDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDeclineText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    marginBottom: 22,
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
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackToastSuccess: {
    backgroundColor: '#E7F7ED',
    borderColor: '#8ADAA3',
  },
  feedbackToastInfo: {
    backgroundColor: '#EDF3EC',
    borderColor: '#B8D1BA',
  },
  feedbackToastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 10,
  },
  feedbackToastText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#134D25',
    flex: 1,
  },
  feedbackDismissBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  feedbackDismissText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.darkGreen,
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 17, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confirmCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    borderWidth: 1.4,
    borderColor: COLORS.requestCardBorder,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  confirmIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#1A291E',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#4B6250',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#E7EDE5',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C0D0BE',
  },
  confirmCancelText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#344938',
  },
  confirmDeclineBtn: {
    flex: 1,
    backgroundColor: '#C0392B',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeclineText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});