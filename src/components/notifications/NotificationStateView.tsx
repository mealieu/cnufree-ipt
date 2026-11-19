import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { NotificationStateViewProps } from '../../types/notifications';

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

export const NotificationStateView: React.FC<NotificationStateViewProps> = ({
  status,
  filterMode = 'all',
  onRetry,
  onFindFriends,
  onShowAllNotifications,
}) => {
  /* ================= 1. LOADING STATE (UI-54 · Loading) ================= */
  if (status === 'loading') {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading notifications"
      >
        <Text style={styles.loadingHeaderText}>LOADING NOTIFICATIONS...</Text>

        {SKELETON_ROWS.map((idx) => (
          <View key={`skeleton-${idx}`} style={styles.skeletonCard}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonBarsColumn}>
              <View style={styles.skeletonBarLong} />
              <View style={styles.skeletonBarMedium} />
              <View style={styles.skeletonBarShort} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  /* ================= 2. ERROR + RETRY STATE (UI-54 · Error + retry) ================= */
  if (status === 'error') {
    return (
      <View
        style={styles.centeredStateContainer}
        accessibilityRole="alert"
        accessibilityLabel="Couldn't load notifications. Check your connection and try again."
      >
        <View style={styles.errorIconCircle}>
          <Text style={styles.errorExclamationText}>!</Text>
        </View>

        <Text style={styles.stateTitleText}>Couldn't load notifications</Text>
        <Text style={styles.stateSubtitleText}>
          Check your connection and try again.
        </Text>

        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onRetry}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Retry loading notifications"
        >
          <Text style={styles.primaryActionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ================= 3. EMPTY STATE (UI-54 · Empty) ================= */
  const isUnreadFilterEmpty = filterMode === 'unread';

  return (
    <View
      style={styles.centeredStateContainer}
      accessibilityLabel="No notifications yet"
    >
      <View style={styles.emptyIconCircle}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 9C18 6.23858 15.3137 4 12 4C8.68629 4 6 6.23858 6 9C6 14 4 16 4 16H20C20 16 18 14 18 9Z"
            stroke="#3B5241"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 19C10.2 19.8 11 20.5 12 20.5C13 20.5 13.8 19.8 14 19"
            stroke="#3B5241"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <Text style={styles.stateTitleText}>No notifications yet</Text>
      <Text style={styles.stateSubtitleText}>
        {isUnreadFilterEmpty
          ? 'You are all caught up! Friend requests and schedule updates from your friends will show up here.'
          : 'Friend requests and schedule updates from your friends will show up here.'}
      </Text>

      <View style={styles.emptyActionsRow}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onFindFriends}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Find friends"
        >
          <Text style={styles.primaryActionButtonText}>Find friends</Text>
        </TouchableOpacity>

        {isUnreadFilterEmpty && onShowAllNotifications && (
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={onShowAllNotifications}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="View all notifications"
          >
            <Text style={styles.secondaryActionButtonText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Loading Skeleton Styles (UI-54 · Loading) */
  loadingContainer: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  loadingHeaderText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#465A49',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginLeft: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.notifSkeletonCardBg,
    borderWidth: 1,
    borderColor: '#769178',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.notifSkeletonBarBg,
  },
  skeletonBarsColumn: {
    flex: 1,
    marginLeft: 14,
    gap: 7,
    justifyContent: 'center',
  },
  skeletonBarLong: {
    width: '85%',
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.notifSkeletonBarBg,
  },
  skeletonBarMedium: {
    width: '60%',
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.notifSkeletonBarBg,
  },
  skeletonBarShort: {
    width: '36%',
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.notifSkeletonBarBg,
    marginTop: 1,
  },

  /* Centered Empty & Error States (UI-54 · Empty & Error + retry) */
  centeredStateContainer: {
    minHeight: 450,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#CFEAD6',
    borderWidth: 1.2,
    borderColor: '#6E9977',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.notifErrorCircleBg,
    borderWidth: 1.4,
    borderColor: COLORS.notifErrorCircleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorExclamationText: {
    fontFamily: FONTS.bold,
    fontSize: 30,
    color: COLORS.notifErrorExclamation,
    lineHeight: 34,
  },
  stateTitleText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#1E3F29',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 7,
    letterSpacing: -0.2,
  },
  stateSubtitleText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#1E2A21',
    textAlign: 'center',
    lineHeight: 18.5,
    maxWidth: 270,
    marginBottom: 18,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionButton: {
    backgroundColor: COLORS.notifActionBtnBg,
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0E1C12',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 5px rgba(14,28,18,0.18)',
      },
    }),
  },
  primaryActionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    backgroundColor: '#CFEAD6',
    borderWidth: 1,
    borderColor: '#748C78',
    borderRadius: 7,
    paddingVertical: 9.5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1E3F29',
  },
});
