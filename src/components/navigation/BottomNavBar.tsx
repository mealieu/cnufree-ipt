import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { TabId } from '../../types/navigation';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import {
  HomeIcon,
  FriendsIcon,
  SharedIcon,
  NotificationsIcon,
  ProfileIcon,
} from '../icons/NavIcons';

interface BottomNavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  notificationBadgeCount?: number;
}

interface TabItemConfig {
  id: TabId;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  notificationBadgeCount = 3,
}) => {
  const tabs: TabItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      renderIcon: (color) => <HomeIcon color={color} size={25} />,
    },
    {
      id: 'friends',
      label: 'Friends',
      renderIcon: (color) => <FriendsIcon color={color} size={25} />,
    },
    {
      id: 'shared',
      label: 'Shared',
      renderIcon: (color) => <SharedIcon color={color} size={25} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      renderIcon: (color) => (
        <View style={styles.iconWithBadge}>
          <NotificationsIcon color={color} size={25} />
          {notificationBadgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationBadgeCount > 9 ? '9+' : notificationBadgeCount}
              </Text>
            </View>
          )}
        </View>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      renderIcon: (color) => <ProfileIcon color={color} size={25} />,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const iconColor = isActive ? COLORS.navActive : COLORS.navInactive;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <View style={styles.iconContainer}>{tab.renderIcon(iconColor)}</View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: iconColor },
                    isActive ? styles.activeLabel : styles.inactiveLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.navBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(35, 50, 38, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    height: 62,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(20, 62, 33, 0.08)',
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -7,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.navBackground,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONTS.bold,
    lineHeight: 11,
  },
  tabLabel: {
    fontSize: 11.5,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  activeLabel: {
    fontFamily: FONTS.bold,
  },
  inactiveLabel: {
    fontFamily: FONTS.medium,
  },
});
