import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { OcrConfirmationType } from '../../types/ocrImport';

interface OcrConfirmationModalProps {
  type: OcrConfirmationType;
  entriesCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OcrConfirmationModal: React.FC<OcrConfirmationModalProps> = ({
  type,
  entriesCount,
  onConfirm,
  onCancel,
}) => {
  if (!type) return null;

  const isSave = type === 'save';

  return (
    <Modal
      visible={!!type}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>
            {isSave ? 'Confirm Schedule Import' : 'Discard Extracted Schedule?'}
          </Text>

          <Text style={styles.dialogMessage}>
            {isSave
              ? `Are you sure you want to add ${entriesCount} extracted ${
                  entriesCount === 1 ? 'entry' : 'entries'
                } to your personal schedule?`
              : 'Any corrections or additions you made will be lost. Do you want to discard this import?'}
          </Text>

          <View style={styles.buttonsRow}>
            {/* Cancel / Keep Editing */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isSave ? 'Cancel' : 'Keep Editing'}
            >
              <Text style={styles.cancelButtonText}>
                {isSave ? 'Cancel' : 'Keep Editing'}
              </Text>
            </TouchableOpacity>

            {/* Confirm / Discard */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isSave && styles.discardConfirmButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isSave ? 'Confirm and Save' : 'Discard'}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !isSave && styles.discardConfirmButtonText,
                ]}
              >
                {isSave ? 'Confirm & Save' : 'Discard'}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#4E614F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  dialogTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#121A14',
    marginBottom: 8,
  },
  dialogMessage: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#28392A',
    lineHeight: 19,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  cancelButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#344636',
  },
  confirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#566A57',
  },
  confirmButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
  },
  discardConfirmButton: {
    backgroundColor: '#C0392B',
  },
  discardConfirmButtonText: {
    color: COLORS.white,
  },
});
