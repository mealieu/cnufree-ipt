import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import {
  SharedFriendGroup,
  FriendGroupSelectorModalProps,
} from '../../types/sharedSchedule';

export const FriendGroupSelectorModal: React.FC<FriendGroupSelectorModalProps> = ({
  visible,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
}) => {
  // Local pending selection state so user can toggle around and confirm with "Done"
  const [currentSelectedId, setCurrentSelectedId] = useState<string>(selectedGroupId);

  // Sync with prop when modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentSelectedId(selectedGroupId);
    }
  }, [visible, selectedGroupId]);

  const handleRowPress = (group: SharedFriendGroup) => {
    setCurrentSelectedId(group.id);
  };

  const handleDone = () => {
    const selectedGroup =
      groups.find((g) => g.id === currentSelectedId) || groups[0];
    onSelectGroup(selectedGroup);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Dimmed backdrop pressable to dismiss */}
        <Pressable
          style={styles.backdropPressable}
          onPress={onClose}
          accessibilityLabel="Dismiss group selector"
        />

        {/* Sage Green Bottom Sheet */}
        <SafeAreaView style={styles.sheetContainer}>
          {/* Grabber / Handle bar */}
          <View style={styles.handleBar} />

          {/* Sheet Header */}
          <View style={styles.headerArea}>
            <Text style={styles.headerTitle}>Choose a group</Text>
            <Text style={styles.headerSubtitle}>
              Pick one group. Groups can’t be combined.
            </Text>
          </View>

          {/* Group Options List */}
          <ScrollView
            style={styles.groupsScrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {groups.map((group) => {
              const isSelected = group.id === currentSelectedId;
              const isEmptyGroup = group.isEmpty || group.memberCount === 0;

              return (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupRowItem}
                  onPress={() => handleRowPress(group)}
                  activeOpacity={0.7}
                  accessibilityLabel={`${group.name}, ${group.statusSummary || ''}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  {/* Left Icon: White Circle with Group Silhouette */}
                  <View
                    style={[
                      styles.avatarCircle,
                      isEmptyGroup && styles.avatarCircleMuted,
                    ]}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Circle
                        cx="8.5"
                        cy="8"
                        r="3.2"
                        stroke={isEmptyGroup ? '#6D826F' : '#3C503E'}
                        strokeWidth={2}
                      />
                      <Path
                        d="M2.5 19C2.5 15.5 5 13.5 8.5 13.5C10.5 13.5 12 14.5 12.8 16"
                        stroke={isEmptyGroup ? '#6D826F' : '#3C503E'}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      <Circle
                        cx="16"
                        cy="9.5"
                        r="2.6"
                        stroke={isEmptyGroup ? '#6D826F' : '#3C503E'}
                        strokeWidth={2}
                      />
                      <Path
                        d="M13 19C13 16.8 14.5 15.2 16.5 15.2C18.7 15.2 21 16.5 21 19"
                        stroke={isEmptyGroup ? '#6D826F' : '#3C503E'}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </View>

                  {/* Middle: Group Name & Status Summary */}
                  <View style={styles.groupInfoCol}>
                    <Text
                      style={[
                        styles.groupNameText,
                        isEmptyGroup && styles.groupNameTextMuted,
                      ]}
                      numberOfLines={1}
                    >
                      {group.name}
                    </Text>
                    <Text
                      style={[
                        styles.statusSummaryText,
                        isEmptyGroup && styles.statusSummaryTextMuted,
                      ]}
                      numberOfLines={1}
                    >
                      {group.statusSummary ||
                        `${group.memberCount} ${
                          group.memberCount === 1 ? 'person' : 'people'
                        }`}
                    </Text>
                  </View>

                  {/* Right: Selected Checkmark vs Unselected Ring */}
                  {isSelected ? (
                    <View style={styles.selectedCircle}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke="#FFFFFF"
                          strokeWidth={2.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.unselectedRing,
                        isEmptyGroup && styles.unselectedRingMuted,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom "Done" Action Button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityLabel="Done"
            accessibilityRole="button"
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#859D82', // Sage green matching Figma screenshot
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: Platform.OS === 'web' ? 16 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 16 : 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '75%', // Ensures modal comfortably fits viewport and leaves cards above visible
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 12,
  },
  handleBar: {
    width: 48,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#D1DDD0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerArea: {
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#131F15',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: '#394C3B',
    marginTop: 2,
  },
  groupsScrollList: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingVertical: 2,
  },
  groupRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.28)',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarCircleMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  groupInfoCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  groupNameText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#131F15',
    letterSpacing: -0.2,
  },
  groupNameTextMuted: {
    color: '#556956',
  },
  statusSummaryText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#3E5340',
    marginTop: 1.5,
  },
  statusSummaryTextMuted: {
    color: '#556956',
  },
  selectedCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#4C604E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRing: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: '#96A994',
    backgroundColor: 'transparent',
  },
  unselectedRingMuted: {
    borderColor: '#819380',
  },
  doneButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4C604E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  doneButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
});
