import {
  SharedCalendarFriend,
  SharedFriendGroup,
  OverlappingFreeWindow,
  SharedScheduleItem,
  WeekDayInfo,
  TimelineBarSegment,
  DayWeeklyAvailabilityRow,
  AvailabilitySegmentStatus,
} from '../types/sharedSchedule';

// Reference date for the Figma mockup: Monday, October 19, 2026
export const MOCK_TODAY_DATE = new Date(2026, 9, 19); // 2026-10-19

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const OCT_19 = '2026-10-19';
const OCT_20 = '2026-10-20';
const OCT_21 = '2026-10-21';
const OCT_22 = '2026-10-22';
const OCT_23 = '2026-10-23';
const OCT_24 = '2026-10-24'; // Saturday (Empty state in Day view)
const OCT_25 = '2026-10-25'; // Sunday (Empty state in Day view)

// 1. PROJECT TEAM (Faithfully reproducing the UI Screenshot)
export const AVA_SCHEDULE_OCT_19: SharedScheduleItem[] = [
  {
    id: 'ava-19-1',
    title: 'Calc II',
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    timeRange: '9:00–10:30',
    startHour: 9.0,
    endHour: 10.5,
    room: 'Hall B · Room 204',
    isBusy: true,
    colorVariant: 'forest',
  },
  {
    id: 'ava-19-2',
    title: 'Studio',
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    timeRange: '2:00–3:30',
    startHour: 14.0,
    endHour: 15.5,
    room: 'Design Lab',
    isBusy: true,
    colorVariant: 'forest',
  },
];

export const BEN_SCHEDULE_OCT_19: SharedScheduleItem[] = [
  {
    id: 'ben-19-1',
    title: 'Econ',
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    timeRange: '8:00–10:00',
    startHour: 8.0,
    endHour: 10.0,
    room: 'Econ 301',
    isBusy: true,
    colorVariant: 'teal',
  },
  {
    id: 'ben-19-2',
    title: 'Lab',
    startTime: '1:30 PM',
    endTime: '3:00 PM',
    timeRange: '1:30–3:00',
    startHour: 13.5,
    endHour: 15.0,
    room: 'Sci Lab 12',
    isBusy: true,
    colorVariant: 'teal',
  },
];

