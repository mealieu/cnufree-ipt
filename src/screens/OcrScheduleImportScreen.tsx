import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { QuickActionIcons } from '../components/ocr/OcrIcons';
import { OcrUploadSection } from '../components/ocr/OcrUploadSection';
import { OcrReviewTable } from '../components/ocr/OcrReviewTable';
import {
  OcrExtractedEntry,
  OcrScheduleImportScreenProps,
} from '../types/ocrImport';
import {
  DEFAULT_EXTRACTED_SCHEDULES,
} from '../mock/ocrData';

export const OcrScheduleImportScreen: React.FC<OcrScheduleImportScreenProps> = ({
  onClose,
  onViewMySchedule,
  onImportSuccess,
}) => {
  // Step state: 'upload' | 'processing' | 'review' (PS-07 adds the review table)
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Extracted schedule entries that user can edit in PS-07 review screen
  const [extractedEntries, setExtractedEntries] = useState<OcrExtractedEntry[]>(
    DEFAULT_EXTRACTED_SCHEDULES
  );

  // When a file is chosen from the user's device
  const handleFilePicked = (fileName: string) => {
    setUploadedFileName(fileName);
    setCurrentStep('processing');
  };

  // Simulate OCR Processing timer and transition to PS-07 Review Screen
  useEffect(() => {
    if (currentStep !== 'processing') return;

    const timer = setTimeout(() => {
      setCurrentStep('review');
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Review table actions (PS-07)
  const handleConfirmAndSave = () => {
    if (onImportSuccess) {
      onImportSuccess(extractedEntries);
    }
    onClose();
  };

  const handleDiscardImport = () => {
    setCurrentStep('upload');
    setUploadedFileName(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ================= BACKGROUND: PROFILE HEADER (FIGMA PS-06 / PS-07) ================= */}
        <View style={styles.profileBackgroundHeader}>
          {/* Avatar Circle */}
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner} />
          </View>

          {/* Profile Name */}
          <Text style={styles.profileNameText}>Profile Name</Text>

          {/* 4 Quick Action Buttons */}
          <View style={styles.quickActionsRow}>
            {/* 1. Edit Profile */}
            <View style={styles.quickActionItem}>
              <View style={styles.quickActionCircle}>
                <QuickActionIcons.EditProfile size={18} color="#121A14" />
              </View>
              <Text style={styles.quickActionLabel}>Edit Profile</Text>
            </View>

            {/* 2. My Schedule */}
            <View style={styles.quickActionItem}>
              <View style={styles.quickActionCircle}>
                <QuickActionIcons.MySchedule size={18} color="#121A14" />
              </View>
              <Text style={styles.quickActionLabel}>My Schedule</Text>
            </View>

            {/* 3. Import Schedule (Active) */}
            <View style={styles.quickActionItem}>
              <View
                style={[
                  styles.quickActionCircle,
                  styles.quickActionCircleActive,
                ]}
              >
                <QuickActionIcons.ImportSchedule size={18} color="#121A14" />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  styles.quickActionLabelActive,
                ]}
              >
                Import Schedule
              </Text>
            </View>

            {/* 4. Share Link */}
            <View style={styles.quickActionItem}>
              <View style={styles.quickActionCircle}>
                <QuickActionIcons.ShareLink size={18} color="#121A14" />
              </View>
              <Text style={styles.quickActionLabel}>Share Link</Text>
            </View>
          </View>
        </View>

        {/* ================= FOREGROUND: SAGE GREEN BOTTOM SHEET (PS-06 / PS-07) ================= */}
        <View style={styles.bottomSheetCard}>
          {/* Top Center White Handle */}
          <View style={styles.sheetHandleContainer}>
            <View style={styles.sheetHandleBar} />
          </View>

          <ScrollView
            style={styles.sheetScrollView}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1 & 2: Upload or Processing State (PS-06) */}
            {(currentStep === 'upload' || currentStep === 'processing') && (
              <OcrUploadSection
                isProcessing={currentStep === 'processing'}
                uploadedFileName={uploadedFileName}
                onFilePicked={handleFilePicked}
                onCancel={onClose}
              />
            )}

            {/* Step 3: Review Extracted Schedule Entries (PS-07) */}
            {currentStep === 'review' && (
              <OcrReviewTable
                entries={extractedEntries}
                onUpdateEntries={setExtractedEntries}
                onConfirmAndSave={handleConfirmAndSave}
                onDiscardImport={handleDiscardImport}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    justifyContent: 'space-between',
  },
  profileBackgroundHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3.5,
    borderColor: '#121A14',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 41,
    backgroundColor: COLORS.white,
  },
  profileNameText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#121A14',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 360,
    marginBottom: 10,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
  },
  quickActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#829C83',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionCircleActive: {
    backgroundColor: '#6C876D',
    borderWidth: 1.5,
    borderColor: '#344936',
  },
  quickActionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#121A14',
    textAlign: 'center',
  },
  quickActionLabelActive: {
    color: '#1A5A31',
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: '#829C83',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  sheetHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetHandleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
