import React from 'react';
import { PersonalScheduleScreenProps } from '../types/personalSchedule';
import { PersonalScheduleModal } from '../components/personalSchedule/PersonalScheduleModal';

/**
 * PersonalScheduleScreen (PS-03 / PS-04)
 * Renders the personal schedule sheet modal when routed from HomeScreen or Profile.
 */
export const PersonalScheduleScreen: React.FC<PersonalScheduleScreenProps> = ({
  onBack,
  onNavigateTab,
  initialDateKey = 'tue',
  initialViewMode = 'daily',
}) => {
  return (
    <PersonalScheduleModal
      visible={true}
      onClose={onBack}
      onNavigateTab={onNavigateTab}
      initialDateKey={initialDateKey}
      initialViewMode={initialViewMode}
    />
  );
};
