import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { OcrExtractedEntry } from '../../types/ocrImport';
import { EditPencilIcon, TrashIcon, PlusIcon } from './OcrIcons';

interface OcrReviewTableProps {
  entries: OcrExtractedEntry[];
  onUpdateEntries: (entries: OcrExtractedEntry[]) => void;
  onConfirmAndSave: () => void;
  onDiscardImport: () => void;
}

export const OcrReviewTable: React.FC<OcrReviewTableProps> = ({
  entries,
  onUpdateEntries,
  onConfirmAndSave,
  onDiscardImport,
}) => {
  // Editing state
  const [editingEntry, setEditingEntry] = useState<OcrExtractedEntry | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [activityInput, setActivityInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openEditModal = (entry: OcrExtractedEntry) => {
    setEditingEntry(entry);
    setIsAddingNew(false);
    setActivityInput(entry.activityName);
    setDateInput(entry.date);
    setTimeInput(entry.time);
    setRoomInput(entry.room || '');
    setErrorMessage(null);
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setIsAddingNew(true);
    setActivityInput('');
    setDateInput('M Th');
    setTimeInput('8:00 AM - 9:30 AM');
    setRoomInput('');
    setErrorMessage(null);
  };

  const handleSaveModal = () => {
    if (!activityInput.trim()) {
      setErrorMessage('Activity name is required.');
      return;
    }
    if (!dateInput.trim()) {
      setErrorMessage('Date is required (e.g. M Th, T F).');
      return;
    }
    if (!timeInput.trim()) {
      setErrorMessage('Time is required (e.g. 8:00 AM - 9:30 AM).');
      return;
    }

    if (isAddingNew) {
      const newEntry: OcrExtractedEntry = {
        id: `ocr-entry-${Date.now()}`,
        activityName: activityInput.trim(),
        date: dateInput.trim(),
        time: timeInput.trim(),
        room: roomInput.trim() || undefined,
        isBusy: true,
      };
      onUpdateEntries([...entries, newEntry]);
    } else if (editingEntry) {
      const updated = entries.map((item) =>
        item.id === editingEntry.id
          ? {
              ...item,
              activityName: activityInput.trim(),
              date: dateInput.trim(),
              time: timeInput.trim(),
              room: roomInput.trim() || undefined,
            }
          : item
      );
      onUpdateEntries(updated);
    }

    closeModal();
  };

  const handleDeleteEntry = (idToDelete: string) => {
    const updated = entries.filter((e) => e.id !== idToDelete);
    onUpdateEntries(updated);
    closeModal();
  };

  const closeModal = () => {
    setEditingEntry(null);
    setIsAddingNew(false);
    setErrorMessage(null);
  };

  return (
    <View style={styles.container}>
      {/* Helper text explaining row correction */}
      <View style={styles.reviewHeaderHelper}>
        <Text style={styles.reviewHelperText}>
          Tap any row to correct activity name, date, or time before saving.
        </Text>
        <TouchableOpacity
          style={styles.addEntryHeaderBtn}
          onPress={openAddModal}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add missing entry"
        >
          <PlusIcon size={14} color={COLORS.white} />
          <Text style={styles.addEntryHeaderText}>Add Row</Text>
        </TouchableOpacity>
      </View>

      {/* ================= DARK GREEN TABLE CONTAINER (FIGMA PS-07) ================= */}
      <View style={styles.tableCardContainer}>
        {/* Table Content */}
        <View style={styles.tableBox}>
          {/* Header Row: Light sage background (#AEC1B0) matching Figma PS-07 */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.headerCell, styles.cellActivity]}>
              <Text style={styles.headerCellText}>ACTIVITY NAME</Text>
            </View>
            <View style={[styles.headerCell, styles.cellDate]}>
              <Text style={styles.headerCellText}>DATE</Text>
            </View>
            <View style={[styles.headerCell, styles.cellTime, { borderRightWidth: 0 }]}>
              <Text style={styles.headerCellText}>TIME</Text>
            </View>
          </View>

          {/* Body Rows with Vertical Scroll */}
          <ScrollView
            style={styles.tableBodyScrollView}
            contentContainerStyle={styles.tableBodyContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {entries.length === 0 ? (
              <View style={styles.emptyTableState}>
                <Text style={styles.emptyTableText}>No entries extracted.</Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={openAddModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyAddButtonText}>+ Add Entry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              entries.map((entry, index) => {
                const isLast = index === entries.length - 1;
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[
                      styles.tableDataRow,
                      isLast && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => openEditModal(entry)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${entry.activityName}`}
                  >
                    {/* Activity Column */}
                    <View style={[styles.dataCell, styles.cellActivity]}>
                      <Text style={styles.dataActivityText} numberOfLines={2}>
                        {entry.activityName}
                      </Text>
                      {entry.room ? (
                        <Text style={styles.dataRoomText} numberOfLines={1}>
                          {entry.room}
                        </Text>
                      ) : null}
                    </View>

                    {/* Date Column */}
                    <View style={[styles.dataCell, styles.cellDate]}>
                      <Text style={styles.dataCellText} numberOfLines={2}>
                        {entry.date}
                      </Text>
                    </View>

                    {/* Time Column */}
                    <View
                      style={[
                        styles.dataCell,
                        styles.cellTime,
                        { borderRightWidth: 0 },
                      ]}
                    >
                      <Text style={styles.dataTimeText} numberOfLines={2}>
                        {entry.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Scrollbar Accent Indicator matching Figma PS-07 wireframe */}
        <View style={styles.scrollbarTrack}>
          <View style={styles.scrollbarThumb} />
        </View>
      </View>

      {/* ================= BUTTONS (MATCH FIGMA PS-07) ================= */}
      <View style={styles.actionsContainer}>
        {/* 1. Confirm & Save Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirmAndSave}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Confirm and Save"
        >
          <Text style={styles.confirmButtonText}>Confirm & Save</Text>
        </TouchableOpacity>

        {/* 2. Discard Import Button */}
        <TouchableOpacity
          style={styles.discardButton}
          onPress={onDiscardImport}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Discard Import"
        >
          <Text style={styles.discardButtonText}>Discard Import</Text>
        </TouchableOpacity>
      </View>

      {/* ================= EDIT / ADD ENTRY MODAL (PS-07) ================= */}
      <Modal
        visible={!!editingEntry || isAddingNew}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingNew ? 'Add Schedule Entry' : 'Edit Extracted Entry'}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Field: Activity Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ACTIVITY NAME</Text>
              <TextInput
                style={styles.textInput}
                value={activityInput}
                onChangeText={setActivityInput}
                placeholder="e.g. CMSC 142 or Algorithms"
                placeholderTextColor="#7C8F7E"
              />
            </View>

            {/* Field: Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DATE / DAYS</Text>
              <TextInput
                style={styles.textInput}
                value={dateInput}
                onChangeText={setDateInput}
                placeholder="e.g. M Th, T F, or 2026-10-20"
                placeholderTextColor="#7C8F7E"
              />
            </View>

            {/* Field: Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TIME</Text>
              <TextInput
                style={styles.textInput}
                value={timeInput}
                onChangeText={setTimeInput}
                placeholder="e.g. 8:00 AM - 9:30 AM"
                placeholderTextColor="#7C8F7E"
              />
            </View>

            {/* Field: Room (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ROOM / LOCATION (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                value={roomInput}
                onChangeText={setRoomInput}
                placeholder="e.g. AL211A"
                placeholderTextColor="#7C8F7E"
              />
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalButtonsRow}>
              {editingEntry && (
                <TouchableOpacity
                  style={styles.deleteModalButton}
                  onPress={() => handleDeleteEntry(editingEntry.id)}
                  activeOpacity={0.8}
                >
                  <TrashIcon size={16} color="#B25D5D" />
                  <Text style={styles.deleteModalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalButton}
                onPress={handleSaveModal}
                activeOpacity={0.85}
              >
                <Text style={styles.saveModalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
  },
  reviewHeaderHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  reviewHelperText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#213323',
    lineHeight: 16,
  },
  addEntryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#506552',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  addEntryHeaderText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.white,
  },
  tableCardContainer: {
    position: 'relative',
    backgroundColor: '#506552',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#3C4D3E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tableBox: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#3C4D3E',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#AEC1B0',
    borderBottomWidth: 1.5,
    borderBottomColor: '#3C4D3E',
  },
  headerCell: {
    paddingVertical: 9,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3C4D3E',
  },
  headerCellText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#121A14',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cellActivity: {
    flex: 1.2,
  },
  cellDate: {
    flex: 0.9,
  },
  cellTime: {
    flex: 1.1,
  },
  tableBodyScrollView: {
    maxHeight: 280,
    backgroundColor: COLORS.white,
  },
  tableBodyContent: {
    flexGrow: 1,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7DE',
    minHeight: 44,
  },
  dataCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E7DE',
  },
  dataActivityText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#121A14',
  },
  dataRoomText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#657867',
    marginTop: 2,
  },
  dataCellText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#28392A',
    textAlign: 'center',
  },
  dataTimeText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#28392A',
    textAlign: 'center',
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 3,
    top: 24,
    bottom: 24,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    justifyContent: 'flex-start',
  },
  scrollbarThumb: {
    width: 4,
    height: 70,
    backgroundColor: '#354537',
    borderRadius: 2,
  },
  emptyTableState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#556957',
    marginBottom: 8,
  },
  emptyAddButton: {
    backgroundColor: '#506552',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#566A57',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  discardButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  discardButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#121A14',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#4A5E4C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#121A14',
  },
  modalCloseText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#4B5E4D',
    padding: 4,
  },
  errorBanner: {
    backgroundColor: '#FEE5E5',
    borderWidth: 1,
    borderColor: '#E57373',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  errorBannerText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#C0392B',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#344936',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  textInput: {
    height: 42,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#98AC9A',
    paddingHorizontal: 12,
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#121A14',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  deleteModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#EAB8B8',
    gap: 4,
    marginRight: 'auto',
  },
  deleteModalButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#B25D5D',
  },
  cancelModalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  cancelModalButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#334435',
  },
  saveModalButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#566A57',
  },
  saveModalButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
  },
});
