import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { styles } from './ProfileModals.styles';
import { CloudUploadIcon } from './ProfileIcons';

export interface ImportScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onImported: () => void;
}

export const ImportScheduleModal: React.FC<ImportScheduleModalProps> = ({
  visible,
  onClose,
  onImported,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    setSuccess(false);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsUploading(false);
    setSuccess(true);

    setTimeout(() => {
      onImported();
      onClose();
    }, 1000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isUploading ? undefined : onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={isUploading ? undefined : onClose}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={onClose}
                disabled={isUploading}
              >
                <Text style={styles.sheetCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetTitle}>Import Schedule</Text>
            <Text style={styles.sheetSubtitle}>
              Upload a screenshot or PDF of your Certificate of Registration (COR) or study load to auto-populate your vacant tracker.
            </Text>

            {success && (
              <View style={[styles.feedbackBanner, styles.successBanner]}>
                <Text style={styles.feedbackText}>
                  COR parsed successfully! 14 schedule blocks imported.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.dropzone}
              onPress={handleUpload}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              <View style={styles.dropzoneIconCircle}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <CloudUploadIcon size={26} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.dropzoneTitle}>
                {isUploading ? 'Parsing Schedule...' : 'Tap to upload COR image or PDF'}
              </Text>
              <Text style={styles.dropzoneSub}>
                Supported formats: PNG, JPG, PDF (Max 10MB)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionBtn, isUploading && styles.primaryActionBtnDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionBtnText}>
                {isUploading ? 'IMPORTING...' : 'SELECT FILE'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
