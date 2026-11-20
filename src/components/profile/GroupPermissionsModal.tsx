import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { styles } from './ProfileModals.styles';
import {
  GroupAccessLevel,
  GroupPermissionEntity,
  GroupPermissionsConfig,
} from '../../types/profile';
import { UsersGroupIcon } from './ProfileIcons';
import {
  EXTENDED_CONNECTED_FRIENDS,
  INITIAL_FRIEND_GROUPS,
} from '../../mock/friendsData';

export type { GroupAccessLevel, GroupPermissionEntity, GroupPermissionsConfig };

export interface GroupPermissionsModalProps {
  visible: boolean;
  initialEntities?: GroupPermissionEntity[];
  onClose: () => void;
  onSave: (entities: GroupPermissionEntity[]) => void;
}

const DEFAULT_ENTITIES: GroupPermissionEntity[] = [
  {
    id: 'ent-andrei',
    name: 'Andrei Manrique',
    handle: 'andreeyuuh',
    isGroup: false,
    accessLevel: 'full_view',
    avatarInitials: 'AM',
  },
  {
    id: 'ent-jp',
    name: 'JP Daluro',
    handle: 'jpd2005',
    isGroup: false,
    accessLevel: 'free_only',
    avatarInitials: 'JD',
  },
  {
    id: 'ent-it-girls',
    name: 'it girls',
    handle: undefined,
    isGroup: true,
    accessLevel: 'busy_only',
    avatarInitials: 'IG',
  },
];

const ACCESS_OPTIONS: { id: GroupAccessLevel; label: string; desc: string }[] = [
  { id: 'full_view', label: 'Full View', desc: 'Can see full schedule, class titles, and rooms' },
  { id: 'free_only', label: 'Free Only', desc: 'Can only see when you are free' },
  { id: 'busy_only', label: 'Busy Only', desc: 'Can only see busy hours, titles hidden' },
];

