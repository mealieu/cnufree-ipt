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
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { UserAvatarSilhouette } from '../icons/NavIcons';
import { ConfirmDialogModalProps } from '../../types/notifications';

export const ConfirmDialogModal: React.FC<ConfirmDialogModalProps> = ({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  userPreview,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={isSubmitting ? undefined : onCancel}
          accessibilityLabel="Dismiss confirmation dialog"
        />

        {/* Sage-Olive Confirmation Card (UI-57 Reference) */}
        <View style={styles.dialogCard}>
          <View style={styles.topContent}>
            <Text style={styles.titleText}>{title}</Text>

            {userPreview && (
              <View style={styles.userRow}>
                <View style={styles.avatarContainer}>
                  <UserAvatarSilhouette
                    size={54}
                    color="#6B756E"
                    bgColor="#E6E9E7"
                  />
                </View>

                <View style={styles.userInfoCol}>
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {userPreview.name}
                  </Text>
                  <Text style={styles.userHandleText} numberOfLines={1}>
                    {userPreview.username}
                  </Text>
                  {typeof userPreview.mutualFriendsCount === 'number' && (
                    <Text style={styles.mutualFriendsText}>
                      {userPreview.mutualFriendsCount}{' '}
                      {userPreview.mutualFriendsCount === 1
                        ? 'mutual friend'
                        : 'mutual friends'}
                    </Text>
                  )}
                </View>
              </View>
            )}

            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Horizontal Divider */}
          <View style={styles.divider} />

          {/* Stacked Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={onConfirm}
              disabled={isSubmitting}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={onCancel}
              disabled={isSubmitting}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 42, 28, 0.56)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 368,
    backgroundColor: COLORS.notifDialogSageBg,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: COLORS.notifDialogBorder,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0C1A10',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 18px rgba(12,26,16,0.28)',
      },
    }),
  },
  topContent: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 18.5,
    color: '#0D170F',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E9E7',
    marginRight: 14,
  },
  userInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0D170F',
    marginBottom: 1,
  },
  userHandleText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#19261C',
    marginBottom: 1,
  },
  mutualFriendsText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#19261C',
  },
  descriptionText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#101B12',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(20, 34, 23, 0.28)',
  },
  actionsSection: {
    paddingVertical: 18,
    paddingHorizontal: 38,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.notifDialogPrimaryBtnBg,
    borderRadius: 6,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#485A49',
    borderRadius: 6,
    paddingVertical: 10.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: '#0D170F',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
