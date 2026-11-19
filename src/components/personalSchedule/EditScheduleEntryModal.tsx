import React from 'react';
import {
  AddEditScheduleEntryModal,
  AddEditScheduleEntryModalProps,
} from './AddEditScheduleEntryModal';
import { PersonalSchedulePeriod, ScheduleEntryFormData } from '../../types/personalSchedule';

export interface EditScheduleEntryModalProps {
  visible: boolean;
  initialPeriod?: PersonalSchedulePeriod | null;
  selectedDayKey?: string;
  initialDate?: string;
  onClose: () => void;
  onSave: (entry: ScheduleEntryFormData) => void;
}

/**
 * EditScheduleEntryModal (PS-03 / PS-05)
 * Wraps AddEditScheduleEntryModal to preserve backward compatibility while matching Figma PS-05 design.
 */
export const EditScheduleEntryModal: React.FC<EditScheduleEntryModalProps> = (props) => {
  return <AddEditScheduleEntryModal {...props} />;
};

export default EditScheduleEntryModal;
