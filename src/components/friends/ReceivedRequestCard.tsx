import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FriendRequestItem } from '../../types/friends';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface ReceivedRequestCardProps {
  request: FriendRequestItem;
  onAccept: (request: FriendRequestItem) => void;
  onDecline: (request: FriendRequestItem) => void;
  onViewDetails: (request: FriendRequestItem) => void;
  onUndo?: (request: FriendRequestItem) => void;
}

export const ReceivedRequestCard: React.FC<ReceivedRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
  onViewDetails,
  onUndo,
}) => {
  const isAccepted = request.status === 'accepted';
  const isDeclined = request.status === 'declined';
  const isResolved = isAccepted || isDeclined;

  return (
    <View
      style={[
        styles.cardContainer,
        isAccepted && styles.cardContainerAccepted,
        isDeclined && styles.cardContainerDeclined,
      ]}
      accessibilityRole="none"
    >
      {/* Resolved State View (Accepted / Declined) */}
      {isResolved ? (
        <View style={styles.resolvedContainer}>
          <View style={styles.resolvedInfoRow}>
            <View
              style={[
                styles.resolvedAvatarCircle,
                isAccepted ? styles.avatarAccepted : styles.avatarDeclined,
              ]}
            >
              <Text
                style={[
                  styles.resolvedAvatarText,
                  isAccepted ? styles.textAccepted : styles.textDeclined,
                ]}
              >
                {request.initials}
              </Text>
            </View>

            <View style={styles.resolvedTextCol}>
              <Text style={styles.resolvedName}>{request.name}</Text>
              <View style={styles.resolvedStatusRow}>
                {isAccepted ? (
                  <View style={styles.statusPillAccepted}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17L4 12"
                        stroke="#145A2E"
                        strokeWidth={2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.statusPillAcceptedText}>
                      Friend Request Accepted
                    </Text>
                  </View>
                ) : (
                  <View style={styles.statusPillDeclined}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="#6B7280"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.statusPillDeclinedText}>
                      Request Declined
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {onUndo && (
            <TouchableOpacity
              style={styles.undoButton}
              onPress={() => onUndo(request)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Undo action for ${request.name}`}
            >
              <Text style={styles.undoButtonText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Active Pending State View */
        <View>
          {/* Tappable Card Header & Requester Details */}
          <TouchableOpacity
            style={styles.detailsTouchArea}
            onPress={() => onViewDetails(request)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${request.name}`}
            accessibilityHint="Opens full profile and mutual friends"
          >
            {/* Requester Avatar Circle */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitialsText}>{request.initials}</Text>
              </View>
              {/* Subtle online / pending indicator badge */}
              <View style={styles.indicatorBadge} />
            </View>

            {/* Requester Information */}
            <View style={styles.infoColumn}>
              <View style={styles.nameRow}>
                <Text style={styles.requesterName} numberOfLines={1}>
                  {request.name}
                </Text>
                {request.requestedAt && (
                  <Text style={styles.requestedAtText}>{request.requestedAt}</Text>
                )}
              </View>

              <Text style={styles.requesterUsername} numberOfLines={1}>
                {request.username}
              </Text>

              {/* Mutual Friends with Icon */}
              <View style={styles.mutualFriendsRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle cx="8" cy="8" r="4" stroke="#4F6654" strokeWidth={2} />
                  <Path
                    d="M2.5 19C2.5 15.5 5 13.5 8 13.5C10 13.5 11.5 14.5 12.3 16"
                    stroke="#4F6654"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Circle cx="16.5" cy="9" r="3" stroke="#4F6654" strokeWidth={2} />
                  <Path
                    d="M13 19C13 16.5 14.5 15.2 16.5 15.2C18.5 15.2 20 16.5 20 19"
                    stroke="#4F6654"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
                <Text style={styles.mutualFriendsText}>
                  {request.mutualFriendsCount} mutual friends
                </Text>
              </View>

              {/* Modern Detail Pills (Program & College context) */}
              {request.program && (
                <View style={styles.programPill}>
                  <Text style={styles.programPillText} numberOfLines={1}>
                    {request.program}
                    {request.yearLevel ? ` • ${request.yearLevel}` : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Subtle Chevron indicator */}
            <View style={styles.chevronWrapper}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18L15 12L9 6"
                  stroke="#7C9281"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* Action Buttons: Functional Accept and Decline */}
          <View style={styles.buttonsRow}>
            {/* Accept Button (Deep Forest Green filled) */}
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept(request)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`Accept friend request from ${request.name}`}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>

            {/* Decline Button (Refined Outlined) */}
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => onDecline(request)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Decline friend request from ${request.name}`}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.requestCardBg,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.requestCardBorder,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  cardContainerAccepted: {
    backgroundColor: '#F3FAF5',
    borderColor: '#B9DFC4',
  },
  cardContainerDeclined: {
    backgroundColor: '#F8F9F8',
    borderColor: '#DDE2DC',
    opacity: 0.85,
  },
  detailsTouchArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: '#7A917A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.darkGreen,
    letterSpacing: -0.2,
  },
  indicatorBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: COLORS.requestCardBg,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  requesterName: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#132016',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 6,
  },
  requestedAtText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#657C69',
  },
  requesterUsername: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#4B6250',
    marginBottom: 4,
  },
  mutualFriendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mutualFriendsText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#3B4E40',
  },
  programPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7EFE5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  programPillText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#264D32',
  },
  chevronWrapper: {
    paddingLeft: 4,
    paddingTop: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.darkGreen,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
      default: {},
    }),
  },
  acceptButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLORS.requestDeclineBg,
    borderWidth: 1.2,
    borderColor: COLORS.requestDeclineBorder,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.requestDeclineText,
    letterSpacing: 0.1,
  },
  resolvedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resolvedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resolvedAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarAccepted: {
    backgroundColor: '#D7F1DF',
    borderWidth: 1.2,
    borderColor: '#73C78B',
  },
  avatarDeclined: {
    backgroundColor: '#ECEEEB',
    borderWidth: 1.2,
    borderColor: '#CCD2CA',
  },
  resolvedAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  textAccepted: {
    color: '#13582A',
  },
  textDeclined: {
    color: '#657367',
  },
  resolvedTextCol: {
    flex: 1,
  },
  resolvedName: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#132016',
    marginBottom: 2,
  },
  resolvedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPillAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillAcceptedText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#166432',
  },
  statusPillDeclined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillDeclinedText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#5C6B5E',
  },
  undoButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E6EFE6',
    borderWidth: 1,
    borderColor: '#B9CBB9',
  },
  undoButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: COLORS.darkGreen,
  },
});
