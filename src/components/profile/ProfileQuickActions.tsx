import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ProfileComponents.styles';
import {
  PencilIcon,
  CalendarIcon,
  CloudUploadIcon,
  ShareLinkIcon,
} from './ProfileIcons';

interface ProfileQuickActionsProps {
  onEditProfile?: () => void;
  onMySchedule?: () => void;
  onImportSchedule?: () => void;
  onShareLink?: () => void;
}

export const ProfileQuickActions: React.FC<ProfileQuickActionsProps> = ({
  onEditProfile,
  onMySchedule,
  onImportSchedule,
  onShareLink,
}) => {
  return (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.quickActionItem}
        onPress={onEditProfile}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Edit Profile"
      >
        <View style={styles.quickActionCircle}>
          <PencilIcon size={20} color="#151F17" />
        </View>
        <Text style={styles.quickActionLabel}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionItem}
        onPress={onMySchedule}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="My Schedule"
      >
        <View style={styles.quickActionCircle}>
          <CalendarIcon size={20} color="#151F17" />
        </View>
        <Text style={styles.quickActionLabel}>My Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionItem}
        onPress={onImportSchedule}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Import Schedule"
      >
        <View style={styles.quickActionCircle}>
          <CloudUploadIcon size={20} color="#151F17" />
        </View>
        <Text style={styles.quickActionLabel}>Import Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionItem}
        onPress={onShareLink}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Share Link"
      >
        <View style={styles.quickActionCircle}>
          <ShareLinkIcon size={20} color="#151F17" />
        </View>
        <Text style={styles.quickActionLabel}>Share Link</Text>
      </TouchableOpacity>
    </View>
  );
};
