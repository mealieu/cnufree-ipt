import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { PendingRequestsSectionProps } from '../../types/friends';

export const PendingRequestsSection: React.FC<PendingRequestsSectionProps> = ({
  receivedCount,
  sentCount,
  receivedRequests = [],
  sentRequests = [],
  activePreviewType = null,
  onPressReceived,
  onPressSent,
}) => {
  const previewList =
    activePreviewType === 'received'
      ? receivedRequests
      : activePreviewType === 'sent'
        ? sentRequests.slice(0, 4)
        : [];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Pending Request</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.requestButton,
            activePreviewType === 'received' && styles.requestButtonActive,
          ]}
          onPress={onPressReceived}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Received friend requests (${receivedCount})`}
          accessibilityState={{ selected: activePreviewType === 'received' }}
        >
          <Text style={styles.requestButtonText}>
            Received ({receivedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.requestButton,
            activePreviewType === 'sent' && styles.requestButtonActive,
          ]}
          onPress={onPressSent}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Sent friend requests (${sentCount})`}
          accessibilityState={{ selected: activePreviewType === 'sent' }}
        >
          <Text style={styles.requestButtonText}>
            Sent ({sentCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Inline Preview when user taps Received or Sent on Main Screen */}
      {activePreviewType && (
        <View style={styles.previewBox}>
          <Text style={styles.previewHeader}>
            {activePreviewType === 'received'
              ? `Incoming Requests (${receivedCount})`
              : `Outgoing Pending Requests (${sentCount})`}
          </Text>
          {previewList.length === 0 ? (
            <Text style={styles.previewEmptyText}>
              No {activePreviewType} friend requests right now.
            </Text>
          ) : (
            previewList.map((req) => (
              <View key={req.id} style={styles.previewItemRow}>
                <View style={styles.previewAvatar} />
                <View style={styles.previewTextCol}>
                  <Text style={styles.previewName}>{req.name}</Text>
                  <Text style={styles.previewSub}>
                    {req.username} • {req.mutualFriendsCount} mutual friends
                  </Text>
                </View>
                <View style={styles.previewStatusBadge}>
                  <Text style={styles.previewStatusText}>Pending</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 42,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.friendsOliveText,
    letterSpacing: 0.1,
    marginBottom: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 14,
  },
  requestButton: {
    flex: 1,
    maxWidth: 162,
    backgroundColor: COLORS.friendsMintBtnBg,
    borderWidth: 1.2,
    borderColor: COLORS.friendsMintBtnBorder,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonActive: {
    borderWidth: 1.8,
    borderColor: COLORS.darkGreen,
  },
  requestButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F1711',
  },
  previewBox: {
    marginTop: 14,
    marginHorizontal: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.friendsMintBtnBorder,
    backgroundColor: 'rgba(207, 234, 214, 0.35)',
    gap: 10,
  },
  previewHeader: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.friendsOliveText,
    marginBottom: 2,
  },
  previewEmptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.friendsOliveText,
  },
  previewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.friendsAvatarBg,
    borderWidth: 1.5,
    borderColor: COLORS.friendsAvatarBorder,
  },
  previewTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  previewName: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#0F1711',
  },
  previewSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#344338',
  },
  previewStatusBadge: {
    backgroundColor: COLORS.friendsSearchBg,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 4,
  },
  previewStatusText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#0F1711',
  },
});
