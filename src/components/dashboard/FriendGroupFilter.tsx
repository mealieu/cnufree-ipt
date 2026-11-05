import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FriendGroupId, FriendGroupOption } from '../../types/dashboard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface FriendGroupFilterProps {
  groups: FriendGroupOption[];
  selectedGroup: FriendGroupId;
  onSelectGroup: (groupId: FriendGroupId) => void;
}

export const FriendGroupFilter: React.FC<FriendGroupFilterProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
}) => {
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

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 10,
  },
  container: {
    backgroundColor: COLORS.filterContainerBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 38, 0.22)',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    flex: 1,
  },
  activeTab: {
    backgroundColor: COLORS.filterActiveBg,
    borderWidth: 1.5,
    borderColor: COLORS.filterActiveBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  activeTabText: {
    color: COLORS.filterActiveText,
    fontFamily: FONTS.bold,
  },
  inactiveTabText: {
    color: COLORS.filterInactiveText,
    fontFamily: FONTS.medium,
  },
});
