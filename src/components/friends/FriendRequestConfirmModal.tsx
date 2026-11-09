import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FriendRequestConfirmModalProps } from '../../types/friends';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

export const FriendRequestConfirmModal: React.FC<FriendRequestConfirmModalProps> = ({
  visible,
  type,
  request,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!request) return null;

  // Extract first name for personalized natural phrasing ("Accept Lalah's Request?")
  const firstName = request.name.trim().split(' ')[0] || request.name;
  const isAccept = type === 'accept';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropPressable}
          activeOpacity={1}
          onPress={isSubmitting ? undefined : onCancel}
          accessibilityLabel="Dismiss confirmation dialog"
        />

        {/* Sage-Green Modal Card (Faithful to Figma Reference & Modernized) */}
        <View style={styles.dialogCard}>
          {/* Header Title */}
          <Text style={styles.dialogTitle}>
            {isAccept
              ? `Accept ${firstName}'s Request?`
              : `Decline ${firstName}'s Request?`}
          </Text>

          {/* Descriptive Information */}
          <Text style={styles.dialogDescription}>
            {isAccept
              ? `${request.name} will become your friend. You can both view each other's shared availability and schedules.`
              : `Are you sure you want to decline ${request.name}'s friend request? They won't be notified, and you can connect again in the future.`}
          </Text>

          {/* Requester Profile Preview Row */}
          <View style={styles.requesterCardRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{request.initials}</Text>
            </View>

            <View style={styles.requesterTextCol}>
              <Text style={styles.requesterName} numberOfLines={1}>
                {request.name}
              </Text>
              <Text style={styles.requesterUsername} numberOfLines={1}>
                {request.username}
              </Text>
              <Text style={styles.mutualFriendsText}>
                {request.mutualFriendsCount} mutual friends
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Primary Action Button (Accept or Decline) */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isAccept && styles.primaryDeclineButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={() => onConfirm(request)}
              disabled={isSubmitting}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={
                isAccept
                  ? `Confirm accept friend request from ${request.name}`
                  : `Confirm decline friend request from ${request.name}`
              }
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {isAccept ? 'Accepting...' : 'Declining...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isAccept ? 'Accept' : 'Decline'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Secondary Action Button (Decline / Cancel) */}
            <TouchableOpacity
              style={[styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={onCancel}
              disabled={isSubmitting}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel="Cancel action"
            >
              <Text style={styles.secondaryButtonText}>
                {isAccept ? 'Decline' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 17, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    backgroundColor: COLORS.confirmModalSageBg,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.confirmModalBorder,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 380,
    ...Platform.select({
      ios: {
        shadowColor: '#121F14',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  dialogTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.confirmModalTextDark,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  dialogDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: COLORS.confirmModalSubText,
    lineHeight: 19.5,
    marginBottom: 18,
  },
  requesterCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.confirmModalAvatarBg,
    borderWidth: 1.6,
    borderColor: COLORS.confirmModalAvatarBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.darkGreen,
    letterSpacing: -0.2,
  },
  requesterTextCol: {
    flex: 1,
  },
  requesterName: {
    fontFamily: FONTS.bold,
    fontSize: 16.5,
    color: COLORS.confirmModalTextDark,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  requesterUsername: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.confirmModalSubText,
    marginBottom: 3,
  },
  mutualFriendsText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.confirmModalSubText,
  },
  actionsContainer: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.confirmModalBtnDark,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
      default: {},
    }),
  },
  primaryDeclineButton: {
    backgroundColor: '#7D3228',
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.confirmModalBtnLight,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(54, 73, 57, 0.25)',
  },
  secondaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.confirmModalBtnLightText,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});
