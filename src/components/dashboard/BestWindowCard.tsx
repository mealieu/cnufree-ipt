import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BestWindow } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface BestWindowCardProps {
  bestWindow: BestWindow | null;
  onPressSuggested?: () => void;
}

export const BestWindowCard: React.FC<BestWindowCardProps> = ({
  bestWindow,
  onPressSuggested,
}) => {
  if (!bestWindow) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>BEST WINDOW TODAY</Text>
        <Text style={styles.emptyTitle}>No Common Free Window</Text>
        <Text style={styles.emptyDescription}>
          None of your selected friends have overlapping free hours today. Try switching groups or checking tomorrow’s timetable.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Eyebrow Label */}
      <Text style={styles.eyebrow}>BEST WINDOW TODAY</Text>

      {/* Main Time Range */}
      <Text style={styles.timeRangeText}>{bestWindow.timeRange}</Text>

      {/* Free Friends Description */}
      <Text style={styles.descriptionText}>{bestWindow.description}</Text>

      {/* Bottom Action Row: Overlapping Avatars & Suggested Pill Button */}
      <View style={styles.bottomRow}>
        {/* Overlapping Initials Avatars */}
        <View style={styles.avatarGroup}>
          {bestWindow.initials.slice(0, 4).map((initial, idx) => (
            <View
              key={idx}
              style={[
                styles.avatarBadge,
                idx > 0 && { marginLeft: -10 },
                { zIndex: 10 - idx },
              ]}
            >
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          ))}
        </View>

        {/* Suggested Pill Button */}
        <TouchableOpacity
          style={styles.suggestedButton}
          onPress={onPressSuggested}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Suggested best window details"
        >
          <Text style={styles.suggestedText}>Suggested</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.sageCardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.sageCardBorder,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    marginHorizontal: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1E2C22',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timeRangeText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#0E1711',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  descriptionText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#1C2920',
    letterSpacing: 0.1,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.avatarCircleBg,
    borderWidth: 1.5,
    borderColor: COLORS.avatarCircleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
  },
  avatarInitial: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#121A14',
  },
  suggestedButton: {
    backgroundColor: COLORS.tealSuggestedBg,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  suggestedText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#141E17',
    marginTop: 4,
    marginBottom: 6,
  },
  emptyDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#26382C',
    lineHeight: 18,
  },
});
