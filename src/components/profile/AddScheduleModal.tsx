import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { styles } from './ProfileModals.styles';

export interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (activity: { title: string; day: string; time: string; room?: string }) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  onAdded,
}) => {
  const [title, setTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [room, setRoom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Activity title is required.');
      return;
    }

    onAdded({
      title: title.trim(),
      day: selectedDay,
      time: `${startTime} – ${endTime}`,
      room: room.trim() || undefined,
    });
    setTitle('');
    setRoom('');
    setError(null);
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
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.sheetCloseButton} onPress={onClose}>
                <Text style={styles.sheetCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetTitle}>Add Schedule Block</Text>
            <Text style={styles.sheetSubtitle}>
              Manually enter a class, lab, study session, or recurring club meeting.
            </Text>

            {error && (
              <View style={[styles.feedbackBanner, styles.errorBanner]}>
                <Text style={styles.feedbackText}>{error}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Activity / Subject Title</Text>
                <TextInput
                  style={styles.inputCard}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    if (error) setError(null);
                  }}
                  placeholder="E.g. Computer Networks"
                  placeholderTextColor="#7D8D7E"
                />
              </View>

              {/* Day selection tabs */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Day of Week</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {DAYS.map((d) => {
                    const isSel = selectedDay === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={{
                          backgroundColor: isSel ? '#354837' : '#FFFFFF',
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 10,
                        }}
                        onPress={() => setSelectedDay(d)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={{
                            fontFamily: 'DMSans_700Bold',
                            fontSize: 12,
                            color: isSel ? '#FFFFFF' : '#151F17',
                          }}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.inputCard}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="8:00 AM"
                    placeholderTextColor="#7D8D7E"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput
                    style={styles.inputCard}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="9:30 AM"
                    placeholderTextColor="#7D8D7E"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Room / Location (Optional)</Text>
                <TextInput
                  style={styles.inputCard}
                  value={room}
                  onChangeText={setRoom}
                  placeholder="E.g. AS 204 or Library 2F"
                  placeholderTextColor="#7D8D7E"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionBtnText}>SAVE SCHEDULE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
