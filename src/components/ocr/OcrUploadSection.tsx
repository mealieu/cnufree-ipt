import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { UploadCloudIcon, RadialSpokeSpinner } from './OcrIcons';

interface OcrUploadSectionProps {
  isProcessing: boolean;
  uploadedFileName?: string | null;
  onFilePicked: (fileName: string) => void;
  onCancel: () => void;
}

export const OcrUploadSection: React.FC<OcrUploadSectionProps> = ({
  isProcessing,
  uploadedFileName,
  onFilePicked,
  onCancel,
}) => {
  // Trigger file selection from user's device
  const handleUploadPress = () => {
    if (isProcessing) return;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Create hidden HTML input to trigger device file picker
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,.pdf';
      fileInput.style.display = 'none';

      fileInput.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target?.files?.[0];
        if (file) {
          onFilePicked(file.name);
        }
        document.body.removeChild(fileInput);
      };

      fileInput.oncancel = () => {
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      };

      document.body.appendChild(fileInput);
      fileInput.click();
    } else {
      // Fallback for native/headless environment: simulate device schedule file upload
      onFilePicked('Device_Schedule_COR.png');
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= CENTER: 12-SPOKE RADIAL SPINNER (MATCH FIGMA PS-06) ================= */}
      <View style={styles.centerSpinnerArea}>
        <RadialSpokeSpinner size={78} color="#121A14" isProcessing={isProcessing} />
        {isProcessing && (
          <Text style={styles.processingText}>
            {uploadedFileName
              ? `Processing ${uploadedFileName}...`
              : 'Processing schedule...'}
          </Text>
        )}
      </View>

      {/* ================= BOTTOM BUTTONS (MATCH FIGMA PS-06) ================= */}
      <View style={styles.actionsContainer}>
        {/* 1. Upload your Schedule Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            isProcessing && styles.uploadButtonDisabled,
          ]}
          onPress={handleUploadPress}
          activeOpacity={0.85}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Upload your Schedule from device"
        >
          <View style={styles.uploadButtonContent}>
            <UploadCloudIcon size={22} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>
              {isProcessing ? 'Extracting Schedule...' : 'Upload your Schedule'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2. Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
    minHeight: 400,
  },
  centerSpinnerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#213223',
    marginTop: 18,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  uploadButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#566A57',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtonDisabled: {
    opacity: 0.8,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  cancelButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cancelButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#121A14',
  },
});
