import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { SuccessCheckmarkBadge, ErrorExclamationBadge } from './OcrIcons';

interface OcrResultScreenProps {
  isSuccess: boolean;
  importedCount?: number;
  errorMessage?: string;
  onViewMySchedule: () => void;
  onBackToHome: () => void;
  onTryAgain: () => void;
  onCancel: () => void;
}

export const OcrResultScreen: React.FC<OcrResultScreenProps> = ({
  isSuccess,
  importedCount = 0,
  errorMessage,
  onViewMySchedule,
  onBackToHome,
  onTryAgain,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      {/* ================= ICON BADGE (MATCH FIGMA PS-08) ================= */}
      <View style={styles.badgeWrapper}>
        {isSuccess ? (
          <SuccessCheckmarkBadge size={100} />
        ) : (
          <ErrorExclamationBadge size={100} />
        )}
      </View>

      {/* ================= STATUS TEXT (MATCH FIGMA PS-08) ================= */}
      <Text style={styles.statusTitle}>
        {isSuccess ? 'Schedule Successfully Imported!' : 'Import Failed'}
      </Text>

      <Text style={styles.statusDescription}>
        {isSuccess
          ? `${importedCount} schedule ${
              importedCount === 1 ? 'entry has' : 'entries have'
            } been added to your timetable.`
          : errorMessage ||
            'Unable to process timetable image. Please ensure high clarity and check your file format.'}
      </Text>

      {/* ================= ACTION BUTTONS (MATCH FIGMA PS-08) ================= */}
      <View style={styles.actionsContainer}>
        {isSuccess ? (
          <>
            {/* 1. View My Schedule */}
            <TouchableOpacity
              style={styles.primaryDarkButton}
              onPress={onViewMySchedule}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="View My Schedule"
            >
              <Text style={styles.primaryDarkButtonText}>View My Schedule</Text>
            </TouchableOpacity>

            {/* 2. Back to Home */}
            <TouchableOpacity
              style={styles.secondaryWhiteButton}
              onPress={onBackToHome}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.secondaryWhiteButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* 1. Try Again */}
            <TouchableOpacity
              style={styles.primaryDarkButton}
              onPress={onTryAgain}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Try Again"
            >
              <Text style={styles.primaryDarkButtonText}>Try Again</Text>
            </TouchableOpacity>

            {/* 2. Cancel */}
            <TouchableOpacity
              style={styles.secondaryWhiteButton}
              onPress={onCancel}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.secondaryWhiteButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#121A14',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  statusDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#253427',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 38,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryDarkButton: {
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
  primaryDarkButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  secondaryWhiteButton: {
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
  secondaryWhiteButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#121A14',
  },
});
