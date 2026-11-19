import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ProfileComponents.styles';
import { SettingItemConfig } from '../../types/profile';
import {
  EyeIcon,
  PencilIcon,
  CloudUploadIcon,
  LinkChainIcon,
  UsersGroupIcon,
  BellIcon,
  TrashIcon,
  SignOutHandIcon,
  ChevronRightIcon,
} from './ProfileIcons';

interface ProfileSettingsSectionProps {
  title: string;
  items: SettingItemConfig[];
  onItemPress: (item: SettingItemConfig) => void;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  title,
  items,
  onItemPress,
}) => {
  const renderIcon = (iconName: string, isDestructive?: boolean) => {
    const iconColor = isDestructive ? '#451818' : '#151F17';
    switch (iconName) {
      case 'eye':
        return <EyeIcon size={19} color={iconColor} />;
      case 'pencil':
        return <PencilIcon size={18} color={iconColor} />;
      case 'cloud':
        return <CloudUploadIcon size={19} color={iconColor} />;
      case 'link':
        return <LinkChainIcon size={18} color={iconColor} />;
      case 'users':
        return <UsersGroupIcon size={19} color={iconColor} />;
      case 'bell':
        return <BellIcon size={19} color={iconColor} />;
      case 'trash':
        return <TrashIcon size={18} color={iconColor} />;
      case 'sign_out':
        return <SignOutHandIcon size={19} color={iconColor} />;
      default:
        return <EyeIcon size={18} color={iconColor} />;
    }
  };

  return (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => onItemPress(item)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={styles.settingRowLeft}>
                  <View style={styles.settingIconContainer}>
                    {renderIcon(item.iconName, item.isDestructive)}
                  </View>
                  <Text
                    style={[
                      styles.settingRowTitle,
                      item.isDestructive && styles.destructiveText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </View>
                <ChevronRightIcon
                  size={15}
                  color={item.isDestructive ? '#451818' : '#151F17'}
                />
              </TouchableOpacity>
              {!isLast && <View style={styles.rowDivider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
