import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/typography';
import { TabId } from '../../types/navigation';
import {
  PersonalScheduleDay,
  PersonalSchedulePeriod,
  PersonalScheduleViewMode,
  ScheduleEntryFormData,
} from '../../types/personalSchedule';
import { getInitialPersonalScheduleDays } from '../../mock/personalScheduleData';
import { PeriodActionModal } from './PeriodActionModal';
import { EditScheduleEntryModal } from './EditScheduleEntryModal';
import { ConfirmDialogModal } from '../notifications/ConfirmDialogModal';
import { FeedbackToast } from '../notifications/FeedbackToast';
import { FeedbackToastConfig } from '../../types/notifications';

export interface PersonalScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  initialDateKey?: string;
  initialViewMode?: PersonalScheduleViewMode;
  onNavigateTab?: (tab: TabId) => void;
}

export const PersonalScheduleModal: React.FC<PersonalScheduleModalProps> = ({
  visible,
  onClose,
  initialDateKey = 'tue', // Default to Tuesday matching Figma mockup
  initialViewMode = 'daily',
}) => {
  // 1. View Mode State: 'daily' vs 'weekly' (PS-03 vs PS-04)
  const [viewMode, setViewMode] = useState<PersonalScheduleViewMode>(initialViewMode);

  // 2. Central Schedule Days Data State
  const [scheduleDays, setScheduleDays] = useState<PersonalScheduleDay[]>(() =>
    getInitialPersonalScheduleDays()
  );

  // 3. Selected Day State (e.g. 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
  const [selectedDayKey, setSelectedDayKey] = useState<string>(initialDateKey);

  // Reset day key if re-opened
  useEffect(() => {
    if (visible) {
      setSelectedDayKey(initialDateKey);
      setViewMode(initialViewMode);
    }
  }, [visible, initialDateKey, initialViewMode]);

  // 4. Currently active day object
  const currentDay = useMemo(() => {
    return (
      scheduleDays.find((d) => d.dayKey === selectedDayKey) ||
      scheduleDays[1] // Default to Tuesday
    );
  }, [scheduleDays, selectedDayKey]);

  // Index of current day for left / right navigation
  const currentDayIndex = useMemo(() => {
    return scheduleDays.findIndex((d) => d.dayKey === selectedDayKey);
  }, [scheduleDays, selectedDayKey]);

  // 5. Modal States for Schedule Editing Actions (PS-03)
  const [selectedPeriod, setSelectedPeriod] = useState<PersonalSchedulePeriod | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [periodToEdit, setPeriodToEdit] = useState<PersonalSchedulePeriod | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<PersonalSchedulePeriod | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  // 6. Toast Feedback State
  const [toast, setToast] = useState<FeedbackToastConfig | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((title: string, message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: `toast-${Date.now()}`,
      variant,
      title,
      message,
    });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Day Navigation (< and > buttons)
  const handlePrevDay = useCallback(() => {
    if (currentDayIndex > 0) {
      setSelectedDayKey(scheduleDays[currentDayIndex - 1].dayKey);
    } else {
      setSelectedDayKey(scheduleDays[scheduleDays.length - 1].dayKey);
    }
  }, [currentDayIndex, scheduleDays]);

  const handleNextDay = useCallback(() => {
    if (currentDayIndex < scheduleDays.length - 1) {
      setSelectedDayKey(scheduleDays[currentDayIndex + 1].dayKey);
    } else {
      setSelectedDayKey(scheduleDays[0].dayKey);
    }
  }, [currentDayIndex, scheduleDays]);

  // --- Schedule Editing Action Handlers (PS-03) ---

  const handlePeriodPress = useCallback((period: PersonalSchedulePeriod) => {
    setSelectedPeriod(period);
    setIsActionModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((period: PersonalSchedulePeriod) => {
    setIsActionModalOpen(false);
    setPeriodToEdit(period);
    setIsEditModalOpen(true);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setPeriodToEdit(null);
    setIsEditModalOpen(true);
  }, []);

  const handleToggleStatus = useCallback((period: PersonalSchedulePeriod) => {
    const updatedStatus = !period.isBusy;
    const newTitle = updatedStatus
      ? (period.title === 'Free' ? 'Busy' : period.title)
      : 'Free';

    setScheduleDays((prevDays) =>
      prevDays.map((day) => {
        if (day.dayKey !== period.dayKey) return day;
        return {
          ...day,
          periods: day.periods.map((p) =>
            p.id === period.id
              ? {
                  ...p,
                  isBusy: updatedStatus,
                  title: newTitle,
                }
              : p
          ),
        };
      })
    );

    setIsActionModalOpen(false);
    showToast(
      updatedStatus ? 'Marked as Occupied' : 'Marked as Free',
      `Period is now set to ${updatedStatus ? 'Busy' : 'Free'}.`
    );
  }, [showToast]);

  const handlePromptDelete = useCallback((period: PersonalSchedulePeriod) => {
    setIsActionModalOpen(false);
    setPeriodToDelete(period);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!periodToDelete) return;

    setScheduleDays((prevDays) =>
      prevDays.map((day) => {
        if (day.dayKey !== periodToDelete.dayKey) return day;
        return {
          ...day,
          periods: day.periods.filter((p) => p.id !== periodToDelete.id),
        };
      })
    );

    setIsDeleteConfirmOpen(false);
    setPeriodToDelete(null);
    showToast('Schedule Entry Removed', 'The period has been deleted from your schedule.');
  }, [periodToDelete, showToast]);

  const handleSaveEntry = useCallback((formData: ScheduleEntryFormData) => {
    const timeRangeStr = `${formData.startTime} – ${formData.endTime}`;

    if (formData.id) {
      // Editing existing period
      setScheduleDays((prevDays) =>
        prevDays.map((day) => {
          if (day.dayKey !== formData.dayKey) return day;
          return {
            ...day,
            periods: day.periods.map((p) =>
              p.id === formData.id
                ? {
                    ...p,
                    title: formData.title,
                    isBusy: formData.isBusy,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    timeRange: timeRangeStr,
                    timeMarker: formData.timeMarker || formData.startTime,
                    room: formData.room,
                    notes: formData.notes,
                    dayKey: formData.dayKey,
                  }
                : p
            ),
          };
        })
      );
      showToast('Schedule Entry Updated', `Updated "${formData.title}".`);
    } else {
      // Adding new period
      const newPeriod: PersonalSchedulePeriod = {
        id: `ps-entry-${Date.now()}`,
        title: formData.title,
        isBusy: formData.isBusy,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timeRange: timeRangeStr,
        timeMarker: formData.timeMarker || formData.startTime,
        startHour: 8.0,
        endHour: 9.0,
        room: formData.room,
        notes: formData.notes,
        dayKey: formData.dayKey,
      };

      setScheduleDays((prevDays) =>
        prevDays.map((day) => {
          if (day.dayKey !== formData.dayKey) return day;
          return {
            ...day,
            periods: [...day.periods, newPeriod],
          };
        })
      );
      showToast('Schedule Entry Added', `Added "${formData.title}" to ${formData.dayKey.toUpperCase()}.`);
    }
  }, [showToast]);

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
          accessibilityLabel="Dismiss schedule sheet"
        />

        {/* ================= SAGE MAIN CONTAINER (Matches Figma Sheet) ================= */}
        <View style={styles.sheetContainer}>
          {/* 1. White Drag Handle Pill */}
          <TouchableOpacity
            style={styles.dragHandleTouch}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close schedule"
          >
            <View style={styles.dragHandleBar} />
          </TouchableOpacity>

          <ScrollView
            style={styles.sheetScrollView}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 2. Header Row: [MY SCHEDULE] Badge & [DAILY | WEEKLY] Toggle */}
            <View style={styles.headerRow}>
              <View style={styles.myScheduleBadge}>
                <Text style={styles.myScheduleBadgeText}>MY SCHEDULE</Text>
              </View>

              <View style={styles.viewModeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.viewModeTab,
                    viewMode === 'daily' && styles.viewModeTabActive,
                  ]}
                  onPress={() => setViewMode('daily')}
                  activeOpacity={0.8}
                  accessibilityRole="tab"
                  accessibilityLabel="Daily schedule view"
                  accessibilityState={{ selected: viewMode === 'daily' }}
                >
                  <Text
                    style={[
                      styles.viewModeText,
                      viewMode === 'daily' && styles.viewModeTextActive,
                    ]}
                  >
                    DAILY
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewModeTab,
                    viewMode === 'weekly' && styles.viewModeTabActive,
                  ]}
                  onPress={() => setViewMode('weekly')}
                  activeOpacity={0.8}
                  accessibilityRole="tab"
                  accessibilityLabel="Weekly schedule view"
                  accessibilityState={{ selected: viewMode === 'weekly' }}
                >
                  <Text
                    style={[
                      styles.viewModeText,
                      viewMode === 'weekly' && styles.viewModeTextActive,
                    ]}
                  >
                    WEEKLY
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Date Navigation Bar (< Date >) */}
            <View style={styles.dateNavBar}>
              <TouchableOpacity
                style={styles.dateNavArrow}
                onPress={handlePrevDay}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Previous day"
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 19L8 12L15 5"
                    stroke="#172019"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.dateNavDisplayBox}>
                <Text style={styles.dateNavDisplayText} numberOfLines={1}>
                  {currentDay.fullDateString}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.dateNavArrow}
                onPress={handleNextDay}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Next day"
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 5L16 12L9 19"
                    stroke="#172019"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* 4. Weekday Filter Pills (Mon 19 | Tue 19 | Wed 21 | Thurs 22 | Fri 23 | Sat 24 | Sun 25) */}
            <View style={styles.weekdayRow}>
              {scheduleDays.map((day) => {
                const isSelected = day.dayKey === selectedDayKey;
                return (
                  <TouchableOpacity
                    key={day.dayKey}
                    style={[
                      styles.weekdayCard,
                      isSelected && styles.weekdayCardActive,
                    ]}
                    onPress={() => setSelectedDayKey(day.dayKey)}
                    activeOpacity={0.78}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.dayShort} ${day.dayDate}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.weekdayDayName,
                        isSelected && styles.weekdayDayNameActive,
                      ]}
                    >
                      {day.dayShort}
                    </Text>
                    <Text
                      style={[
                        styles.weekdayDateNum,
                        isSelected && styles.weekdayDateNumActive,
                      ]}
                    >
                      {day.dayDate}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5. Main Schedule Container (Green Outline Box) */}
            {viewMode === 'daily' ? (
              <View>
                <View style={styles.scheduleBoxContainer}>
                  {/* List of Occupied and Free Periods */}
                  {currentDay.periods.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateTitle}>No scheduled periods</Text>
                      <Text style={styles.emptyStateSubtitle}>
                        You have not set any classes, events, or free time for this day.
                      </Text>
                      <TouchableOpacity
                        style={styles.emptyStateAddBtn}
                        onPress={handleOpenAdd}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel="Add schedule entry"
                      >
                        <Text style={styles.emptyStateAddBtnText}>+ Add Schedule Entry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.periodsList}>
                      {currentDay.periods.map((period) => {
                        return (
                          <View key={period.id} style={styles.periodRow}>
                            {/* Left: Uniform Time Pill */}
                            <View style={styles.timePill}>
                              <Text style={styles.timePillText} numberOfLines={1}>
                                {period.timeMarker}
                              </Text>
                            </View>

                            {/* Right: Uniform Schedule Card (Tappable for editing actions) */}
                            <TouchableOpacity
                              style={styles.periodCard}
                              onPress={() => handlePeriodPress(period)}
                              activeOpacity={0.84}
                              accessibilityRole="button"
                              accessibilityLabel={`${period.isBusy ? 'Occupied' : 'Free'}: ${period.title}, ${period.timeRange}`}
                            >
                              {/* Status Icon Ring / Outline */}
                              <View style={styles.iconContainer}>
                                {period.isBusy ? (
                                  <View style={styles.busySquareOutline} />
                                ) : (
                                  <View style={styles.freeCircleOutline} />
                                )}
                              </View>

                              {/* Text Information: Uniform 2-Line Layout */}
                              <View style={styles.periodTextContainer}>
                                <Text style={styles.periodTitleText} numberOfLines={1}>
                                  {period.title}
                                </Text>
                                <Text style={styles.periodTimeRangeText} numberOfLines={1}>
                                  {period.timeRange}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Add Entry Schedule Editing Action (PS-03) */}
                <TouchableOpacity
                  style={styles.addEntryBottomBtn}
                  onPress={handleOpenAdd}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel="Add new schedule entry"
                >
                  <Text style={styles.addEntryBottomBtnText}>+ Add Schedule Block</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ================= PS-04 SCAFFOLDING ================= */
              // TODO: [TEMP HARNESS FOR PS-04 - REMOVE ON MERGE]
              <View style={styles.weeklyScaffoldContainer}>
                <View style={styles.weeklyScaffoldCard}>
                  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                      stroke="#2D4333"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M16 2V6M8 2V6M3 10H21"
                      stroke="#2D4333"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.weeklyScaffoldTitle}>Weekly Schedule View</Text>
                  <Text style={styles.weeklyScaffoldDesc}>
                    Teammate ticket [PS-04] will implement the personal weekly schedule view with weekly navigation.
                  </Text>
                  <TouchableOpacity
                    style={styles.switchBackDailyBtn}
                    onPress={() => setViewMode('daily')}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.switchBackDailyBtnText}>Switch to Daily View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ================= MODALS & TOASTS ================= */}
        <PeriodActionModal
          visible={isActionModalOpen}
          period={selectedPeriod}
          onClose={() => setIsActionModalOpen(false)}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handlePromptDelete}
        />

        <EditScheduleEntryModal
          visible={isEditModalOpen}
          initialPeriod={periodToEdit}
          selectedDayKey={selectedDayKey}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEntry}
        />

        <ConfirmDialogModal
          visible={isDeleteConfirmOpen}
          title="Delete Schedule Entry"
          description={`Are you sure you want to remove "${periodToDelete?.title}" from your daily schedule? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteConfirmOpen(false);
            setPeriodToDelete(null);
          }}
        />

        <FeedbackToast toast={toast} onDismiss={() => setToast(null)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#89A482',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    height: '88%',
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
  dragHandleTouch: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  dragHandleBar: {
    width: 38,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  sheetScrollView: {
    flexShrink: 1,
  },
  sheetScrollContent: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  myScheduleBadge: {
    backgroundColor: '#5C7057',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myScheduleBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  viewModeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#5C7057',
    borderRadius: 20,
    padding: 3,
  },
  viewModeTab: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  viewModeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  viewModeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  viewModeTextActive: {
    color: '#151F17',
  },
  dateNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C7057',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 12,
  },
  dateNavArrow: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavDisplayBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavDisplayText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#151F17',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 5,
  },
  weekdayCard: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#ACC5A6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekdayCardActive: {
    backgroundColor: '#5C7057',
  },
  weekdayDayName: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#1B251D',
  },
  weekdayDayNameActive: {
    color: '#FAF8EE',
  },
  weekdayDateNum: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1B251D',
  },
  weekdayDateNumActive: {
    color: '#FAF8EE',
  },
  scheduleBoxContainer: {
    borderWidth: 1.5,
    borderColor: '#1B9E4B',
    borderRadius: 16,
    backgroundColor: '#7C9276',
    padding: 10,
    marginBottom: 10,
  },
  scheduleBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scheduleBoxSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleBoxTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FAF8EE',
  },
  scheduleBoxCount: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#DCECE2',
  },
  addEntryHeaderBtn: {
    backgroundColor: '#5C7057',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  addEntryHeaderBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  periodsList: {
    gap: 10,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePill: {
    width: 78,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5C7057',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      },
    }),
  },
  timePillText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  periodCard: {
    flex: 1,
    height: 56,
    backgroundColor: '#3D5549',
    borderWidth: 1.2,
    borderColor: '#C7D8CB',
    borderStyle: 'dashed',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addEntryBottomBtn: {
    backgroundColor: '#354837',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  addEntryBottomBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  freeCircleOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.2,
    borderColor: '#48F504',
  },
  busySquareOutline: {
    width: 16,
    height: 16,
    borderRadius: 2.5,
    borderWidth: 2.2,
    borderColor: '#E84746',
  },
  periodTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  periodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  periodTitleText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  periodRoomText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#B5CEBC',
  },
  periodTimeRangeText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#C8D7CD',
    marginTop: 1,
  },
  emptyStateContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FAF8EE',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: '#DCECE2',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyStateAddBtn: {
    backgroundColor: '#354837',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emptyStateAddBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  weeklyScaffoldContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyScaffoldCard: {
    width: '100%',
    backgroundColor: '#CFEAD6',
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: '#3D5549',
    padding: 22,
    alignItems: 'center',
  },
  weeklyScaffoldTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#151F17',
    marginTop: 12,
    marginBottom: 6,
  },
  weeklyScaffoldDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#2D4333',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  switchBackDailyBtn: {
    backgroundColor: '#354837',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  switchBackDailyBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
