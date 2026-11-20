import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { styles } from './ProfileModals.styles';
import {
  SharedLinkPermission,
  SharedLinkExpiration,
  SharedLinkConfig,
} from '../../types/profile';

export type { SharedLinkPermission, SharedLinkExpiration, SharedLinkConfig };

export interface SharedLinksModalProps {
  visible: boolean;
  username: string;
  initialConfig?: Partial<SharedLinkConfig>;
  onClose: () => void;
  onSave?: (config: SharedLinkConfig) => void;
}

const EXPIRATION_OPTIONS: { id: SharedLinkExpiration; label: string; sub: string }[] = [
  { id: '1_hour', label: '1 hour', sub: 'Expires 1 hour after creation' },
  { id: '24_hours', label: '24 hours', sub: 'Expires in 1 day' },
  { id: '7_days', label: '7 days', sub: 'Expires in 1 week (Recommended)' },
  { id: '30_days', label: '30 days', sub: 'Expires in 1 month' },
  { id: 'never', label: 'Never / Custom date', sub: 'Does not expire automatically' },
];

const PRESET_HOURS = [
  { label: 'Campus Hours', start: '07:00 AM', end: '06:00 PM' },
  { label: 'Morning Only', start: '08:00 AM', end: '12:00 PM' },
  { label: 'Afternoon', start: '01:00 PM', end: '05:00 PM' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

export const SharedLinksModal: React.FC<SharedLinksModalProps> = ({
  visible,
  username,
  initialConfig,
  onClose,
  onSave,
}) => {
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<SharedLinkPermission>(
    initialConfig?.permission || 'full_schedule'
  );
  const [expiration, setExpiration] = useState<SharedLinkExpiration>(
    initialConfig?.expiration || '7_days'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Specific hours configuration state
  const [startHour, setStartHour] = useState(
    initialConfig?.specificHours?.startHour || '08:00 AM'
  );
  const [endHour, setEndHour] = useState(
    initialConfig?.specificHours?.endHour || '05:00 PM'
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialConfig?.specificHours?.days || ['M', 'T', 'W', 'Th', 'F']
  );

  // Synchronize state when modal opens
  useEffect(() => {
    if (visible) {
      setCopied(false);
      setIsDropdownOpen(false);
      if (initialConfig?.permission) setPermission(initialConfig.permission);
      if (initialConfig?.expiration) setExpiration(initialConfig.expiration);
      if (initialConfig?.specificHours?.startHour) {
        setStartHour(initialConfig.specificHours.startHour);
      }
      if (initialConfig?.specificHours?.endHour) {
        setEndHour(initialConfig.specificHours.endHour);
      }
      if (initialConfig?.specificHours?.days) {
        setSelectedDays(initialConfig.specificHours.days);
      }
    }
  }, [visible, initialConfig]);

  const shareUrl = `https://www.cnufree.com/profile/${username || 'cnufree_8472'}`;

  // Handle URL Copy
  const handleCopy = () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Ignore clipboard write errors in restricted web frames
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2400);
  };

  // Toggle days for specific hours
  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Apply hour preset
  const handleApplyPreset = (preset: { start: string; end: string }) => {
    setStartHour(preset.start);
    setEndHour(preset.end);
  };

  // Save changes
  const handleSave = () => {
    const config: SharedLinkConfig = {
      permission,
      expiration,
      isEnabled: true,
      specificHours:
        permission === 'specific_hours'
          ? {
              startHour,
              endHour,
              days: selectedDays,
            }
          : undefined,
    };
    onSave?.(config);
    onClose();
  };

  const selectedExpirationObj =
    EXPIRATION_OPTIONS.find((opt) => opt.id === expiration) || EXPIRATION_OPTIONS[2];

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
            {/* Title & Subtitle (Centered as in Figma UI-43 / PS-10) */}
            <Text style={styles.shareScheduleTitle}>Share your schedule</Text>
            <Text style={styles.shareScheduleSubtitle}>
              Choose what others can see in your schedule.
            </Text>

            {/* URL Display Pill with Copy Button */}
            <View style={styles.shareUrlPill}>
              <Text style={styles.shareUrlText} numberOfLines={1}>
                {shareUrl}
              </Text>
              <TouchableOpacity
                style={styles.shareUrlCopyBtn}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                {copied ? (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17L4 12"
                      stroke="#1A5A31"
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="9"
                      y="9"
                      width="12"
                      height="12"
                      rx="2.5"
                      stroke="#151F17"
                      strokeWidth={2}
                    />
                    <Path
                      d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                      stroke="#151F17"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            </View>

            {/* Card 1: What can people see? (Access Permissions) */}
            <View style={styles.shareCard}>
              <Text style={styles.shareCardTitle}>What can people see?</Text>

              <View style={styles.shareOptionsStack}>
                {/* 1. Full Schedule */}
                <TouchableOpacity
                  style={styles.shareOptionRow}
                  activeOpacity={0.8}
                  onPress={() => setPermission('full_schedule')}
                >
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>Full Schedule</Text>
                  </View>
                  <View
                    style={[
                      styles.shareRadioCircle,
                      permission === 'full_schedule' && styles.shareRadioCircleSelected,
                    ]}
                  />
                </TouchableOpacity>

                {/* 2. Free/Busy Only */}
                <TouchableOpacity
                  style={styles.shareOptionRow}
                  activeOpacity={0.8}
                  onPress={() => setPermission('free_busy_only')}
                >
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>Free/Busy Only</Text>
                  </View>
                  <View
                    style={[
                      styles.shareRadioCircle,
                      permission === 'free_busy_only' && styles.shareRadioCircleSelected,
                    ]}
                  />
                </TouchableOpacity>

                {/* 3. Specific Hours */}
                <TouchableOpacity
                  style={styles.shareOptionRow}
                  activeOpacity={0.8}
                  onPress={() => setPermission('specific_hours')}
                >
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>Specific Hours</Text>
                  </View>
                  <View
                    style={[
                      styles.shareRadioCircle,
                      permission === 'specific_hours' && styles.shareRadioCircleSelected,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Specific Hours Interactive Configuration Panel */}
              {permission === 'specific_hours' && (
                <View style={styles.specificHoursSubCard}>
                  <Text style={styles.specificHoursHeader}>Visible Hours & Days</Text>
                  
                  <View style={styles.specificHoursRow}>
                    <View style={styles.specificHoursInputBox}>
                      <Text style={styles.specificHoursInputText}>{startHour}</Text>
                    </View>
                    <Text style={styles.specificHoursToText}>to</Text>
                    <View style={styles.specificHoursInputBox}>
                      <Text style={styles.specificHoursInputText}>{endHour}</Text>
                    </View>
                  </View>

                  {/* Day Selection */}
                  <View style={styles.specificHoursDayRow}>
                    {WEEK_DAYS.map((day) => {
                      const isActive = selectedDays.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.specificHoursDayChip,
                            isActive && styles.specificHoursDayChipActive,
                          ]}
                          onPress={() => handleToggleDay(day)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.specificHoursDayText,
                              isActive && styles.specificHoursDayTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Card 2: Link expiration (Expiration Date/Time Configuration) */}
            <View style={styles.shareCard}>
              <Text style={styles.shareCardTitle}>Link expiration</Text>

              {/* Dropdown Selector */}
              <TouchableOpacity
                style={styles.dropdownTrigger}
                activeOpacity={0.85}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.dropdownTriggerText}>
                  {selectedExpirationObj.label}
                </Text>
                <Svg width={12} height={8} viewBox="0 0 12 8" fill="none">
                  <Path
                    d={isDropdownOpen ? "M1 6.5L6 1.5L11 6.5" : "M1 1.5L6 6.5L11 1.5"}
                    stroke="#151F17"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              {/* Dropdown Menu Options */}
              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {EXPIRATION_OPTIONS.map((opt) => {
                    const isSelected = expiration === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setExpiration(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        activeOpacity={0.75}
                      >
                        <View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              isSelected && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
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
                </View>
              )}
            </View>

            {/* Bottom Action Buttons: Cancel and Save (Figma UI-43 Match) */}
            <View style={styles.shareButtonGroup}>
              <TouchableOpacity
                style={styles.shareCancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.shareCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareSaveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={styles.shareSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
