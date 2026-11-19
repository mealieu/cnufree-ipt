import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from './ProfileModals.styles';

export type VisibilityOption = 'friends' | 'public' | 'private';

export interface ScheduleVisibilityModalProps {
  visible: boolean;
  currentVisibility?: VisibilityOption;
  onClose: () => void;
  onSave: (visibility: VisibilityOption) => void;
}

const VISIBILITY_OPTIONS = [
  {
    id: 'friends' as VisibilityOption,
    title: 'Accepted Friends (Recommended)',
    desc: 'Only friends you have accepted can see your free and busy intervals.',
  },
  {
    id: 'public' as VisibilityOption,
    title: 'Campus Community',
    desc: 'Any verified student on campus can view when you are free or busy.',
  },
  {
    id: 'private' as VisibilityOption,
    title: 'Private (Only Me)',
    desc: 'Your schedule will be completely hidden from all friends and classmates.',
  },
];

export const ScheduleVisibilityModal: React.FC<ScheduleVisibilityModalProps> = ({
  visible,
  currentVisibility = 'friends',
  onClose,
  onSave,
}) => {
  const [selected, setSelected] = useState<VisibilityOption>(currentVisibility);

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
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.sheetCloseButton} onPress={onClose}>
                <Text style={styles.sheetCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetTitle}>Schedule Visibility</Text>
            <Text style={styles.sheetSubtitle}>
              Control who can see your free slots, busy class hours, and location on the shared tracker.
            </Text>

            <View style={styles.optionsList}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setSelected(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>{opt.title}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => {
                onSave(selected);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionBtnText}>SAVE PREFERENCE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
