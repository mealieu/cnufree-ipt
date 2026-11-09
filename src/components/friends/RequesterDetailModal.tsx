import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FriendRequestItem } from '../../types/friends';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface RequesterDetailModalProps {
  request: FriendRequestItem | null;
  visible: boolean;
  onClose: () => void;
  onAccept: (request: FriendRequestItem) => void;
  onDecline: (request: FriendRequestItem) => void;
}

export const RequesterDetailModal: React.FC<RequesterDetailModalProps> = ({
  request,
  visible,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!request) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropPressable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Top Sheet Handle Bar */}
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Requester Details</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeIconButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close requester details"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="#2E3F32"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Requester Hero Card */}
            <View style={styles.heroSection}>
              <View style={styles.largeAvatarCircle}>
                <Text style={styles.largeAvatarText}>{request.initials}</Text>
              </View>

              <Text style={styles.heroName}>{request.name}</Text>
              <Text style={styles.heroUsername}>{request.username}</Text>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>
                  Pending Request • {request.requestedAt || 'Recent'}
                </Text>
              </View>
            </View>

            {/* Academic Information */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Academic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Program:</Text>
                <Text style={styles.infoValue}>
                  {request.program || 'Cebu Normal University Student'}
                </Text>
              </View>
              {request.department && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>College:</Text>
                  <Text style={styles.infoValue}>{request.department}</Text>
                </View>
              )}
              {request.yearLevel && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Year Level:</Text>
                  <Text style={styles.infoValue}>{request.yearLevel}</Text>
                </View>
              )}
            </View>

            {/* Personal Message / Note */}
            {request.bioNote && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeading}>Message Note</Text>
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteText}>"{request.bioNote}"</Text>
                </View>
              </View>
            )}

            {/* Mutual Friends Breakdown */}
            <View style={styles.sectionBox}>
              <View style={styles.mutualHeaderRow}>
                <Text style={styles.sectionHeading}>
                  Mutual Friends ({request.mutualFriendsCount})
                </Text>
              </View>

              {request.mutualFriendNames && request.mutualFriendNames.length > 0 ? (
                <View style={styles.mutualPillsContainer}>
                  {request.mutualFriendNames.map((friendName, idx) => (
                    <View key={idx} style={styles.mutualFriendPill}>
                      <View style={styles.mutualFriendDot} />
                      <Text style={styles.mutualFriendNameText}>{friendName}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.mutualFallbackText}>
                  Connected through shared university classes and mutual circles.
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons inside modal */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.modalAcceptButton}
              onPress={() => {
                onAccept(request);
                onClose();
              }}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`Accept request from ${request.name}`}
            >
              <Text style={styles.modalAcceptButtonText}>Accept Friend Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalDeclineButton}
              onPress={() => {
                onDecline(request);
                onClose();
              }}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Decline request from ${request.name}`}
            >
              <Text style={styles.modalDeclineButtonText}>Decline Request</Text>
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
    backgroundColor: 'rgba(15, 23, 17, 0.52)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#C5D3C4',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 112, 87, 0.15)',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.darkGreen,
    letterSpacing: -0.2,
  },
  closeIconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#E6EFE6',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  largeAvatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.2,
    borderColor: '#7A917A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  largeAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.darkGreen,
  },
  heroName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#132016',
    marginBottom: 2,
    textAlign: 'center',
  },
  heroUsername: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#526956',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F2E6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B5DCB5',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2ECC71',
  },
  statusBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1D6335',
  },
  sectionBox: {
    backgroundColor: '#FDFCF7',
    borderWidth: 1.2,
    borderColor: COLORS.requestCardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeading: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.darkGreen,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#556D59',
    width: 85,
  },
  infoValue: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#17271B',
    flex: 1,
  },
  quoteCard: {
    backgroundColor: '#F3F7F2',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.darkGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  quoteText: {
    fontFamily: FONTS.italic,
    fontSize: 13,
    color: '#263D2B',
    lineHeight: 18,
  },
  mutualHeaderRow: {
    marginBottom: 8,
  },
  mutualPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mutualFriendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3EA',
    borderWidth: 1,
    borderColor: '#C6DCC5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  mutualFriendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.darkGreen,
  },
  mutualFriendNameText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#1A3A23',
  },
  mutualFallbackText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#556D59',
  },
  footerActions: {
    marginTop: 10,
    gap: 10,
  },
  modalAcceptButton: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A5A31',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  modalAcceptButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalDeclineButton: {
    backgroundColor: COLORS.requestDeclineBg,
    borderWidth: 1.2,
    borderColor: COLORS.requestDeclineBorder,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeclineButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.requestDeclineText,
  },
});