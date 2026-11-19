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
import { FONTS } from '../../constants/typography';
import { ScheduleEntryFormData, PersonalSchedulePeriod } from '../../types/personalSchedule';

export interface EditScheduleEntryModalProps {
  visible: boolean;
  initialPeriod?: PersonalSchedulePeriod | null;
  selectedDayKey: string;
  onClose: () => void;
  onSave: (entry: ScheduleEntryFormData) => void;
}

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thurs' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const EditScheduleEntryModal: React.FC<EditScheduleEntryModalProps> = ({
  visible,
  initialPeriod,
  selectedDayKey,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [isBusy, setIsBusy] = useState(true);
  const [dayKey, setDayKey] = useState(selectedDayKey);
  const [startTime, setStartTime] = useState('8:00 AM');
  const [endTime, setEndTime] = useState('9:00 AM');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialPeriod) {
        setTitle(initialPeriod.title);
        setIsBusy(initialPeriod.isBusy);
        setDayKey(initialPeriod.dayKey || selectedDayKey);
        setStartTime(initialPeriod.startTime);
        setEndTime(initialPeriod.endTime);
        setRoom(initialPeriod.room || '');
        setNotes(initialPeriod.notes || '');
      } else {
        setTitle('');
        setIsBusy(true);
        setDayKey(selectedDayKey);
        setStartTime('8:00 AM');
        setEndTime('9:00 AM');
        setRoom('');
        setNotes('');
      }
      setErrorMessage(null);
    }
  }, [visible, initialPeriod, selectedDayKey]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Activity title or subject name is required.');
      return;
    }

    if (!startTime.trim() || !endTime.trim()) {
      setErrorMessage('Start time and end time are required.');
      return;
    }

    onSave({
      id: initialPeriod ? initialPeriod.id : undefined,
      title: trimmedTitle,
      isBusy,
      dayKey,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      timeMarker: startTime.trim(),
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const isEditing = Boolean(initialPeriod);

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
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {isEditing ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
              </Text>
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.sheetCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSubtitle}>
              {isEditing
                ? 'Update your occupied class or free study period details.'
                : 'Add a new occupied period or free time window to your daily schedule.'}
            </Text>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {/* Type Selector (Busy vs Free) */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Period Type</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeSelectorBtn,
                    isBusy && styles.typeSelectorBtnBusyActive,
                  ]}
                  onPress={() => setIsBusy(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.busyIconSmall} />
                  <Text
                    style={[
                      styles.typeSelectorText,
                      isBusy && styles.typeSelectorTextActive,
                    ]}
                  >
                    Occupied (Busy)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSelectorBtn,
                    !isBusy && styles.typeSelectorBtnFreeActive,
                  ]}
                  onPress={() => setIsBusy(false)}
                  activeOpacity={0.8}
                >
                  <View style={styles.freeIconSmall} />
                  <Text
                    style={[
                      styles.typeSelectorText,
                      !isBusy && styles.typeSelectorTextActive,
                    ]}
                  >
                    Available (Free)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title / Subject Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Activity / Subject Title *</Text>
              <TextInput
                style={styles.inputCard}
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={isBusy ? 'E.g. Computer Networks' : 'E.g. Free Time'}
                placeholderTextColor="#6D7E70"
              />
            </View>

            {/* Day of Week Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Day of Week</Text>
              <View style={styles.daysRow}>
                {DAYS.map((d) => {
                  const isSel = dayKey === d.key;
                  return (
                    <TouchableOpacity
                      key={d.key}
                      style={[styles.dayPill, isSel && styles.dayPillActive]}
                      onPress={() => setDayKey(d.key)}
                      activeOpacity={0.78}
                    >
                      <Text style={[styles.dayPillText, isSel && styles.dayPillTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={styles.inputLabel}>Start Time *</Text>
                <TextInput
                  style={styles.inputCard}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="8:00 AM"
                  placeholderTextColor="#6D7E70"
                />
              </View>

              <View style={styles.timeCol}>
                <Text style={styles.inputLabel}>End Time *</Text>
                <TextInput
                  style={styles.inputCard}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="9:30 AM"
                  placeholderTextColor="#6D7E70"
                />
              </View>
            </View>

            {/* Room / Location */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Room / Location (Optional)</Text>
              <TextInput
                style={styles.inputCard}
                value={room}
                onChangeText={setRoom}
                placeholder="E.g. AL211A, Library 3F"
                placeholderTextColor="#6D7E70"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.inputCard, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="E.g. Lecture with Prof. Garcia"
                placeholderTextColor="#6D7E70"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSave}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Save schedule entry"
            >
              <Text style={styles.primaryActionBtnText}>
                {isEditing ? 'UPDATE SCHEDULE ENTRY' : 'SAVE SCHEDULE ENTRY'}
              </Text>
            </TouchableOpacity>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  dragHandleBar: {
    width: 38,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#151F17',
    letterSpacing: -0.2,
  },
  sheetCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sheetCloseButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  sheetSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#243326',
    lineHeight: 17,
    marginBottom: 14,
  },
  errorBanner: {
    backgroundColor: '#FADBD8',
    borderWidth: 1,
    borderColor: '#E57373',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#9B2C2C',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1D2A1F',
    marginBottom: 4,
    marginLeft: 2,
  },
  inputCard: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#151F17',
  },
  notesInput: {
    height: 64,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeSelectorBtnBusyActive: {
    backgroundColor: '#FEE5E5',
    borderColor: '#E57373',
  },
  typeSelectorBtnFreeActive: {
    backgroundColor: '#D6EFE0',
    borderColor: '#4ADE80',
  },
  busyIconSmall: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#E84746',
  },
  freeIconSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#38D926',
  },
  typeSelectorText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#425547',
  },
  typeSelectorTextActive: {
    color: '#151F17',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  dayPillActive: {
    backgroundColor: '#354837',
  },
  dayPillText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#151F17',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timeCol: {
    flex: 1,
  },
  primaryActionBtn: {
    backgroundColor: '#354837',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
