import React from 'react';
import { Modal } from 'react-native';
import { OcrScheduleImportScreen } from '../../screens/OcrScheduleImportScreen';
import { OcrExtractedEntry } from '../../types/ocrImport';

export interface ImportScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onImported: (entries?: OcrExtractedEntry[]) => void;
  onViewMySchedule?: () => void;
}

export const ImportScheduleModal: React.FC<ImportScheduleModalProps> = ({
  visible,
  onClose,
  onImported,
  onViewMySchedule,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <OcrScheduleImportScreen
        onClose={onClose}
        onViewMySchedule={() => {
          onClose();
          onViewMySchedule?.();
        }}
        onImportSuccess={(entries) => {
          onImported(entries);
        }}
      />
    </Modal>
  );
};
