import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { styles } from './ProfileComponents.styles';

interface LogoutConfirmModalProps {
  visible: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  backendConfigured?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  isSubmitting = false,
  onConfirm,
  onCancel,
  backendConfigured = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={isSubmitting ? undefined : onCancel}
          accessibilityLabel="Dismiss confirmation"
        />

        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Sign Out</Text>
          <Text style={styles.dialogDescription}>
            Are you sure you want to sign out of CNU Free? You will need to sign back in to view shared schedules.
          </Text>

          {!backendConfigured && (
            <View style={styles.dialogNoticeBox}>
              <Text style={styles.dialogNoticeText}>
                Note: Supabase backend authentication is not configured in this environment. Your local session will be cleared.
              </Text>
            </View>
          )}

          <View style={styles.dialogButtonRow}>
            <TouchableOpacity
              style={styles.dialogCancelBtn}
              onPress={onCancel}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel sign out"
            >
              <Text style={styles.dialogCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dialogConfirmBtn}
              onPress={onConfirm}
              disabled={isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Confirm sign out"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.dialogConfirmBtnText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
