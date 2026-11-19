import React from 'react';
import { AddEditScheduleEntryModal } from '../personalSchedule/AddEditScheduleEntryModal';
import { ScheduleEntryFormData } from '../../types/personalSchedule';

export interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: (activity: {
    title: string;
    day: string;
    time: string;
    date?: string;
    room?: string;
    notes?: string;
  }) => void;
  onSave?: (entry: ScheduleEntryFormData) => void;
}

/**
 * AddScheduleModal (PS-01 / PS-05)
 * Wraps AddEditScheduleEntryModal to ensure consistent PS-05 Figma fidelity when opened from ProfileScreen.
 */
export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  onAdded,
  onSave,
}) => {
  const handleSave = (entry: ScheduleEntryFormData) => {
    onSave?.(entry);
    onAdded?.({
      title: entry.title,
      day: entry.dayKey,
      time: `${entry.startTime} – ${entry.endTime}`,
      date: entry.date,
      room: entry.room,
      notes: entry.notes,
    });
  };

  return (
    <AddEditScheduleEntryModal
      visible={visible}
      selectedDayKey="sat" // Matches Figma wireframe default (Saturday, 24 / 10 / 2026)
      initialDate="24 / 10 / 2026"
      onClose={onClose}
      onSave={handleSave}
    />
  );
};

export default AddScheduleModal;
