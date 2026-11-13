import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput
} from 'react-native';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { FriendGroup, Friend } from '../types/friends';

interface FriendGroupDetailsScreenProps {
  group: FriendGroup;
  onBack: () => void;
}

const CONNECTED_FRIENDS_LIST: Friend[] = [
  { id: 'm1', fullName: 'Nhaka Kai P. Agod', username: '@kai_pagod' },
  { id: 'm2', fullName: 'Aque Naman M. Una', username: '@naman.aque' },
  { id: 'm3', fullName: 'Lalah Mohb', username: '@Lalah' },
  { id: 'm4', fullName: 'Bernadette Buenvenida', username: '@berna' },
  { id: 'm5', fullName: 'Andrei Manrique', username: '@andrei' },
];

export const FriendGroupDetailsScreen: React.FC<FriendGroupDetailsScreenProps> = ({ 
  group, 
  onBack 
}) => {
  const [groupName, setGroupName] = useState(group.name);
  const [members, setMembers] = useState<Friend[]>(group.members);

  // Modal States
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState(groupName);
  
  const [memberToRemove, setMemberToRemove] = useState<Friend | null>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const availableFriendsToAdd = CONNECTED_FRIENDS_LIST.filter(
    (friend) => !members.find((m) => m.id === friend.id)
  );

  const handleConfirmRename = () => {
    if (renameInput.trim().length > 0) {
      setGroupName(renameInput.trim());
    }
    setRenameModalVisible(false);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      setMembers(prevMembers => prevMembers.filter(m => m.id !== memberToRemove.id));
    }
    setMemberToRemove(null);
  };

  const handleConfirmAdd = (friendToAdd: Friend) => {
    setMembers(prevMembers => [...prevMembers, friendToAdd]);
  };

  const getFirstName = (fullName: string) => fullName.split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backArrow}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Friends</Text>
          </View>
          <View style={styles.divider} />

          {/* GROUP INFO */}
          <View style={styles.groupInfoContainer}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>
          <View style={styles.divider} />

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.renameButton} onPress={() => {
              setRenameInput(groupName);
              setRenameModalVisible(true);
            }}>
              <Text style={styles.renameButtonText}>Rename Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMembersButton} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.addMembersButtonText}>+ Add members</Text>
            </TouchableOpacity>
          </View>

          {/* MEMBERS SECTION HEADER */}
          <View style={styles.membersSectionHeader}>
            <Text style={styles.membersLabel}>Members</Text>
            <View style={styles.dotIndicator} />
            <Text style={styles.membersCountColored}>{members.length}</Text>
          </View>

          {/* MEMBERS LIST */}
          <View style={styles.membersList}>
            {members.map(member => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.profilePicPlaceholder} />
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberFullName}>{member.fullName}</Text>
                  <Text style={styles.memberUsername}>{member.username}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => setMemberToRemove(member)} 
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <BottomNavBar 
        activeTab="friends" 
        onTabChange={() => {}} 
        notificationBadgeCount={0} 
      />

      {/* --- MODALS --- */}

      {/* 1. REMOVE MEMBER MODAL */}
      <Modal visible={!!memberToRemove} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Remove {memberToRemove ? getFirstName(memberToRemove.fullName) : ''} from group?
            </Text>
            <Text style={styles.modalBody}>
              {memberToRemove ? getFirstName(memberToRemove.fullName) : ''} will be removed from {groupName}. You will still remain connected as friends and can add them back to the group later.
            </Text>
            
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleConfirmRemove}>
              <Text style={styles.modalPrimaryBtnText}>Remove member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setMemberToRemove(null)}>
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. RENAME GROUP MODAL */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <TextInput 
              style={styles.modalInput}
              value={renameInput}
              onChangeText={setRenameInput}
              autoFocus
              maxLength={30}
            />
            
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleConfirmRename}>
              <Text style={styles.modalPrimaryBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setRenameModalVisible(false)}>
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. ADD MEMBERS MODAL */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Members</Text>
            
            {availableFriendsToAdd.length > 0 ? (
              <ScrollView style={styles.addMembersList}>
                {availableFriendsToAdd.map(friend => (
                  <View key={friend.id} style={styles.modalMemberRow}>
                    <View style={styles.modalProfilePic} />
                    <View style={styles.memberInfo}>
                      <Text style={styles.modalMemberFullName}>{friend.fullName}</Text>
                      <Text style={styles.modalMemberUsername}>{friend.username}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.modalAddBtn} 
                      onPress={() => handleConfirmAdd(friend)}
                    >
                      <Text style={styles.modalAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.modalBody}>All your connected friends are already in this group!</Text>
            )}

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setAddModalVisible(false)}>
              <Text style={styles.modalSecondaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1D8' },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  contentContainer: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative', width: '100%' },
  backButton: { position: 'absolute', left: 24, zIndex: 10, padding: 8 },
  backArrow: { fontFamily: 'DMSans_400Regular', fontSize: 24, color: '#000000' },
  headerTitle: { fontFamily: 'DMSans_700Bold', fontSize: 24, color: '#000000' },
  divider: { height: 1, backgroundColor: '#89A482', width: '100%', opacity: 0.3 },
  groupInfoContainer: { alignItems: 'center', paddingVertical: 16 },
  groupName: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#000000' },
  memberCount: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#000000', marginTop: 4 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24, gap: 12 },
  renameButton: { backgroundColor: '#5C7057', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  renameButtonText: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#FFFFFF' },
  addMembersButton: { backgroundColor: '#D1EDD3', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#5C7057' },
  addMembersButtonText: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#000000' },
  membersSectionHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 24, marginBottom: 16 },
  membersLabel: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#5C7057' },
  dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5C7057', marginHorizontal: 8 },
  membersCountColored: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#287A74' },
  membersList: { width: '100%', paddingHorizontal: 24 },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, width: '100%' },
  profilePicPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#89A482' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberFullName: { fontFamily: 'DMSans_700Bold', fontSize: 12, color: '#000000' },
  memberUsername: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#000000', marginTop: 2 },
  removeButton: { backgroundColor: '#FFFFFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1, borderColor: '#55A9A0' },
  removeButtonText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#287A74' },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#9CB495', 
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 12,
  },
  modalBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#1C1F1B',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#000000',
    marginBottom: 24,
  },
  modalPrimaryBtn: {
    backgroundColor: '#43543D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrimaryBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#000000',
  },

  addMembersList: {
    maxHeight: 200, 
    marginBottom: 24,
  },
  modalMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modalProfilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5C7057',
  },
  modalMemberFullName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#000000',
  },
  modalMemberUsername: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#1C1F1B',
  },
  modalAddBtn: {
    backgroundColor: '#43543D',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalAddBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});