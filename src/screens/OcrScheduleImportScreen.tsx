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
import { OcrResultScreen } from '../components/ocr/OcrResultScreen';
import { OcrConfirmationModal } from '../components/ocr/OcrConfirmationModal';
import {
  OcrExtractedEntry,
  OcrImportStep,
  OcrConfirmationType,
  OcrScheduleImportScreenProps,
} from '../types/ocrImport';
import {
  DEFAULT_EXTRACTED_SCHEDULES,
  factCheckScheduleImage,
} from '../mock/ocrData';

export const OcrScheduleImportScreen: React.FC<OcrScheduleImportScreenProps> = ({
  onClose,
  onViewMySchedule,
  onBackToHome,
  onImportSuccess,
}) => {
  // Step state: 'upload' | 'processing' | 'review' | 'success' | 'error' (PS-08)
  const [currentStep, setCurrentStep] = useState<OcrImportStep>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | undefined>(undefined);

  // Extracted schedule entries that user can edit in PS-07 review screen
  const [extractedEntries, setExtractedEntries] = useState<OcrExtractedEntry[]>(
    DEFAULT_EXTRACTED_SCHEDULES
  );

  // Confirmation modal state (PS-08)
  const [confirmationType, setConfirmationType] = useState<OcrConfirmationType>(null);

  // Error message for error state (PS-08)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When a file is chosen from the user's device
  const handleFilePicked = (fileName: string, fileSize?: number) => {
    setUploadedFileName(fileName);
    setUploadedFileSize(fileSize);
    setCurrentStep('processing');
  };

  // Simulate OCR Processing and Fact-Check Verification
  useEffect(() => {
    if (currentStep !== 'processing') return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      // Fact-check if the uploaded picture consists of a schedule
      const check = await factCheckScheduleImage(
        uploadedFileName || 'timetable.png',
        uploadedFileSize
      );

      if (!isMounted) return;

      if (!check.isSchedule) {
        setErrorMessage(
          check.rejectionReason ||
            'The uploaded picture does not consist of a class schedule. Please upload a clear photo of your Certificate of Registration (COR) or timetable.'
        );
        setCurrentStep('error');
      } else {
        if (check.extractedEntries && check.extractedEntries.length > 0) {
          setExtractedEntries(check.extractedEntries);
        }
        setCurrentStep('review');
      }
    }, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentStep, uploadedFileName, uploadedFileSize]);

  // Review table actions (PS-07 -> PS-08 confirmation)
  const handleConfirmAndSavePress = () => {
    setConfirmationType('save');
  };

  const handleDiscardImportPress = () => {
    setConfirmationType('discard');
  };

  // Confirmation modal callbacks (PS-08)
  const handleModalConfirm = () => {
    if (confirmationType === 'save') {
      setConfirmationType(null);
      if (onImportSuccess) {
        onImportSuccess(extractedEntries);
      }
      setCurrentStep('success');
    } else if (confirmationType === 'discard') {
      setConfirmationType(null);
      setCurrentStep('upload');
      setUploadedFileName(null);
    }
  };

  const handleModalCancel = () => {
    setConfirmationType(null);
  };

  // Error recovery (PS-08)
  const handleTryAgain = () => {
    setErrorMessage(null);
    setUploadedFileName(null);
    setCurrentStep('upload');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ================= BACKGROUND: PROFILE HEADER (FIGMA PS-06 / PS-07 / PS-08) ================= */}
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

        {/* ================= FOREGROUND: SAGE GREEN BOTTOM SHEET (PS-06, PS-07, PS-08) ================= */}
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
                onConfirmAndSave={handleConfirmAndSavePress}
                onDiscardImport={handleDiscardImportPress}
              />
            )}

            {/* Step 4: Success State (PS-08) */}
            {currentStep === 'success' && (
              <OcrResultScreen
                isSuccess={true}
                importedCount={extractedEntries.length}
                onViewMySchedule={onViewMySchedule}
                onBackToHome={() => {
                  if (onBackToHome) {
                    onBackToHome();
                  } else {
                    onClose();
                  }
                }}
                onTryAgain={handleTryAgain}
                onCancel={onClose}
              />
            )}

            {/* Step 5: Error State (PS-08) */}
            {currentStep === 'error' && (
              <OcrResultScreen
                isSuccess={false}
                errorMessage={errorMessage || undefined}
                onViewMySchedule={onViewMySchedule}
                onBackToHome={onClose}
                onTryAgain={handleTryAgain}
                onCancel={onClose}
              />
            )}
          </ScrollView>
        </View>

        {/* ================= CONFIRMATION DIALOG MODAL (PS-08) ================= */}
        <OcrConfirmationModal
          type={confirmationType}
          entriesCount={extractedEntries.length}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
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
