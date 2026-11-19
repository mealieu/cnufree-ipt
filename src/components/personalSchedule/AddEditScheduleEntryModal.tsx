import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import {
  PersonalSchedulePeriod,
  ScheduleEntryFormData,
} from '../../types/personalSchedule';

export interface AddEditScheduleEntryModalProps {
  visible: boolean;
  initialPeriod?: PersonalSchedulePeriod | null;
  selectedDayKey?: string;
  initialDate?: string;
  onClose: () => void;
  onSave: (entry: ScheduleEntryFormData) => void;
}

const WEEK_DATE_OPTIONS = [
  { dayKey: 'mon', date: '19 / 10 / 2026' },
  { dayKey: 'tue', date: '20 / 10 / 2026' },
  { dayKey: 'wed', date: '21 / 10 / 2026' },
  { dayKey: 'thu', date: '22 / 10 / 2026' },
  { dayKey: 'fri', date: '23 / 10 / 2026' },
  { dayKey: 'sat', date: '24 / 10 / 2026' },
  { dayKey: 'sun', date: '25 / 10 / 2026' },
];

export const AddEditScheduleEntryModal: React.FC<AddEditScheduleEntryModalProps> = ({
  visible,
  initialPeriod,
  selectedDayKey,
  initialDate,
  onClose,
  onSave,
}) => {
  // Form State
  const [activityName, setActivityName] = useState('');
  const [date, setDate] = useState('24 / 10 / 2026'); // Matches exact Figma wireframe default
  const [dayKey, setDayKey] = useState('sat');
  const [startTime, setStartTime] = useState('7:00 AM'); // Matches exact wireframe
  const [endTime, setEndTime] = useState('3:00 AM');   // Matches exact wireframe
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derive initial values on modal show / change
  useEffect(() => {
    if (visible) {
      if (initialPeriod) {
        setActivityName(initialPeriod.title || '');
        setDayKey(initialPeriod.dayKey || selectedDayKey || 'sat');
        const matchedDate = WEEK_DATE_OPTIONS.find(
          (d) => d.dayKey === (initialPeriod.dayKey || selectedDayKey)
        )?.date;
        setDate(initialDate || matchedDate || '24 / 10 / 2026');
        setStartTime(initialPeriod.startTime || '7:00 AM');
        setEndTime(initialPeriod.endTime || '3:00 AM');
        setNotes(initialPeriod.notes || initialPeriod.room || '');
      } else {
        setActivityName('');
        const resolvedDayKey = selectedDayKey || 'sat';
        setDayKey(resolvedDayKey);
        const matchedDate = WEEK_DATE_OPTIONS.find(
          (d) => d.dayKey === resolvedDayKey
        )?.date;
        setDate(initialDate || matchedDate || '24 / 10 / 2026');
        setStartTime('7:00 AM');
        setEndTime('3:00 AM');
        setNotes('');
      }
      setErrorMessage(null);
    }
  }, [visible, initialPeriod, selectedDayKey, initialDate]);

  const handleSave = () => {
    const trimmedTitle = activityName.trim();
    if (!trimmedTitle) {
      setErrorMessage('Activity Name is required.');
      return;
    }

    const trimmedDate = date.trim();
    if (!trimmedDate) {
      setErrorMessage('Date is required.');
      return;
    }

    const trimmedStart = startTime.trim();
    const trimmedEnd = endTime.trim();
    if (!trimmedStart || !trimmedEnd) {
      setErrorMessage('Start Time and End Time are required.');
      return;
    }

    // Resolve day key from date string if custom
    let resolvedDayKey = dayKey;
    const match = WEEK_DATE_OPTIONS.find((d) => d.date === trimmedDate);
    if (match) {
      resolvedDayKey = match.dayKey;
    }

    onSave({
      id: initialPeriod ? initialPeriod.id : undefined,
      title: trimmedTitle,
      isBusy: true,
      dayKey: resolvedDayKey,
      date: trimmedDate,
      startTime: trimmedStart,
      endTime: trimmedEnd,
      timeMarker: trimmedStart,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Dismiss modal backdrop"
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle (pill shape, pure white) */}
          <View style={styles.dragHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Validation Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* 1. Activity Name Card */}
            <View style={styles.fieldCard}>
              <View style={styles.fieldBadgePill}>
                <Text style={styles.fieldBadgeText}>Activity Name</Text>
              </View>
              <TextInput
                style={styles.textInputBox}
                value={activityName}
                onChangeText={(val) => {
                  setActivityName(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter activity name"
                placeholderTextColor="#7D8D7E"
                accessibilityLabel="Activity Name"
              />
            </View>

            {/* 2. Date Card */}
            <View style={styles.fieldCard}>
              <View style={styles.fieldBadgePill}>
                <Text style={styles.fieldBadgeText}>Date</Text>
              </View>

              <View style={styles.inputWithIconRow}>
                <TextInput
                  style={styles.textInputInline}
                  value={date}
                  onChangeText={(val) => {
                    setDate(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="24 / 10 / 2026"
                  placeholderTextColor="#7D8D7E"
                  accessibilityLabel="Schedule Date"
                />

                <View style={styles.iconContainer}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                      stroke="#151F17"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
                      stroke="#151F17"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>

            {/* 3. Start Time & End Time Card */}
            <View style={styles.fieldCard}>
              <View style={styles.twoColumnRow}>
                {/* Left: Start Time */}
                <View style={styles.flexColumn}>
                  <View style={styles.fieldBadgePill}>
                    <Text style={styles.fieldBadgeText}>Start Time</Text>
                  </View>
                  <View style={styles.inputWithIconRow}>
                    <TextInput
                      style={styles.textInputInline}
                      value={startTime}
                      onChangeText={(val) => {
                        setStartTime(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="7:00 AM"
                      placeholderTextColor="#7D8D7E"
                      accessibilityLabel="Start Time"
                    />
                    <View style={styles.iconContainer}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="#151F17"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M12 6V12L16 14"
                          stroke="#151F17"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </View>
                </View>

                {/* Right: End Time */}
                <View style={styles.flexColumn}>
                  <View style={styles.fieldBadgePill}>
                    <Text style={styles.fieldBadgeText}>End Time</Text>
                  </View>
                  <View style={styles.inputWithIconRow}>
                    <TextInput
                      style={styles.textInputInline}
                      value={endTime}
                      onChangeText={(val) => {
                        setEndTime(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="3:00 AM"
                      placeholderTextColor="#7D8D7E"
                      accessibilityLabel="End Time"
                    />
                    <View style={styles.iconContainer}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="#151F17"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M12 6V12L16 14"
                          stroke="#151F17"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. Notes (Optional) Card */}
            <View style={styles.fieldCard}>
              <View style={styles.notesHeaderRow}>
                <View style={styles.fieldBadgePill}>
                  <Text style={styles.fieldBadgeText}>Notes</Text>
                </View>
                <Text style={styles.optionalLabel}>(Optional)</Text>
              </View>

              <TextInput
                style={styles.notesInputBox}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add optional notes, room/building, professor..."
                placeholderTextColor="#7D8D7E"
                multiline
                textAlignVertical="top"
                accessibilityLabel="Optional Notes"
              />
            </View>

            {/* 5. Bottom Action Buttons: Cancel and Save */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cancel schedule entry"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Save schedule entry"
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 32, 22, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#82997E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '92%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.22)',
      },
    }),
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#991B1B',
  },
  fieldCard: {
    backgroundColor: '#5A7156',
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
  },
  fieldBadgePill: {
    backgroundColor: '#ACC5A6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  fieldBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#151F17',
    letterSpacing: 0.2,
  },
  textInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#151F17',
  },
  inputWithIconRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 48,
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  textInputInline: {
    flex: 1,
    minWidth: 0,
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: '#151F17',
    paddingVertical: 0,
    paddingRight: 6,
  },
  iconContainer: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexColumn: {
    flex: 1,
    minWidth: 0,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  optionalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#DCE6DC',
  },
  notesInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 110,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#151F17',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#151F17',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#566D52',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
