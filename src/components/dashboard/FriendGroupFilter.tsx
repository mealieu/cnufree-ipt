import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FriendGroupId, FriendGroupOption } from '../../types/dashboard';
import { styles } from './FriendGroupFilter.styles';

export interface FriendGroupFilterProps {
  groups?: FriendGroupOption[];
  selectedGroup?: FriendGroupId;
  onSelectGroup: (groupId: FriendGroupId) => void;
}

export const FriendGroupFilter: React.FC<FriendGroupFilterProps> = ({
  groups = [],
  selectedGroup = 'all',
  onSelectGroup,
}) => {
  if (groups.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No friend groups available</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {groups.map((group) => {
            const isSelected = selectedGroup === group.id;

            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.tab,
                  isSelected && styles.activeTab,
                ]}
                onPress={() => onSelectGroup(group.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${group.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected ? styles.activeTabText : styles.inactiveTabText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
