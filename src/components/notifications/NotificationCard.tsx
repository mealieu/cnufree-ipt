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
import { UserAvatarSilhouette } from '../icons/NavIcons';
import { NotificationCardProps } from '../../types/notifications';

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onToggleRead,
}) => {
  const isUnread = !notification.isRead;
  const isNoAccess = notification.category === 'no_access';

  return (
    <View
      style={[
        styles.cardContainer,
        isUnread ? styles.cardUnread : styles.cardRead,
      ]}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => onPress(notification)}
        onLongPress={() => onToggleRead(notification)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${notification.actorName} ${notification.actionText}. ${notification.detailText}. ${notification.badgeLabel}, ${notification.timestampLabel}. ${
          isUnread ? 'Unread' : 'Read'
        }`}
      >
        {/* Left Accent Vertical Stripe */}
        <View
          style={[
            styles.leftStripe,
            isUnread ? styles.leftStripeUnread : styles.leftStripeRead,
          ]}
        />

        {/* Main Content Area */}
        <View style={styles.cardBody}>
          {/* Left Avatar Silhouette */}
          <View style={styles.avatarWrapper}>
            <UserAvatarSilhouette
              size={45}
              color="#6E7771"
              bgColor="#E6E9E7"
            />
          </View>

          {/* Center Info Column */}
          <View style={styles.centerColumn}>
            <Text style={styles.headlineText} numberOfLines={2}>
              <Text style={styles.actorNameText}>{notification.actorName}</Text>{' '}
              {notification.actionText}
            </Text>

            <Text style={styles.detailText} numberOfLines={1}>
              {notification.detailText}
            </Text>

            {/* Bottom Row: Category Pill Badge & Relative Time */}
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badgePill,
                  isNoAccess ? styles.badgeNoAccess : styles.badgeMint,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isNoAccess ? styles.badgeTextNoAccess : styles.badgeTextMint,
                  ]}
                >
                  {notification.badgeLabel}
                </Text>
              </View>

              <Text style={styles.timestampText}>
                {notification.timestampLabel}
              </Text>
            </View>
          </View>

          {/* Right Chevron Column */}
          <View style={styles.rightColumn}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18L15 12L9 6"
                stroke="#101912"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>
      </TouchableOpacity>

      {/* Top-Right Unread Indicator Dot (UI-49 to 53) */}
      {isUnread && (
        <TouchableOpacity
          style={styles.unreadDotTouch}
          onPress={() => onToggleRead(notification)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Mark notification as read"
        >
          <View style={styles.unreadDot} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#122116',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.14,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1.5px 4px rgba(18,33,22,0.14)',
      },
    }),
  },
  cardTouchable: {
    flexDirection: 'row',
    width: '100%',
  },
  cardUnread: {
    backgroundColor: COLORS.notifUnreadCardBg,
    borderWidth: 1.2,
    borderColor: COLORS.notifUnreadCardBorder,
  },
  cardRead: {
    backgroundColor: COLORS.notifReadCardBg,
    borderWidth: 1,
    borderColor: COLORS.notifReadCardBorder,
  },
  leftStripe: {
    width: 11,
  },
  leftStripeUnread: {
    backgroundColor: COLORS.notifUnreadStripe,
  },
  leftStripeRead: {
    backgroundColor: COLORS.notifReadStripe,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingLeft: 12,
    paddingRight: 10,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#E6E9E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerColumn: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  headlineText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    lineHeight: 18,
    color: '#0F1811',
    paddingRight: 14,
  },
  actorNameText: {
    fontFamily: FONTS.bold,
    color: '#0F1811',
  },
  detailText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#1C2B1F',
    marginTop: 2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMint: {
    backgroundColor: COLORS.notifBadgeMintBg,
    borderColor: COLORS.notifBadgeMintBorder,
  },
  badgeNoAccess: {
    backgroundColor: COLORS.notifBadgeNoAccessBg,
    borderColor: COLORS.notifBadgeNoAccessBorder,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 0.1,
  },
  badgeTextMint: {
    color: COLORS.notifBadgeMintText,
  },
  badgeTextNoAccess: {
    color: COLORS.notifBadgeNoAccessText,
  },
  timestampText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#1A281D',
    marginLeft: 8,
  },
  rightColumn: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  unreadDotTouch: {
    position: 'absolute',
    top: 7,
    right: 8,
    padding: 2,
    zIndex: 2,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.notifUnreadDotBg,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
  },
});
