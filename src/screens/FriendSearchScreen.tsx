import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import {
  FriendSearchScreenProps,
  DiscoverableUser,
} from '../types/friends';
import {
  DISCOVERABLE_USERS,
  searchDiscoverableUsers,
  formatMutualFriends,
  sendFriendRequest,
  cancelFriendRequest,
  getSentRequestsCount,
} from '../mock/friendsData';
import { BottomNavBar } from '../components/navigation/BottomNavBar';

/**
 * FS-02 & FS-03: Friend Search & Request Screen
 * - FS-02: Matching users, Add Friend actions, and no-results states (UI - 15)
 * - FS-03: Send friend request interaction with pending status and submission feedback (UI - 16)
 */
export const FriendSearchScreen: React.FC<FriendSearchScreenProps> = ({
  onBack,
  onNavigateTab,
  initialQuery = 'Mariah',
  onAddFriend,
  onViewSentRequests,
  initialPendingUser,
}) => {
  // Search Query State (defaults to 'Mariah' to match Figma UI - 15 / UI - 16)
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // Set of user IDs with pending friend request status
  const [pendingUserIds, setPendingUserIds] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    DISCOVERABLE_USERS.forEach((u) => {
      if (u.connectionStatus === 'pending_sent') {
        initialSet.add(u.id);
      }
    });
    return initialSet;
  });

  // Target user for the submission feedback banner (UI - 16)
  const [feedbackUser, setFeedbackUser] = useState<DiscoverableUser | null>(() => {
    if (initialPendingUser) {
      return initialPendingUser;
    }
    return DISCOVERABLE_USERS.find((u) => u.connectionStatus === 'pending_sent') || null;
  });

  // Dynamic count of sent requests for the bottom action button (matches 'View sent requests (15)' in UI - 16)
  const [sentRequestsCount, setSentRequestsCount] = useState<number>(() => {
    return getSentRequestsCount();
  });

  // Transient status alert message
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filtered matching discoverable users based on current search query
  const matchingUsers = useMemo(() => {
    return searchDiscoverableUsers(DISCOVERABLE_USERS, searchQuery);
  }, [searchQuery]);

  // Handler for Add Friend action button (FS-03 Send Request Interaction)
  const handleAddFriend = useCallback(
    (user: DiscoverableUser) => {
      // 1. Add user ID to pending set
      setPendingUserIds((prev) => {
        const next = new Set(prev);
        next.add(user.id);
        return next;
      });

      // 2. Set submission feedback banner target
      setFeedbackUser(user);
      setStatusMessage(null);

      // 3. Dispatch to mock store and update sent requests count
      sendFriendRequest(user);
      setSentRequestsCount(getSentRequestsCount());

      // 4. Trigger external callback if passed
      onAddFriend?.(user);
    },
    [onAddFriend]
  );

  // Handler when clicking an already Pending button
  const handlePressPending = useCallback((user: DiscoverableUser) => {
    setStatusMessage(
      `Pending request sent to ${user.name}. Waiting for their response.`
    );
  }, []);

  // Handler for clearing search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* ================= 1. TOP BAR (< Friends / Your people and groups) ================= */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Back to friends"
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19L8 12L15 5"
                  stroke={COLORS.friendsOliveText}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>Friends</Text>
              <Text style={styles.headerSubtitle}>Your people and groups</Text>
            </View>

            {/* Spacer to keep title centered */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Top Header Divider Line */}
          <View style={styles.horizontalDivider} />

          {/* ================= 2. FIND FRIENDS SUB-HEADER ================= */}
          <View style={styles.subHeaderSection}>
            <Text style={styles.subHeaderTitle}>Find Friends</Text>
            <Text style={styles.subHeaderSubtitle}>Search by name or username</Text>
          </View>

          {/* Sub-Header Divider Line */}
          <View style={styles.horizontalDivider} />

          {/* Status Tooltip Message if tapped */}
          {statusMessage && (
            <TouchableOpacity
              style={styles.statusToast}
              activeOpacity={0.8}
              onPress={() => setStatusMessage(null)}
              accessibilityRole="button"
              accessibilityLabel="Dismiss status message"
            >
              <Text style={styles.statusToastText}>{statusMessage}</Text>
              <Text style={styles.statusToastDismiss}>Dismiss</Text>
            </TouchableOpacity>
          )}

          {/* ================= 3. CAPSULE SEARCH BAR ================= */}
          <View style={styles.searchBarWrapper}>
            <View
              style={styles.searchCapsule}
              accessibilityRole="search"
              accessibilityLabel="Search by name or username"
            >
              {/* Search Magnifying Glass Icon */}
              <View style={styles.searchIconContainer}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx={11}
                    cy={11}
                    r={7}
                    stroke="#18231C"
                    strokeWidth={2.6}
                  />
                  <Path
                    d="M16.5 16.5L21 21"
                    stroke="#18231C"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (statusMessage) {
                    setStatusMessage(null);
                  }
                }}
                placeholder="Search by name or username"
                placeholderTextColor="rgba(24, 35, 28, 0.45)"
                selectionColor={COLORS.darkGreen}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Clear button when text is present */}
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.clearSearchButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="#18231C"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ================= 4. MATCHING PEOPLE SECTION ================= */}
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsSectionTitle}>Matching People</Text>
            <View style={styles.bulletDot} />
            <Text style={styles.resultsCountText}>{matchingUsers.length}</Text>
          </View>

          {/* ================= 5. SUBMISSION FEEDBACK BANNER (FS-03, UI - 16) ================= */}
          {feedbackUser && (
            <View
              style={styles.submissionFeedbackBanner}
              accessibilityRole="alert"
              accessibilityLabel={`Friend request sent to ${feedbackUser.name}. They'll appear in Friends after accepting`}
            >
              <Text style={styles.submissionFeedbackText}>
                {`Friend request sent to ${feedbackUser.name}. They'll appear in Friends after accepting`}
              </Text>
            </View>
          )}

          {/* ================= 6. MATCHING USERS LIST OR NO-RESULTS STATE ================= */}
          {matchingUsers.length > 0 ? (
            <View style={styles.userListContainer}>
              {matchingUsers.map((user) => {
                const isPending = pendingUserIds.has(user.id);

                return (
                  <View key={user.id} style={styles.userRow}>
                    {/* Circular Avatar (White with green border, matching UI - 15 / UI - 16) */}
                    <View style={styles.avatarCircle} />

                    {/* User Information */}
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name}
                      </Text>
                      <Text style={styles.userHandle} numberOfLines={1}>
                        {user.username}
                      </Text>
                      <Text style={styles.userMutualFriends} numberOfLines={1}>
                        {formatMutualFriends(user.mutualFriendsCount)}
                      </Text>
                    </View>

                    {/* Action Button: Pending Status (FS-03) or + Add friend (FS-02) */}
                    {isPending ? (
                      <TouchableOpacity
                        style={styles.pendingButton}
                        onPress={() => handlePressPending(user)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Friend request pending for ${user.name}`}
                      >
                        <Text style={styles.pendingButtonText}>Pending</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.addFriendButton}
                        onPress={() => handleAddFriend(user)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`Add friend ${user.name}`}
                      >
                        <Text style={styles.addFriendButtonText}>+ Add friend</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            /* ================= 7. NO-RESULTS STATE (FS-02) ================= */
            <View style={styles.noResultsCard}>
              <View style={styles.noResultsIconContainer}>
                <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx={11}
                    cy={11}
                    r={7}
                    stroke={COLORS.friendsOliveText}
                    strokeWidth={2}
                  />
                  <Path
                    d="M16.5 16.5L21 21"
                    stroke={COLORS.friendsOliveText}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M9 11H13"
                    stroke={COLORS.friendsOliveText}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              <Text style={styles.noResultsTitle}>No matching people found</Text>
              <Text style={styles.noResultsSubtitle}>
                {searchQuery.trim().length > 0
                  ? `We couldn't find anyone matching "${searchQuery.trim()}". Try searching with a different name or @username.`
                  : 'Start typing a name or username above to find classmates and friends.'}
              </Text>

              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.clearResultsButton}
                  onPress={handleClearSearch}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search query"
                >
                  <Text style={styles.clearResultsButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ================= 8. FOOTER: PENDING HELPER NOTE & VIEW SENT REQUESTS (FS-03, UI - 16) ================= */}
          <View style={styles.footerNoteSection}>
            <View style={styles.footerDivider} />

            {pendingUserIds.size > 0 ? (
              <View style={styles.pendingFooterContainer}>
                <Text style={styles.pendingHelperText}>
                  Pending means you’re waiting for their response
                </Text>

                <TouchableOpacity
                  style={styles.viewSentRequestsButton}
                  onPress={() => {
                    if (onViewSentRequests) {
                      onViewSentRequests();
                    } else if (onBack) {
                      onBack();
                    }
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`View sent requests (${sentRequestsCount})`}
                >
                  <Text style={styles.viewSentRequestsButtonText}>
                    {`View sent requests (${sentRequestsCount})`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.footerNoteText}>
                Send a request to connect and share availability
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ================= 9. BOTTOM NAVIGATION BAR ================= */}
      <BottomNavBar
        activeTab="friends"
        onTabChange={(tab) => {
          onNavigateTab?.(tab);
        }}
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
    paddingHorizontal: 26,
    paddingTop: 14,
  },

  /* 1. Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.darkGreen,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#152419',
  },
  headerSpacer: {
    width: 36,
  },

  /* Thin Divider */
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(91, 105, 85, 0.28)',
    width: '100%',
    marginVertical: 14,
  },

  /* 2. Sub-Header Section */
  subHeaderSection: {
    paddingVertical: 4,
  },
  subHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#556950',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subHeaderSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: '#1E2B20',
  },

  /* Transient Status Toast */
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D9E8DD',
    borderWidth: 1,
    borderColor: '#789D80',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  statusToastText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#122E1A',
    marginRight: 8,
  },
  statusToastDismiss: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.darkGreen,
  },

  /* 3. Capsule Search Bar */
  searchBarWrapper: {
    marginTop: 6,
    marginBottom: 28,
  },
  searchCapsule: {
    height: 50,
    backgroundColor: COLORS.friendsSearchBg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.regular,
    fontSize: 15.5,
    color: '#111E14',
    paddingVertical: 0,
  },
  clearSearchButton: {
    marginLeft: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 4. Results Header Row */
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsOliveText,
    letterSpacing: 0.1,
  },
  bulletDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.friendsOliveText,
    marginLeft: 14,
    marginRight: 14,
  },
  resultsCountText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsOliveText,
  },

  /* 5. Submission Feedback Banner (FS-03, UI - 16) */
  submissionFeedbackBanner: {
    backgroundColor: COLORS.friendsFeedbackBannerBg,
    borderWidth: 1,
    borderColor: COLORS.friendsFeedbackBannerBorder,
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  submissionFeedbackText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#121F16',
    lineHeight: 18,
  },

  /* 6. Matching Users List */
  userListContainer: {
    gap: 22,
    marginBottom: 28,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.friendsAvatarBg,
    borderWidth: 1.8,
    borderColor: COLORS.friendsAvatarBorder,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 18,
    marginRight: 12,
    justifyContent: 'center',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0D1A10',
    letterSpacing: -0.1,
  },
  userHandle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#1B2A1E',
    marginTop: 2,
  },
  userMutualFriends: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#2A3C2E',
    marginTop: 2,
  },

  /* Pending Status Button (FS-03, UI - 16) */
  pendingButton: {
    backgroundColor: COLORS.friendsPendingBtnBg,
    borderWidth: 1,
    borderColor: COLORS.friendsPendingBtnBorder,
    borderRadius: 2,
    paddingVertical: 7,
    paddingHorizontal: 16,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0E1B12',
  },

  /* + Add Friend Button (FS-02) */
  addFriendButton: {
    backgroundColor: COLORS.friendsMintBtnBg,
    borderWidth: 1.2,
    borderColor: COLORS.friendsMintBtnBorder,
    borderRadius: 2,
    paddingVertical: 7,
    paddingHorizontal: 12,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#102A18',
  },

  /* 7. No-Results State */
  noResultsCard: {
    backgroundColor: 'rgba(91, 105, 85, 0.08)',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  noResultsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(91, 105, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noResultsTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16.5,
    color: '#152518',
    marginBottom: 6,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#495B4C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  clearResultsButton: {
    backgroundColor: COLORS.friendsMintBtnBg,
    borderWidth: 1.2,
    borderColor: COLORS.friendsMintBtnBorder,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  clearResultsButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#102A18',
  },

  /* 8. Footer Section */
  footerNoteSection: {
    marginTop: 6,
    marginBottom: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(91, 105, 85, 0.35)',
    width: '100%',
    marginBottom: 16,
  },
  pendingFooterContainer: {
    alignItems: 'center',
    gap: 14,
  },
  pendingHelperText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#1B2C1E',
    textAlign: 'center',
  },
  viewSentRequestsButton: {
    backgroundColor: COLORS.friendsMintBtnBg,
    borderWidth: 1.2,
    borderColor: COLORS.friendsMintBtnBorder,
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignSelf: 'center',
    minWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSentRequestsButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0E2515',
  },
  footerNoteText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#1B2C1E',
    textAlign: 'center',
  },
});