export const GroupPermissionsModal: React.FC<GroupPermissionsModalProps> = ({
  visible,
  initialEntities,
  onClose,
  onSave,
}) => {
  const [entities, setEntities] = useState<GroupPermissionEntity[]>(
    initialEntities && initialEntities.length > 0 ? initialEntities : DEFAULT_ENTITIES
  );
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state whenever modal opens
  useEffect(() => {
    if (visible) {
      setEntities(
        initialEntities && initialEntities.length > 0 ? initialEntities : DEFAULT_ENTITIES
      );
      setActiveDropdownId(null);
      setSearchQuery('');
    }
  }, [visible, initialEntities]);

  // Suggestions for adding new people or groups
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const existingIds = new Set(entities.map((e) => e.id));

    const friendMatches = EXTENDED_CONNECTED_FRIENDS.filter(
      (f) =>
        !existingIds.has(f.id) &&
        (f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q))
    ).map((f) => ({
      id: f.id,
      name: f.name,
      handle: f.username.replace('@', ''),
      isGroup: false,
      avatarInitials: f.initials,
      accessLevel: 'full_view' as GroupAccessLevel,
    }));

    const groupMatches = INITIAL_FRIEND_GROUPS.filter(
      (g) => !existingIds.has(g.id) && g.name.toLowerCase().includes(q)
    ).map((g) => ({
      id: g.id,
      name: g.name,
      handle: `${g.memberCount} members`,
      isGroup: true,
      avatarInitials: g.name.slice(0, 2).toUpperCase(),
      accessLevel: 'full_view' as GroupAccessLevel,
    }));

    return [...friendMatches, ...groupMatches];
  }, [searchQuery, entities]);

  // Change permission for an entity
  const handleChangePermission = (id: string, newLevel: GroupAccessLevel) => {
    setEntities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, accessLevel: newLevel } : item))
    );
    setActiveDropdownId(null);
  };

  // Remove entity
  const handleRemoveEntity = (id: string) => {
    setEntities((prev) => prev.filter((item) => item.id !== id));
    setActiveDropdownId(null);
  };

  // Add new entity
  const handleAddEntity = (entity: GroupPermissionEntity) => {
    setEntities((prev) => [...prev, entity]);
    setSearchQuery('');
  };

  // Save handler
  const handleSave = () => {
    onSave(entities);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle Bar (Figma spec) */}
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header: Title & Subtitle (Centered as in Figma UI-45 / PS-12) */}
            <Text style={styles.shareScheduleTitle}>Group Permissions</Text>
            <Text style={styles.shareScheduleSubtitle}>
              Manage who can view your schedule.
            </Text>

            {/* Dark Olive-Sage Container Card (Figma UI-45 Match) */}
            <View style={styles.groupPermissionsCard}>
              <Text style={styles.groupPermissionsTitle}>People with Access</Text>

              {/* Add people / username / groups input */}
              <TextInput
                style={styles.groupAddInput}
                placeholder="Add people, username, groups"
                placeholderTextColor="#6D8269"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />

              {/* Suggestions dropdown if search query is active */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {suggestions.slice(0, 4).map((sug) => (
                    <TouchableOpacity
                      key={sug.id}
                      style={styles.suggestionItem}
                      onPress={() => handleAddEntity(sug)}
                      activeOpacity={0.75}
                    >
                      <View>
                        <Text style={styles.suggestionText}>{sug.name}</Text>
                        <Text style={styles.suggestionSub}>
                          {sug.isGroup ? 'Group' : `@${sug.handle}`}
                        </Text>
                      </View>
                      <Text style={{ color: '#1A5A31', fontWeight: 'bold', fontSize: 13 }}>
                        + Add
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* List of entities with access */}
              {entities.map((entity) => {
                const isDropdownOpen = activeDropdownId === entity.id;
                const activeLevelObj =
                  ACCESS_OPTIONS.find((opt) => opt.id === entity.accessLevel) ||
                  ACCESS_OPTIONS[0];

                return (
                  <View key={entity.id}>
                    <View style={styles.groupEntityRow}>
                      <View style={styles.groupEntityLeft}>
                        {/* Avatar Circle (Person or Group) */}
                        <View style={styles.groupEntityAvatar}>
                          {entity.isGroup ? (
                            <UsersGroupIcon size={18} color="#151F17" />
                          ) : (
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                                stroke="#151F17"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <Circle
                                cx="12"
                                cy="7"
                                r="4"
                                stroke="#151F17"
                                strokeWidth={2}
                              />
                            </Svg>
                          )}
                        </View>

                        {/* Name and Handle */}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.groupEntityName} numberOfLines={1}>
                            {entity.name}
                          </Text>
                          {entity.handle ? (
                            <Text style={styles.groupEntityHandle} numberOfLines={1}>
                              {entity.handle}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Dropdown Badge Button */}
                      <TouchableOpacity
                        style={styles.permissionBadgeBtn}
                        onPress={() =>
                          setActiveDropdownId(isDropdownOpen ? null : entity.id)
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.permissionBadgeText}>
                          {activeLevelObj.label}
                        </Text>
                        <Svg width={9} height={6} viewBox="0 0 9 6" fill="none">
                          <Path
                            d="M1 1.5L4.5 4.5L8 1.5"
                            stroke="#FFFFFF"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </TouchableOpacity>
                    </View>

                    {/* Permission Dropdown Menu */}
                    {isDropdownOpen && (
                      <View style={styles.permissionDropdownMenu}>
                        {ACCESS_OPTIONS.map((opt) => {
                          const isSelected = entity.accessLevel === opt.id;
                          return (
                            <TouchableOpacity
                              key={opt.id}
                              style={styles.permissionDropdownItem}
                              onPress={() =>
                                handleChangePermission(entity.id, opt.id)
                              }
                              activeOpacity={0.75}
                            >
                              <View>
                                <Text
                                  style={[
                                    styles.permissionDropdownText,
                                    isSelected && styles.permissionDropdownTextActive,
                                  ]}
                                >
                                  {opt.label}
                                </Text>
                              </View>
                              {isSelected && (
                                <Svg
                                  width={14}
                                  height={14}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <Path
                                    d="M20 6L9 17L4 12"
                                    stroke="#1A5A31"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Svg>
                              )}
                            </TouchableOpacity>
                          );
                        })}

                        {/* Remove Option */}
                        <TouchableOpacity
                          style={[styles.permissionDropdownItem, { borderBottomWidth: 0 }]}
                          onPress={() => handleRemoveEntity(entity.id)}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.permissionDropdownText, { color: '#9E2424' }]}>
                            Remove access
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Bottom Right Save Button (Figma UI-45 Match) */}
            <View style={styles.groupSaveBtnRow}>
              <TouchableOpacity
                style={styles.groupSaveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={styles.groupSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