export const CHLOE_SCHEDULE_OCT_19: SharedScheduleItem[] = [
  {
    id: 'chloe-19-1',
    title: 'Busy',
    startTime: '9:30 AM',
    endTime: '11:00 AM',
    timeRange: '9:30–11:00',
    startHour: 9.5,
    endHour: 11.0,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
  {
    id: 'chloe-19-2',
    title: 'Busy',
    startTime: '3:00 PM',
    endTime: '4:30 PM',
    timeRange: '3:00–4:30',
    startHour: 15.0,
    endHour: 16.5,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
];

export const DEV_SCHEDULE_OCT_19: SharedScheduleItem[] = [
  {
    id: 'dev-19-1',
    title: 'CS 201',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    timeRange: '10:00–11:30',
    startHour: 10.0,
    endHour: 11.5,
    room: 'Turing 401',
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-19-2',
    title: 'Seminar',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    timeRange: '2:00–4:00',
    startHour: 14.0,
    endHour: 16.0,
    room: 'Auditorium',
    isBusy: true,
    colorVariant: 'olive',
  },
];

// Tuesday Oct 20 schedules (3 common free windows: 8:00-8:30, 12:30-1:30, 4:30-6:00)
const AVA_OCT_20: SharedScheduleItem[] = [
  {
    id: 'ava-20-1',
    title: 'Design Tech',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    timeRange: '10:00–12:30',
    startHour: 10.0,
    endHour: 12.5,
    room: 'Design Studio 3',
    isBusy: true,
    colorVariant: 'forest',
  },
  {
    id: 'ava-20-2',
    title: 'Team Meet',
    startTime: '3:00 PM',
    endTime: '4:30 PM',
    timeRange: '3:00–4:30',
    startHour: 15.0,
    endHour: 16.5,
    room: 'Collab Hub',
    isBusy: true,
    colorVariant: 'mint',
  },
];

const BEN_OCT_20: SharedScheduleItem[] = [
  {
    id: 'ben-20-1',
    title: 'Stats II',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    timeRange: '9:00–11:00',
    startHour: 9.0,
    endHour: 11.0,
    room: 'Math 202',
    isBusy: true,
    colorVariant: 'teal',
  },
  {
    id: 'ben-20-2',
    title: 'Library Study',
    startTime: '1:30 PM',
    endTime: '3:00 PM',
    timeRange: '1:30–3:00',
    startHour: 13.5,
    endHour: 15.0,
    room: 'Main Library',
    isBusy: true,
    colorVariant: 'teal',
  },
];

const CHLOE_OCT_20: SharedScheduleItem[] = [
  {
    id: 'chloe-20-1',
    title: 'Busy',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    timeRange: '10:30–12:30',
    startHour: 10.5,
    endHour: 12.5,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
];

const DEV_OCT_20: SharedScheduleItem[] = [
  {
    id: 'dev-20-1',
    title: 'Algorithms',
    startTime: '8:30 AM',
    endTime: '10:30 AM',
    timeRange: '8:30–10:30',
    startHour: 8.5,
    endHour: 10.5,
    room: 'CS 105',
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-20-2',
    title: 'Code Review',
    startTime: '1:30 PM',
    endTime: '3:30 PM',
    timeRange: '1:30–3:30',
    startHour: 13.5,
    endHour: 15.5,
    room: 'Lab 4B',
    isBusy: true,
    colorVariant: 'olive',
  },
];

// Wednesday Oct 21 schedules (Matches UI-27/28 "No overlap" & UI-29 Wed Oct 21)
const AVA_OCT_21: SharedScheduleItem[] = [
  {
    id: 'ava-21-1',
    title: 'Studio block',
    startTime: '8:00 AM',
    endTime: '1:00 PM',
    timeRange: '8:00–1:00',
    startHour: 8.0,
    endHour: 13.0,
    room: 'Art Studio A',
    isBusy: true,
    colorVariant: 'forest',
  },
];

const BEN_OCT_21: SharedScheduleItem[] = [
  {
    id: 'ben-21-1',
    title: 'Field work',
    startTime: '9:00 AM',
    endTime: '3:00 PM',
    timeRange: '9:00–3:00',
    startHour: 9.0,
    endHour: 15.0,
    room: 'Off-Campus Site',
    isBusy: true,
    colorVariant: 'teal',
  },
];

const CHLOE_OCT_21: SharedScheduleItem[] = [
  {
    id: 'chloe-21-1',
    title: 'Busy',
    startTime: '12:00 PM',
    endTime: '6:00 PM',
    timeRange: '12:00–6:00',
    startHour: 12.0,
    endHour: 18.0,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
];

const DEV_OCT_21: SharedScheduleItem[] = [
  {
    id: 'dev-21-1',
    title: 'CS 201',
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    timeRange: '8:00–10:00',
    startHour: 8.0,
    endHour: 10.0,
    room: 'Turing 401',
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-21-2',
    title: 'Shift',
    startTime: '2:00 PM',
    endTime: '6:00 PM',
    timeRange: '2:00–6:00',
    startHour: 14.0,
    endHour: 18.0,
    room: 'IT Helpdesk',
    isBusy: true,
    colorVariant: 'olive',
  },
];

// Thursday Oct 22 schedules (Matches UI-27/28 "2 windows": 9:30–11:00 and 3:00–5:00)
const AVA_OCT_22: SharedScheduleItem[] = [
  {
    id: 'ava-22-1',
    title: 'Art History',
    startTime: '8:00 AM',
    endTime: '9:30 AM',
    timeRange: '8:00–9:30',
    startHour: 8.0,
    endHour: 9.5,
    room: 'Hall A 104',
    isBusy: true,
    colorVariant: 'forest',
  },
  {
    id: 'ava-22-2',
    title: 'UI Lab',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    timeRange: '11:00–1:00',
    startHour: 11.0,
    endHour: 13.0,
    room: 'Design Lab',
    isBusy: true,
    colorVariant: 'mint',
  },
];

const BEN_OCT_22: SharedScheduleItem[] = [
  {
    id: 'ben-22-1',
    title: 'Macro Econ',
    startTime: '11:30 AM',
    endTime: '1:30 PM',
    timeRange: '11:30–1:30',
    startHour: 11.5,
    endHour: 13.5,
    room: 'Econ 205',
    isBusy: true,
    colorVariant: 'teal',
  },
  {
    id: 'ben-22-2',
    title: 'Recitation',
    startTime: '5:00 PM',
    endTime: '6:00 PM',
    timeRange: '5:00–6:00',
    startHour: 17.0,
    endHour: 18.0,
    room: 'Econ 101',
    isBusy: true,
    colorVariant: 'teal',
  },
];

const CHLOE_OCT_22: SharedScheduleItem[] = [
  {
    id: 'chloe-22-1',
    title: 'Busy',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    timeRange: '1:00–3:00',
    startHour: 13.0,
    endHour: 15.0,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
];

const DEV_OCT_22: SharedScheduleItem[] = [
  {
    id: 'dev-22-1',
    title: 'Systems Prog',
    startTime: '8:00 AM',
    endTime: '9:30 AM',
    timeRange: '8:00–9:30',
    startHour: 8.0,
    endHour: 9.5,
    room: 'Turing 210',
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-22-2',
    title: 'DB Workshop',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    timeRange: '1:00–3:00',
    startHour: 13.0,
    endHour: 15.0,
    room: 'CS Lab 2',
    isBusy: true,
    colorVariant: 'olive',
  },
];

// Friday Oct 23 schedules (Matches UI-27/28 "1 window": 12:30–2:30)
const AVA_OCT_23: SharedScheduleItem[] = [
  {
    id: 'ava-23-1',
    title: 'Critique',
    startTime: '9:00 AM',
    endTime: '12:30 PM',
    timeRange: '9:00–12:30',
    startHour: 9.0,
    endHour: 12.5,
    room: 'Gallery 1F',
    isBusy: true,
    colorVariant: 'forest',
  },
  {
    id: 'ava-23-2',
    title: 'Open Studio',
    startTime: '2:30 PM',
    endTime: '5:00 PM',
    timeRange: '2:30–5:00',
    startHour: 14.5,
    endHour: 17.0,
    room: 'Studio B',
    isBusy: true,
    colorVariant: 'forest',
  },
];

const BEN_OCT_23: SharedScheduleItem[] = [
  {
    id: 'ben-23-1',
    title: 'Finance Lab',
    startTime: '8:00 AM',
    endTime: '11:00 AM',
    timeRange: '8:00–11:00',
    startHour: 8.0,
    endHour: 11.0,
    room: 'Bus 304',
    isBusy: true,
    colorVariant: 'teal',
  },
  {
    id: 'ben-23-2',
    title: 'Case Study',
    startTime: '2:30 PM',
    endTime: '6:00 PM',
    timeRange: '2:30–6:00',
    startHour: 14.5,
    endHour: 18.0,
    room: 'Bus 108',
    isBusy: true,
    colorVariant: 'teal',
  },
];

const CHLOE_OCT_23: SharedScheduleItem[] = [
  {
    id: 'chloe-23-1',
    title: 'Busy',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    timeRange: '10:00–12:30',
    startHour: 10.0,
    endHour: 12.5,
    isBusy: true,
    isPrivate: true,
    colorVariant: 'busy',
  },
];

const DEV_OCT_23: SharedScheduleItem[] = [
  {
    id: 'dev-23-1',
    title: 'Capstone Sync',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    timeRange: '10:30–12:30',
    startHour: 10.5,
    endHour: 12.5,
    room: 'Turing 302',
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-23-2',
    title: 'AI Colloquium',
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    timeRange: '3:00–6:00',
    startHour: 15.0,
    endHour: 18.0,
    room: 'Main Hall',
    isBusy: true,
    colorVariant: 'olive',
  },
];

export const PROJECT_TEAM_MEMBERS: SharedCalendarFriend[] = [
  {
    id: 'friend-ava',
    name: 'Ava Chen',
    nickname: 'Ava',
    initials: 'AC',
    scheduleByDate: {
      [OCT_19]: AVA_SCHEDULE_OCT_19,
      [OCT_20]: AVA_OCT_20,
      [OCT_21]: AVA_OCT_21,
      [OCT_22]: AVA_OCT_22,
      [OCT_23]: AVA_OCT_23,
      [OCT_24]: [], // Empty Saturday
      [OCT_25]: [], // Empty Sunday
    },
  },
  {
    id: 'friend-ben',
    name: 'Ben Ortiz',
    nickname: 'Ben',
    initials: 'BO',
    scheduleByDate: {
      [OCT_19]: BEN_SCHEDULE_OCT_19,
      [OCT_20]: BEN_OCT_20,
      [OCT_21]: BEN_OCT_21,
      [OCT_22]: BEN_OCT_22,
      [OCT_23]: BEN_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'friend-chloe',
    name: 'Chloe Park',
    nickname: 'Chloe',
    initials: 'CP',
    isPrivate: true, // Privacy indicator for SS-06
    scheduleByDate: {
      [OCT_19]: CHLOE_SCHEDULE_OCT_19,
      [OCT_20]: CHLOE_OCT_20,
      [OCT_21]: CHLOE_OCT_21,
      [OCT_22]: CHLOE_OCT_22,
      [OCT_23]: CHLOE_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'friend-dev',
    name: 'Dev Patel',
    nickname: 'Dev',
    initials: 'DP',
    scheduleByDate: {
      [OCT_19]: DEV_SCHEDULE_OCT_19,
      [OCT_20]: DEV_OCT_20,
      [OCT_21]: DEV_OCT_21,
      [OCT_22]: DEV_OCT_22,
      [OCT_23]: DEV_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
];

// Additional groups for testing filters
export const IT_PWENDS_MEMBERS: SharedCalendarFriend[] = [
  {
    id: 'cf-kai',
    name: 'Nhaka Kai',
    nickname: 'Kai',
    initials: 'NK',
    scheduleByDate: {
      [OCT_19]: [
        {
          id: 'kai-1',
          title: 'IT 212',
          startTime: '9:00 AM',
          endTime: '11:00 AM',
          timeRange: '9:00–11:00',
          startHour: 9.0,
          endHour: 11.0,
          room: 'RB212',
          isBusy: true,
          colorVariant: 'forest',
        },
        {
          id: 'kai-2',
          title: 'Fin Mgmt',
          startTime: '1:30 PM',
          endTime: '3:30 PM',
          timeRange: '1:30–3:30',
          startHour: 13.5,
          endHour: 15.5,
          room: 'AL101',
          isBusy: true,
          colorVariant: 'teal',
        },
      ],
      [OCT_20]: AVA_OCT_20,
      [OCT_21]: AVA_OCT_21,
      [OCT_22]: AVA_OCT_22,
      [OCT_23]: AVA_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'cf-aque',
    name: 'Aque Naman',
    nickname: 'Aque',
    initials: 'AN',
    scheduleByDate: {
      [OCT_19]: [
        {
          id: 'aque-1',
          title: 'Bus Comm',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          timeRange: '10:00–11:30',
          startHour: 10.0,
          endHour: 11.5,
          room: 'AS102',
          isBusy: true,
          colorVariant: 'olive',
        },
        {
          id: 'aque-2',
          title: 'Database Sys',
          startTime: '2:00 PM',
          endTime: '4:00 PM',
          timeRange: '2:00–4:00',
          startHour: 14.0,
          endHour: 16.0,
          room: 'Lab 3',
          isBusy: true,
          colorVariant: 'mint',
        },
      ],
      [OCT_20]: BEN_OCT_20,
      [OCT_21]: BEN_OCT_21,
      [OCT_22]: BEN_OCT_22,
      [OCT_23]: BEN_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'cf-berna',
    name: 'Bernadette',
    nickname: 'Berna',
    initials: 'BB',
    scheduleByDate: {
      [OCT_19]: [
        {
          id: 'berna-1',
          title: 'UI/UX Design',
          startTime: '9:00 AM',
          endTime: '10:30 AM',
          timeRange: '9:00–10:30',
          startHour: 9.0,
          endHour: 10.5,
          room: 'AL211A',
          isBusy: true,
          colorVariant: 'forest',
        },
        {
          id: 'berna-2',
          title: 'IPT 2',
          startTime: '12:00 PM',
          endTime: '1:30 PM',
          timeRange: '12:00–1:30',
          startHour: 12.0,
          endHour: 13.5,
          room: 'P216',
          isBusy: true,
          colorVariant: 'teal',
        },
      ],
      [OCT_20]: DEV_OCT_20,
      [OCT_21]: DEV_OCT_21,
      [OCT_22]: DEV_OCT_22,
      [OCT_23]: DEV_OCT_23,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'cf-carlos',
    name: 'Carlos Mendoza',
    nickname: 'Carlos',
    initials: 'CM',
    hasMissingSchedule: true,
    scheduleByDate: {
      [OCT_19]: [],
      [OCT_20]: [],
      [OCT_21]: [],
      [OCT_22]: [],
      [OCT_23]: [],
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
];

// 6 Members for "All Friends" (2 schedules unavailable: Chloe is private, Carlos is missing)
export const ALL_FRIENDS_MEMBERS: SharedCalendarFriend[] = [
  PROJECT_TEAM_MEMBERS[0], // Ava
  PROJECT_TEAM_MEMBERS[1], // Ben
  PROJECT_TEAM_MEMBERS[2], // Chloe (Private)
  PROJECT_TEAM_MEMBERS[3], // Dev
  IT_PWENDS_MEMBERS[0],    // Kai
  IT_PWENDS_MEMBERS[3],    // Carlos (Missing schedule)
];

// 3 Members for "Close Friends"
export const CLOSE_FRIENDS_MEMBERS: SharedCalendarFriend[] = [
  PROJECT_TEAM_MEMBERS[0], // Ava
  PROJECT_TEAM_MEMBERS[1], // Ben
  PROJECT_TEAM_MEMBERS[3], // Dev
];

// 4 Members for "Classmates" (1 missing: Carlos, 1 unavailable: Chloe/Aque)
export const CLASSMATES_MEMBERS: SharedCalendarFriend[] = [
  IT_PWENDS_MEMBERS[0],    // Kai
  IT_PWENDS_MEMBERS[1],    // Aque (marked private/busy)
  IT_PWENDS_MEMBERS[2],    // Berna
  IT_PWENDS_MEMBERS[3],    // Carlos (missing schedule)
];

export const SHARED_FRIEND_GROUPS: SharedFriendGroup[] = [
  {
    id: 'grp-all-friends',
    name: 'All Friends',
    memberCount: 6,
    members: ALL_FRIENDS_MEMBERS,
    statusSummary: '6 people · 2 schedules unavailable',
    unavailableCount: 2,
    description: 'All connected friends schedule',
  },
  {
    id: 'grp-project-team',
    name: 'Project Team',
    memberCount: 4,
    members: PROJECT_TEAM_MEMBERS,
    statusSummary: '4 people · All schedules available',
    description: 'Capstone / IPT project team members',
  },
  {
    id: 'grp-close-friends',
    name: 'Close Friends',
    memberCount: 3,
    members: CLOSE_FRIENDS_MEMBERS,
    statusSummary: '3 people · All schedules available',
    description: 'Close inner-circle friends',
  },
  {
    id: 'grp-classmates',
    name: 'Classmates',
    memberCount: 4,
    members: CLASSMATES_MEMBERS,
    statusSummary: '4 people · 1 missing · 1 unavailable',
    missingCount: 1,
    unavailableCount: 1,
    description: 'College classmates & study group',
  },
  {
    id: 'grp-study-abroad',
    name: 'Study Abroad',
    memberCount: 0,
    members: [],
    statusSummary: '0 people · Empty group',
    isEmpty: true,
    description: 'International exchange study group',
  },
];

export const OCT_19_FREE_WINDOWS: OverlappingFreeWindow[] = [
  {
    id: 'fw-1',
    startTime: '11:30 AM',
    endTime: '1:30 PM',
    timeRange: '11:30 AM – 1:30 PM',
    startHour: 11.5,
    endHour: 13.5,
    freeCount: 4,
    totalCount: 4,
    label: 'All 4 free',
    isAllFree: true,
  },
  {
    id: 'fw-2',
    startTime: '5:00 PM',
    endTime: '6:00 PM',
    timeRange: '5:00 PM – 6:00 PM',
    startHour: 17.0,
    endHour: 18.0,
    freeCount: 4,
    totalCount: 4,
    label: 'All 4 free',
    isAllFree: true,
  },
];

export const OCT_19_PARTIAL_FREE_WINDOWS: OverlappingFreeWindow[] = [
  {
    id: 'pfw-1',
    startTime: '8:30 AM',
    endTime: '9:00 AM',
    timeRange: '8:30–9:00',
    startHour: 8.5,
    endHour: 9.0,
    freeCount: 3,
    totalCount: 4,
    label: '3 of 4',
    isAllFree: false,
  },
  {
    id: 'pfw-2',
    startTime: '10:30 AM',
    endTime: '11:00 AM',
    timeRange: '10:30–11:00',
    startHour: 10.5,
    endHour: 11.0,
    freeCount: 3,
    totalCount: 4,
    label: '3 of 4',
    isAllFree: false,
  },
  {
    id: 'pfw-3',
    startTime: '1:30 PM',
    endTime: '2:00 PM',
    timeRange: '1:30–2:00',
    startHour: 13.5,
    endHour: 14.0,
    freeCount: 3,
    totalCount: 4,
    label: '3 of 4',
    isAllFree: false,
  },
  {
    id: 'pfw-4',
    startTime: '4:30 PM',
    endTime: '5:00 PM',
    timeRange: '4:30–5:00',
    startHour: 16.5,
    endHour: 17.0,
    freeCount: 3,
    totalCount: 4,
    label: '3 of 4',
    isAllFree: false,
  },
];

/**
 * Returns a friend's schedule for a given dateKey, or maps by day-of-week
 * when navigating to other weeks so weekly navigation always has rich schedules.
 */
export function getFriendScheduleForDateKey(
  friend: SharedCalendarFriend,
  dateKey: string
): SharedScheduleItem[] {
  if (dateKey in friend.scheduleByDate) {
    return friend.scheduleByDate[dateKey] || [];
  }

  const parts = dateKey.split('-').map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const fallbackByDay: Record<number, string> = {
      1: OCT_19,
      2: OCT_20,
      3: OCT_21,
      4: OCT_22,
      5: OCT_23,
      6: OCT_24,
      0: OCT_25,
    };
    const mappedKey = fallbackByDay[dayOfWeek];
    if (mappedKey && friend.scheduleByDate[mappedKey]) {
      return friend.scheduleByDate[mappedKey];
    }
  }

  return [];
}

/**
 * Calculates overlapping free windows for a given set of friends on a specific date.
 */
export function calculateOverlappingWindows(
  friends: SharedCalendarFriend[],
  dateKey: string
): { allFreeWindows: OverlappingFreeWindow[]; partialWindows: OverlappingFreeWindow[] } {
  if (dateKey === OCT_19 && friends.length === 4 && friends[0]?.id === 'friend-ava') {
    return {
      allFreeWindows: OCT_19_FREE_WINDOWS,
      partialWindows: OCT_19_PARTIAL_FREE_WINDOWS,
    };
  }

  const totalFriends = friends.length;
  if (totalFriends === 0) {
    return { allFreeWindows: [], partialWindows: [] };
  }

  // Check 30-min increments from 8.0 to 18.0
  const slots: { hour: number; freeCount: number }[] = [];
  for (let h = 8.0; h < 18.0; h += 0.5) {
    let freeCount = 0;
    friends.forEach((friend) => {
      if (friend.hasMissingSchedule) {
        return;
      }
      const schedule = getFriendScheduleForDateKey(friend, dateKey);
      const isBusyInSlot = schedule.some(
        (item) => item.isBusy && item.startHour <= h && item.endHour > h
      );
      if (!isBusyInSlot) {
        freeCount++;
      }
    });
    slots.push({ hour: h, freeCount });
  }

  const allFreeWindows: OverlappingFreeWindow[] = [];
  const partialWindows: OverlappingFreeWindow[] = [];

  let inAllFree = false;
  let allFreeStart = 8.0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isAllFreeNow = slot.freeCount === totalFriends && totalFriends > 1;

    if (isAllFreeNow && !inAllFree) {
      inAllFree = true;
      allFreeStart = slot.hour;
    } else if (!isAllFreeNow && inAllFree) {
      inAllFree = false;
      const endHour = slot.hour;
      if (endHour - allFreeStart >= 0.5) {
        allFreeWindows.push({
          id: `calc-all-${dateKey}-${allFreeStart}`,
          startTime: formatHourToTime(allFreeStart),
          endTime: formatHourToTime(endHour),
          timeRange: `${formatHourToTime(allFreeStart)} – ${formatHourToTime(endHour)}`,
          startHour: allFreeStart,
          endHour: endHour,
          freeCount: totalFriends,
          totalCount: totalFriends,
          label: `All ${totalFriends} free`,
          isAllFree: true,
        });
      }
    }
  }

  if (inAllFree) {
    allFreeWindows.push({
      id: `calc-all-${dateKey}-${allFreeStart}`,
      startTime: formatHourToTime(allFreeStart),
      endTime: '6:00 PM',
      timeRange: `${formatHourToTime(allFreeStart)} – 6:00 PM`,
      startHour: allFreeStart,
      endHour: 18.0,
      freeCount: totalFriends,
      totalCount: totalFriends,
      label: `All ${totalFriends} free`,
      isAllFree: true,
    });
  }

  // Also collect partial windows where at least (totalFriends - 1) are free
  if (totalFriends >= 3) {
    let inPartial = false;
    let partialStart = 8.0;
    let partialFreeCount = totalFriends - 1;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const isPartialNow =
        slot.freeCount >= totalFriends - 1 && slot.freeCount < totalFriends;

      if (isPartialNow && !inPartial) {
        inPartial = true;
        partialStart = slot.hour;
        partialFreeCount = slot.freeCount;
      } else if (!isPartialNow && inPartial) {
        inPartial = false;
        const endHour = slot.hour;
        if (endHour - partialStart >= 0.5) {
          partialWindows.push({
            id: `calc-part-${dateKey}-${partialStart}`,
            startTime: formatHourToTime(partialStart),
            endTime: formatHourToTime(endHour),
            timeRange: `${formatHourToTime(partialStart)}–${formatHourToTime(endHour)}`,
            startHour: partialStart,
            endHour,
            freeCount: partialFreeCount,
            totalCount: totalFriends,
            label: `${partialFreeCount} of ${totalFriends}`,
            isAllFree: false,
          });
        }
      }
    }
  }

  return { allFreeWindows, partialWindows };
}

export function formatHourToTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m === 0 ? '00' : String(m).padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

export function formatNavigationDate(date: Date): { main: string; sub: string } {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();

  const main = `${dayName}, ${monthName} ${dayNum}`;

  // Relative label
  const todayKey = formatDateKey(MOCK_TODAY_DATE);
  const currentKey = formatDateKey(date);

  let relative = `${year}`;
  if (currentKey === todayKey) {
    relative = `Today · ${year}`;
  } else {
    // Check difference in days
    const diffTime = date.getTime() - MOCK_TODAY_DATE.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    if (diffDays === -1) {
      relative = `Yesterday · ${year}`;
    } else if (diffDays === 1) {
      relative = `Tomorrow · ${year}`;
    } else {
      relative = `${monthName} ${dayNum} · ${year}`;
    }
  }

  return { main, sub: relative };
}

/**
 * Returns the Monday-to-Sunday WeekDayInfo array for the week containing `anchorDate` (SS-03)
 */
export function getWeekDaysForDate(anchorDate: Date): WeekDayInfo[] {
  const dayOfWeek = anchorDate.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(anchorDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(anchorDate.getDate() + diffToMonday);

  const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const todayKey = formatDateKey(MOCK_TODAY_DATE);

  return shortNames.map((dayShort, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateKey = formatDateKey(d);
    const dayNumber = String(d.getDate());
    const monthShort = months[d.getMonth()];

    return {
      date: d,
      dateKey,
      dayShort,
      dayNumber,
      rowLabel: `${dayShort} ${dayNumber}`,
      fullLabel: `${fullDayNames[idx]}, ${monthShort} ${dayNumber}`,
      isToday: dateKey === todayKey,
      isWeekend: idx >= 5,
    };
  });
}

/**
 * Formats the week header range matching UI-27/28 ("Oct 19 – 25" / "2026")
 */
export function formatWeekNavigationRange(anchorDate: Date): {
  main: string;
  sub: string;
  isCurrentWeek: boolean;
} {
  const weekDays = getWeekDaysForDate(anchorDate);
  const startDay = weekDays[0].date;
  const endDay = weekDays[6].date;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const startMonth = months[startDay.getMonth()];
  const endMonth = months[endDay.getMonth()];
  const startNum = startDay.getDate();
  const endNum = endDay.getDate();
  const year = endDay.getFullYear();

  const main =
    startMonth === endMonth
      ? `${startMonth} ${startNum} – ${endNum}`
      : `${startMonth} ${startNum} – ${endMonth} ${endNum}`;

  const currentWeekDays = getWeekDaysForDate(MOCK_TODAY_DATE);
  const isCurrentWeek = weekDays[0].dateKey === currentWeekDays[0].dateKey;

  return {
    main,
    sub: `${year}`,
    isCurrentWeek,
  };
}

/**
 * Reference UI-27/28 timeline presets for the 4-person Project Team week (Oct 19 – 25)
 * Ensures pixel-faithful segment proportions and window counts matching UI-27/28:
 * Mon 19 (2 windows), Tue 20 (3 windows), Wed 21 (No overlap), Thu 22 (2 windows),
 * Fri 23 (1 window), Sat 24 (1 window), Sun 25 (1 window) => 10 windows this week.
 */
interface PresetDayConfig {
  windowCount: number;
  segments: Array<{ status: AvailabilitySegmentStatus; ratio: number }>;
  windows: OverlappingFreeWindow[];
}

const PROJECT_TEAM_UI27_PRESETS: Record<number, PresetDayConfig> = {
  0: {
    // Mon 19: 2 windows
    windowCount: 2,
    segments: [
      { status: 'some-free', ratio: 3.5 },
      { status: 'all-free', ratio: 2.0 },
      { status: 'some-free', ratio: 3.0 },
      { status: 'all-free', ratio: 1.5 },
    ],
    windows: OCT_19_FREE_WINDOWS,
  },
  1: {
    // Tue 20: 3 windows
    windowCount: 3,
    segments: [
      { status: 'all-free', ratio: 0.5 },
      { status: 'some-free', ratio: 5.0 },
      { status: 'all-free', ratio: 0.5 },
      { status: 'some-free', ratio: 2.0 },
      { status: 'all-free', ratio: 2.0 },
    ],
    windows: [
      {
        id: 'tue-fw-1',
        startTime: '8:00 AM',
        endTime: '8:30 AM',
        timeRange: '8:00 AM – 8:30 AM',
        startHour: 8.0,
        endHour: 8.5,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
      {
        id: 'tue-fw-2',
        startTime: '12:30 PM',
        endTime: '1:30 PM',
        timeRange: '12:30 PM – 1:30 PM',
        startHour: 12.5,
        endHour: 13.5,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
      {
        id: 'tue-fw-3',
        startTime: '4:30 PM',
        endTime: '6:00 PM',
        timeRange: '4:30 PM – 6:00 PM',
        startHour: 16.5,
        endHour: 18.0,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
    ],
  },
  2: {
    // Wed 21: No overlap
    windowCount: 0,
    segments: [{ status: 'busy', ratio: 10.0 }],
    windows: [],
  },
  3: {
    // Thu 22: 2 windows
    windowCount: 2,
    segments: [
      { status: 'some-free', ratio: 2.0 },
      { status: 'all-free', ratio: 1.5 },
      { status: 'some-free', ratio: 3.5 },
      { status: 'all-free', ratio: 2.0 },
      { status: 'some-free', ratio: 1.0 },
    ],
    windows: [
      {
        id: 'thu-fw-1',
        startTime: '9:30 AM',
        endTime: '11:00 AM',
        timeRange: '9:30 AM – 11:00 AM',
        startHour: 9.5,
        endHour: 11.0,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
      {
        id: 'thu-fw-2',
        startTime: '3:00 PM',
        endTime: '5:00 PM',
        timeRange: '3:00 PM – 5:00 PM',
        startHour: 15.0,
        endHour: 17.0,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
    ],
  },
  4: {
    // Fri 23: 1 window
    windowCount: 1,
    segments: [
      { status: 'some-free', ratio: 5.0 },
      { status: 'all-free', ratio: 2.0 },
      { status: 'some-free', ratio: 3.0 },
    ],
    windows: [
      {
        id: 'fri-fw-1',
        startTime: '12:30 PM',
        endTime: '2:30 PM',
        timeRange: '12:30 PM – 2:30 PM',
        startHour: 12.5,
        endHour: 14.5,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
    ],
  },
  5: {
    // Sat 24: 1 window
    windowCount: 1,
    segments: [
      { status: 'some-free', ratio: 2.0 },
      { status: 'all-free', ratio: 8.0 },
    ],
    windows: [
      {
        id: 'sat-fw-1',
        startTime: '10:00 AM',
        endTime: '6:00 PM',
        timeRange: '10:00 AM – 6:00 PM',
        startHour: 10.0,
        endHour: 18.0,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
    ],
  },
  6: {
    // Sun 25: 1 window
    windowCount: 1,
    segments: [
      { status: 'some-free', ratio: 4.0 },
      { status: 'all-free', ratio: 6.0 },
    ],
    windows: [
      {
        id: 'sun-fw-1',
        startTime: '12:00 PM',
        endTime: '6:00 PM',
        timeRange: '12:00 PM – 6:00 PM',
        startHour: 12.0,
        endHour: 18.0,
        freeCount: 4,
        totalCount: 4,
        label: 'All 4 free',
        isAllFree: true,
      },
    ],
  },
};

/**
 * Computes the 7-day weekly availability rows and total window count (SS-03)
 */
export function calculateWeeklyAvailabilityRows(
  friends: SharedCalendarFriend[],
  weekDays: WeekDayInfo[]
): {
  rows: DayWeeklyAvailabilityRow[];
  totalWeekWindows: number;
} {
  const isProjectTeamDefault =
    friends.length === 4 && friends[0]?.id === 'friend-ava';

  let totalWeekWindows = 0;

  const rows: DayWeeklyAvailabilityRow[] = weekDays.map((day, idx) => {
    if (friends.length === 0) {
      return {
        day,
        windowCount: 0,
        windowLabel: 'No overlap',
        hasOverlap: false,
        segments: [
          {
            id: `${day.dateKey}-empty`,
            startHour: 8.0,
            endHour: 18.0,
            durationRatio: 10.0,
            status: 'busy',
            freeCount: 0,
            totalCount: 0,
          },
        ],
        allFreeWindows: [],
        partialWindows: [],
      };
    }

    if (isProjectTeamDefault && PROJECT_TEAM_UI27_PRESETS[idx]) {
      const preset = PROJECT_TEAM_UI27_PRESETS[idx];
      totalWeekWindows += preset.windowCount;
      let cursor = 8.0;
      const segments: TimelineBarSegment[] = preset.segments.map((seg, sIdx) => {
        const startHour = cursor;
        const endHour = cursor + seg.ratio;
        cursor = endHour;
        return {
          id: `${day.dateKey}-seg-${sIdx}`,
          startHour,
          endHour,
          durationRatio: seg.ratio,
          status: seg.status,
          freeCount: seg.status === 'all-free' ? 4 : seg.status === 'some-free' ? 2 : 0,
          totalCount: 4,
        };
      });

      const windowLabel =
        preset.windowCount === 0
          ? 'No overlap'
          : preset.windowCount === 1
            ? '1 window'
            : `${preset.windowCount} windows`;

      return {
        day,
        windowCount: preset.windowCount,
        windowLabel,
        hasOverlap: preset.windowCount > 0,
        segments,
        allFreeWindows: preset.windows,
        partialWindows: idx === 0 ? OCT_19_PARTIAL_FREE_WINDOWS : [],
      };
    }

    // Dynamic calculation for other friend groups (All Friends, Close Friends, Classmates)
    const { allFreeWindows, partialWindows } = calculateOverlappingWindows(
      friends,
      day.dateKey
    );

    const totalFriends = friends.length;
    const rawSlots: Array<{ hour: number; status: AvailabilitySegmentStatus; freeCount: number }> = [];

    for (let h = 8.0; h < 18.0; h += 0.5) {
      let freeCount = 0;
      friends.forEach((friend) => {
        if (friend.hasMissingSchedule) {
          return;
        }
        const schedule = getFriendScheduleForDateKey(friend, day.dateKey);
        const isBusy = schedule.some(
          (item) => item.isBusy && item.startHour <= h && item.endHour > h
        );
        if (!isBusy) {
          freeCount++;
        }
      });

      let status: AvailabilitySegmentStatus = 'busy';
      if (freeCount === totalFriends && totalFriends > 0) {
        status = 'all-free';
      } else if (freeCount > 0) {
        status = 'some-free';
      }

      rawSlots.push({ hour: h, status, freeCount });
    }

    // Merge contiguous slots with the same status
    const segments: TimelineBarSegment[] = [];
    for (let i = 0; i < rawSlots.length; i++) {
      const slot = rawSlots[i];
      const prev = segments[segments.length - 1];
      if (prev && prev.status === slot.status) {
        prev.endHour = slot.hour + 0.5;
        prev.durationRatio += 0.5;
      } else {
        segments.push({
          id: `${day.dateKey}-seg-${i}`,
          startHour: slot.hour,
          endHour: slot.hour + 0.5,
          durationRatio: 0.5,
          status: slot.status,
          freeCount: slot.freeCount,
          totalCount: totalFriends,
        });
      }
    }

    const windowCount = allFreeWindows.length;
    totalWeekWindows += windowCount;
    const windowLabel =
      windowCount === 0
        ? 'No overlap'
        : windowCount === 1
          ? '1 window'
          : `${windowCount} windows`;

    return {
      day,
      windowCount,
      windowLabel,
      hasOverlap: windowCount > 0,
      segments,
      allFreeWindows,
      partialWindows,
    };
  });

  return {
    rows,
    totalWeekWindows,
  };
}

/**
 * SS-05: Look up a friend by their unique identifier across all shared groups
 */
export function findSharedFriendById(
  id: string
): SharedCalendarFriend | undefined {
  if (!id) return undefined;
  for (const group of SHARED_FRIEND_GROUPS) {
    const friend = group.members.find((m) => m.id === id);
    if (friend) return friend;
  }
  return undefined;
}

export interface ChronologicalScheduleSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  timeRange?: string;
  startHour: number;
  endHour: number;
  room?: string;
  isBusy: boolean;
  isPrivate?: boolean;
}

/**
 * SS-05: Returns a full 8 AM - 6 PM chronological breakdown of occupied classes and free intervals
 */
export function getChronologicalScheduleForDay(
  friend: SharedCalendarFriend,
  dateKey: string,
  startBound = 8.0,
  endBound = 18.0
): ChronologicalScheduleSlot[] {
  // If the friend has missing schedule or is empty, return empty list
  if (friend.hasMissingSchedule) {
    return [];
  }

  const busyItems = (getFriendScheduleForDateKey(friend, dateKey) || [])
    .filter((i) => i.isBusy)
    .sort((a, b) => a.startHour - b.startHour);

  // If no busy items at all, the entire day is free
  if (busyItems.length === 0) {
    const sTime = '8:00 AM';
    const eTime = '6:00 PM';
    return [
      {
        id: `free-${friend.id}-${startBound}-${endBound}`,
        title: `Free · ${sTime} – ${eTime}`,
        startTime: sTime,
        endTime: eTime,
        timeRange: `${sTime} – ${eTime}`,
        startHour: startBound,
        endHour: endBound,
        isBusy: false,
      },
    ];
  }

  const result: ChronologicalScheduleSlot[] = [];
  let currentHour = startBound;

  const formatHourLabel = (h: number): string => {
    const hourPart = Math.floor(h);
    const minutePart = Math.round((h - hourPart) * 60);
    const isPM = hourPart >= 12;
    const displayHour = hourPart % 12 === 0 ? 12 : hourPart % 12;
    const displayMinute = minutePart < 10 ? `0${minutePart}` : `${minutePart}`;
    return `${displayHour}:${displayMinute} ${isPM ? 'PM' : 'AM'}`;
  };

  for (const item of busyItems) {
    const itemStart = Math.max(startBound, item.startHour);
    const itemEnd = Math.min(endBound, item.endHour);

    if (itemStart > currentHour + 0.1) {
      const sTime = formatHourLabel(currentHour);
      const eTime = formatHourLabel(itemStart);
      result.push({
        id: `free-${friend.id}-${currentHour}-${itemStart}`,
        title: `Free · ${sTime} – ${eTime}`,
        startTime: sTime,
        endTime: eTime,
        timeRange: `${sTime} – ${eTime}`,
        startHour: currentHour,
        endHour: itemStart,
        isBusy: false,
      });
    }

    result.push({
      id: item.id,
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      timeRange: item.timeRange || `${item.startTime}–${item.endTime}`,
      startHour: itemStart,
      endHour: itemEnd,
      room: item.room,
      isBusy: true,
      isPrivate: item.isPrivate,
    });

    currentHour = Math.max(currentHour, itemEnd);
  }

  if (currentHour < endBound - 0.1) {
    const sTime = formatHourLabel(currentHour);
    const eTime = formatHourLabel(endBound);
    result.push({
      id: `free-${friend.id}-${currentHour}-${endBound}`,
      title: `Free · ${sTime} – ${eTime}`,
      startTime: sTime,
      endTime: eTime,
      timeRange: `${sTime} – ${eTime}`,
      startHour: currentHour,
      endHour: endBound,
      isBusy: false,
    });
  }

  return result;
}
