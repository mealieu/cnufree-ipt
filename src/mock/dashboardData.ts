import {
  FriendGroupOption,
  ScheduleActivity,
  FriendAvailability,
  FriendScheduleItem,
  BestWindow,
  UserProfile,
  FriendGroupId,
  MutualFreeWindow,
} from '../types/dashboard';

export const CURRENT_USER: UserProfile = {
  name: 'Bernadette',
  avatarUrl: undefined,
};

export const FRIEND_GROUPS: FriendGroupOption[] = [
  { id: 'all', label: 'All Friends' },
  { id: 'bora', label: 'Bora' },
  { id: 'courtside', label: 'Court Side' },
  { id: 'dyd', label: 'DYD' },
];

export const INITIAL_SCHEDULE_ACTIVITIES: ScheduleActivity[] = [
  {
    id: 'act-1',
    title: 'Free Study / Campus Arrival',
    startTime: '8:00 AM',
    endTime: '10:30 AM',
    startHour: 8.0,
    endHour: 10.5,
    room: 'Library 2F',
    isBusy: false,
  },
  {
    id: 'act-2',
    title: 'Web Systems & Technologies',
    startTime: '10:30 AM',
    endTime: '1:00 PM',
    startHour: 10.5,
    endHour: 13.0,
    room: 'D314',
    isBusy: true,
  },
  {
    id: 'act-3',
    title: 'Lunch & Social Break',
    startTime: '1:00 PM',
    endTime: '2:30 PM',
    startHour: 13.0,
    endHour: 14.5,
    room: 'Student Center Lounge',
    isBusy: false,
  },
  {
    id: 'act-4',
    title: 'Distributed Database Lab',
    startTime: '2:30 PM',
    endTime: '4:30 PM',
    startHour: 14.5,
    endHour: 16.5,
    room: 'CS Lab D216',
    isBusy: true,
  },
  {
    id: 'act-5',
    title: 'Open Free Time / Badminton',
    startTime: '4:30 PM',
    endTime: '7:30 PM',
    startHour: 16.5,
    endHour: 19.5,
    room: 'CNU Gym',
    isBusy: false,
  },
  {
    id: 'act-6',
    title: 'Team Sync & Dinner Hangout',
    startTime: '7:30 PM',
    endTime: '9:00 PM',
    startHour: 19.5,
    endHour: 21.0,
    room: 'Court Side Cafe',
    isBusy: false,
  },
];

export interface DayScheduleTab {
  id: string;
  dayAbbrev: string;
  dayNumber: string;
  fullDate: string;
  items: FriendScheduleItem[];
}

export const MARIA_WEEKLY_SCHEDULE: DayScheduleTab[] = [
  {
    id: 'mon',
    dayAbbrev: 'Mon',
    dayNumber: '19',
    fullDate: 'Monday, October 19',
    items: [
      {
        id: 'mon-1',
        title: 'Free - 8:00 AM - 9:30 AM',
        startTime: '8:00 AM',
        endTime: '9:30 AM',
        timeRange: '8:00 AM - 9:30 AM',
        startHour: 8.0,
        endHour: 9.5,
        isBusy: false,
      },
      {
        id: 'mon-2',
        title: 'Database Systems',
        startTime: '9:30',
        endTime: '11:30',
        timeRange: '9:30–11:30',
        room: 'D214',
        startHour: 9.5,
        endHour: 11.5,
        isBusy: true,
      },
      {
        id: 'mon-3',
        title: 'Free - 11:30 AM - 1:30 PM',
        startTime: '11:30 AM',
        endTime: '1:30 PM',
        timeRange: '11:30 AM - 1:30 PM',
        startHour: 11.5,
        endHour: 13.5,
        isBusy: false,
      },
      {
        id: 'mon-4',
        title: 'Business Communication',
        startTime: '1:30',
        endTime: '3:30',
        timeRange: '1:30 - 3:30',
        room: 'AS102',
        startHour: 13.5,
        endHour: 15.5,
        isBusy: true,
      },
      {
        id: 'mon-5',
        title: 'Free - 3:30 PM - 6:00 PM',
        startTime: '3:30 PM',
        endTime: '6:00 PM',
        timeRange: '3:30 PM - 6:00 PM',
        startHour: 15.5,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'tue',
    dayAbbrev: 'Tue',
    dayNumber: '19',
    fullDate: 'Tuesday, October 20',
    items: [
      {
        id: 'tue-1',
        title: 'Free - 8:00 AM - 9:00 AM',
        startTime: '8:00 AM',
        endTime: '9:00 AM',
        timeRange: '8:00 AM - 9:00 AM',
        startHour: 8.0,
        endHour: 9.0,
        isBusy: false,
      },
      {
        id: 'tue-2',
        title: 'Accounting',
        startTime: '9:00',
        endTime: '10:30',
        timeRange: '9:00–10:30',
        room: 'B312',
        startHour: 9.0,
        endHour: 10.5,
        isBusy: true,
      },
      {
        id: 'tue-3',
        title: 'Free - 11:00 AM - 1:00 PM',
        startTime: '11:00 AM',
        endTime: '1:00 PM',
        timeRange: '11:00 AM - 1:00 PM',
        startHour: 11.0,
        endHour: 13.0,
        isBusy: false,
      },
      {
        id: 'tue-4',
        title: 'Financial Management',
        startTime: '1:30',
        endTime: '3:00',
        timeRange: '1:30 -3:00',
        room: 'RB212',
        startHour: 13.5,
        endHour: 15.0,
        isBusy: true,
      },
      {
        id: 'tue-5',
        title: 'Free - 3:30 PM - 6:00 PM',
        startTime: '3:30 PM',
        endTime: '6:00 PM',
        timeRange: '3:30 PM - 6:00 PM',
        startHour: 15.5,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'wed',
    dayAbbrev: 'Wed',
    dayNumber: '21',
    fullDate: 'Wednesday, October 21',
    items: [
      {
        id: 'wed-1',
        title: 'Free - 8:00 AM - 10:00 AM',
        startTime: '8:00 AM',
        endTime: '10:00 AM',
        timeRange: '8:00 AM - 10:00 AM',
        startHour: 8.0,
        endHour: 10.0,
        isBusy: false,
      },
      {
        id: 'wed-2',
        title: 'Business Analytics',
        startTime: '10:00',
        endTime: '12:00',
        timeRange: '10:00–12:00',
        room: 'BA301',
        startHour: 10.0,
        endHour: 12.0,
        isBusy: true,
      },
      {
        id: 'wed-3',
        title: 'Free - 12:00 PM - 2:00 PM',
        startTime: '12:00 PM',
        endTime: '2:00 PM',
        timeRange: '12:00 PM - 2:00 PM',
        startHour: 12.0,
        endHour: 14.0,
        isBusy: false,
      },
      {
        id: 'wed-4',
        title: 'Marketing Principles',
        startTime: '2:00',
        endTime: '3:30',
        timeRange: '2:00–3:30',
        room: 'M101',
        startHour: 14.0,
        endHour: 15.5,
        isBusy: true,
      },
      {
        id: 'wed-5',
        title: 'Free - 3:30 PM - 6:00 PM',
        startTime: '3:30 PM',
        endTime: '6:00 PM',
        timeRange: '3:30 PM - 6:00 PM',
        startHour: 15.5,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'thu',
    dayAbbrev: 'Thurs',
    dayNumber: '22',
    fullDate: 'Thursday, October 22',
    items: [
      {
        id: 'thu-1',
        title: 'Free - 8:00 AM - 9:00 AM',
        startTime: '8:00 AM',
        endTime: '9:00 AM',
        timeRange: '8:00 AM - 9:00 AM',
        startHour: 8.0,
        endHour: 9.0,
        isBusy: false,
      },
      {
        id: 'thu-2',
        title: 'Accounting',
        startTime: '9:00',
        endTime: '10:30',
        timeRange: '9:00–10:30',
        room: 'B312',
        startHour: 9.0,
        endHour: 10.5,
        isBusy: true,
      },
      {
        id: 'thu-3',
        title: 'Free - 11:00 AM - 1:00 PM',
        startTime: '11:00 AM',
        endTime: '1:00 PM',
        timeRange: '11:00 AM - 1:00 PM',
        startHour: 11.0,
        endHour: 13.0,
        isBusy: false,
      },
      {
        id: 'thu-4',
        title: 'Financial Management',
        startTime: '1:30',
        endTime: '3:00',
        timeRange: '1:30 -3:00',
        room: 'RB212',
        startHour: 13.5,
        endHour: 15.0,
        isBusy: true,
      },
      {
        id: 'thu-5',
        title: 'Free - 3:30 PM - 6:00 PM',
        startTime: '3:30 PM',
        endTime: '6:00 PM',
        timeRange: '3:30 PM - 6:00 PM',
        startHour: 15.5,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'fri',
    dayAbbrev: 'Fri',
    dayNumber: '23',
    fullDate: 'Friday, October 23',
    items: [
      {
        id: 'fri-1',
        title: 'Free - 8:00 AM - 10:30 AM',
        startTime: '8:00 AM',
        endTime: '10:30 AM',
        timeRange: '8:00 AM - 10:30 AM',
        startHour: 8.0,
        endHour: 10.5,
        isBusy: false,
      },
      {
        id: 'fri-2',
        title: 'DYD Project Consultation',
        startTime: '10:30',
        endTime: '12:30',
        timeRange: '10:30–12:30',
        room: 'Discussion 3',
        startHour: 10.5,
        endHour: 12.5,
        isBusy: true,
      },
      {
        id: 'fri-3',
        title: 'Free - 12:30 PM - 3:00 PM',
        startTime: '12:30 PM',
        endTime: '3:00 PM',
        timeRange: '12:30 PM - 3:00 PM',
        startHour: 12.5,
        endHour: 15.0,
        isBusy: false,
      },
      {
        id: 'fri-4',
        title: 'Ethics & Social Responsibility',
        startTime: '3:00',
        endTime: '4:30',
        timeRange: '3:00–4:30',
        room: 'AS204',
        startHour: 15.0,
        endHour: 16.5,
        isBusy: true,
      },
      {
        id: 'fri-5',
        title: 'Free - 4:30 PM - 6:00 PM',
        startTime: '4:30 PM',
        endTime: '6:00 PM',
        timeRange: '4:30 PM - 6:00 PM',
        startHour: 16.5,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'sat',
    dayAbbrev: 'Sat',
    dayNumber: '24',
    fullDate: 'Saturday, October 24',
    items: [
      {
        id: 'sat-1',
        title: 'Free - 8:00 AM - 1:00 PM',
        startTime: '8:00 AM',
        endTime: '1:00 PM',
        timeRange: '8:00 AM - 1:00 PM',
        startHour: 8.0,
        endHour: 13.0,
        isBusy: false,
      },
      {
        id: 'sat-2',
        title: 'Student Assembly Meeting',
        startTime: '1:00',
        endTime: '3:00',
        timeRange: '1:00–3:00',
        room: 'Audi 2',
        startHour: 13.0,
        endHour: 15.0,
        isBusy: true,
      },
      {
        id: 'sat-3',
        title: 'Free - 3:00 PM - 6:00 PM',
        startTime: '3:00 PM',
        endTime: '6:00 PM',
        timeRange: '3:00 PM - 6:00 PM',
        startHour: 15.0,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
  {
    id: 'sun',
    dayAbbrev: 'Sun',
    dayNumber: '25',
    fullDate: 'Sunday, October 25',
    items: [
      {
        id: 'sun-1',
        title: 'Free - 8:00 AM - 6:00 PM',
        startTime: '8:00 AM',
        endTime: '6:00 PM',
        timeRange: '8:00 AM - 6:00 PM',
        startHour: 8.0,
        endHour: 18.0,
        isBusy: false,
      },
    ],
  },
];

export function getWeeklySchedule(weekOffset: number = 0): {
  weekIndicator: string;
  days: DayScheduleTab[];
} {
  // Base week in Figma mockup: Sunday, October 25, 2026
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const baseSunday = new Date(2026, 9, 25);
  const targetSunday = new Date(baseSunday);
  targetSunday.setDate(baseSunday.getDate() + weekOffset * 7);

  const targetMonth = monthNames[targetSunday.getMonth()];
  const targetDate = targetSunday.getDate();
  const targetYear = targetSunday.getFullYear();
  const weekIndicator = `Sunday, ${targetMonth} ${targetDate},${targetYear}`;

  if (weekOffset === 0) {
    return {
      weekIndicator: 'Sunday, October 25,2026',
      days: MARIA_WEEKLY_SCHEDULE,
    };
  }

  const dayConfigs = [
    { id: 'mon', dayAbbrev: 'Mon', dayOffset: -6, dayName: 'Monday' },
    { id: 'tue', dayAbbrev: 'Tue', dayOffset: -5, dayName: 'Tuesday' },
    { id: 'wed', dayAbbrev: 'Wed', dayOffset: -4, dayName: 'Wednesday' },
    { id: 'thu', dayAbbrev: 'Thurs', dayOffset: -3, dayName: 'Thursday' },
    { id: 'fri', dayAbbrev: 'Fri', dayOffset: -2, dayName: 'Friday' },
    { id: 'sat', dayAbbrev: 'Sat', dayOffset: -1, dayName: 'Saturday' },
    { id: 'sun', dayAbbrev: 'Sun', dayOffset: 0, dayName: 'Sunday' },
  ];

  const days: DayScheduleTab[] = dayConfigs.map((config) => {
    const d = new Date(targetSunday);
    d.setDate(targetSunday.getDate() + config.dayOffset);
    const mName = monthNames[d.getMonth()];
    const dNum = d.getDate();
    const fullDate = `${config.dayName}, ${mName} ${dNum}`;

    let items: FriendScheduleItem[] = [];
    if (config.id === 'tue' || config.id === 'thu') {
      items = [
        {
          id: `${config.id}-1`,
          title: 'Free - 8:00 AM - 9:00 AM',
          startTime: '8:00 AM',
          endTime: '9:00 AM',
          timeRange: '8:00 AM - 9:00 AM',
          startHour: 8.0,
          endHour: 9.0,
          isBusy: false,
        },
        {
          id: `${config.id}-2`,
          title: 'Accounting',
          startTime: '9:00',
          endTime: '10:30',
          timeRange: '9:00–10:30',
          room: 'B312',
          startHour: 9.0,
          endHour: 10.5,
          isBusy: true,
        },
        {
          id: `${config.id}-3`,
          title: 'Free - 11:00 AM - 1:00 PM',
          startTime: '11:00 AM',
          endTime: '1:00 PM',
          timeRange: '11:00 AM - 1:00 PM',
          startHour: 11.0,
          endHour: 13.0,
          isBusy: false,
        },
        {
          id: `${config.id}-4`,
          title: 'Financial Management',
          startTime: '1:30',
          endTime: '3:00',
          timeRange: '1:30 -3:00',
          room: 'RB212',
          startHour: 13.5,
          endHour: 15.0,
          isBusy: true,
        },
        {
          id: `${config.id}-5`,
          title: 'Free - 3:30 PM - 6:00 PM',
          startTime: '3:30 PM',
          endTime: '6:00 PM',
          timeRange: '3:30 PM - 6:00 PM',
          startHour: 15.5,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    } else if (config.id === 'mon' || config.id === 'wed') {
      items = [
        {
          id: `${config.id}-1`,
          title: 'Free - 8:00 AM - 9:30 AM',
          startTime: '8:00 AM',
          endTime: '9:30 AM',
          timeRange: '8:00 AM - 9:30 AM',
          startHour: 8.0,
          endHour: 9.5,
          isBusy: false,
        },
        {
          id: `${config.id}-2`,
          title: config.id === 'mon' ? 'Database Systems' : 'Business Analytics',
          startTime: '9:30',
          endTime: '11:30',
          timeRange: '9:30–11:30',
          room: config.id === 'mon' ? 'D214' : 'BA301',
          startHour: 9.5,
          endHour: 11.5,
          isBusy: true,
        },
        {
          id: `${config.id}-3`,
          title: 'Free - 11:30 AM - 1:30 PM',
          startTime: '11:30 AM',
          endTime: '1:30 PM',
          timeRange: '11:30 AM - 1:30 PM',
          startHour: 11.5,
          endHour: 13.5,
          isBusy: false,
        },
        {
          id: `${config.id}-4`,
          title: config.id === 'mon' ? 'Business Communication' : 'Marketing Principles',
          startTime: '1:30',
          endTime: '3:30',
          timeRange: '1:30 - 3:30',
          room: config.id === 'mon' ? 'AS102' : 'M101',
          startHour: 13.5,
          endHour: 15.5,
          isBusy: true,
        },
        {
          id: `${config.id}-5`,
          title: 'Free - 3:30 PM - 6:00 PM',
          startTime: '3:30 PM',
          endTime: '6:00 PM',
          timeRange: '3:30 PM - 6:00 PM',
          startHour: 15.5,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    } else if (config.id === 'fri') {
      items = [
        {
          id: 'fri-1',
          title: 'Free - 8:00 AM - 10:30 AM',
          startTime: '8:00 AM',
          endTime: '10:30 AM',
          timeRange: '8:00 AM - 10:30 AM',
          startHour: 8.0,
          endHour: 10.5,
          isBusy: false,
        },
        {
          id: 'fri-2',
          title: 'DYD Project Consultation',
          startTime: '10:30',
          endTime: '12:30',
          timeRange: '10:30–12:30',
          room: 'Discussion 3',
          startHour: 10.5,
          endHour: 12.5,
          isBusy: true,
        },
        {
          id: 'fri-3',
          title: 'Free - 12:30 PM - 3:00 PM',
          startTime: '12:30 PM',
          endTime: '3:00 PM',
          timeRange: '12:30 PM - 3:00 PM',
          startHour: 12.5,
          endHour: 15.0,
          isBusy: false,
        },
        {
          id: 'fri-4',
          title: 'Ethics & Social Responsibility',
          startTime: '3:00',
          endTime: '4:30',
          timeRange: '3:00–4:30',
          room: 'AS204',
          startHour: 15.0,
          endHour: 16.5,
          isBusy: true,
        },
        {
          id: 'fri-5',
          title: 'Free - 4:30 PM - 6:00 PM',
          startTime: '4:30 PM',
          endTime: '6:00 PM',
          timeRange: '4:30 PM - 6:00 PM',
          startHour: 16.5,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    } else if (config.id === 'sat') {
      items = [
        {
          id: 'sat-1',
          title: 'Free - 8:00 AM - 1:00 PM',
          startTime: '8:00 AM',
          endTime: '1:00 PM',
          timeRange: '8:00 AM - 1:00 PM',
          startHour: 8.0,
          endHour: 13.0,
          isBusy: false,
        },
        {
          id: 'sat-2',
          title: 'Student Assembly Meeting',
          startTime: '1:00',
          endTime: '3:00',
          timeRange: '1:00–3:00',
          room: 'Audi 2',
          startHour: 13.0,
          endHour: 15.0,
          isBusy: true,
        },
        {
          id: 'sat-3',
          title: 'Free - 3:00 PM - 6:00 PM',
          startTime: '3:00 PM',
          endTime: '6:00 PM',
          timeRange: '3:00 PM - 6:00 PM',
          startHour: 15.0,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    } else {
      items = [
        {
          id: 'sun-1',
          title: 'Free - 8:00 AM - 6:00 PM',
          startTime: '8:00 AM',
          endTime: '6:00 PM',
          timeRange: '8:00 AM - 6:00 PM',
          startHour: 8.0,
          endHour: 18.0,
          isBusy: false,
        },
      ];
    }

    return {
      id: config.id,
      dayAbbrev: config.dayAbbrev,
      dayNumber: String(dNum),
      fullDate,
      items,
    };
  });

  return {
    weekIndicator,
    days,
  };
}

export const SAMPLE_FRIEND_MARIA_DEBORAH: FriendAvailability = {
  id: 'f-agna',
  name: 'Maria Deborah',
  nickname: 'Agna',
  relationship: 'DYD Friend',
  initials: 'MD',
  status: 'free',
  untilTime: '9:00AM',
  nextActivity: '9:00am B312 Accounting',
  groups: ['dyd'],
  currentLocation: 'Campus Grounds',
  freeSlots: [
    { startHour: 8.0, endHour: 9.0 },
    { startHour: 11.0, endHour: 13.0 },
    { startHour: 15.5, endHour: 18.0 },
  ],
  scheduleNotes: 'Accounting at 9:00 AM, Financial Management in the afternoon.',
  schedule: MARIA_WEEKLY_SCHEDULE[1].items,
};

export const SAMPLE_FRIENDS: FriendAvailability[] = [
  SAMPLE_FRIEND_MARIA_DEBORAH,
  {
    id: 'f-1',
    name: 'Maria Sophia Gonzales',
    initials: 'M',
    status: 'free',
    untilTime: '10:30AM',
    nextActivity: '3:00pm AL212',
    groups: ['bora', 'courtside'],
    currentLocation: 'University Library 2F',
    freeSlots: [
      { startHour: 8.0, endHour: 10.5 },
      { startHour: 12.0, endHour: 15.0 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Available all morning until class in AL212.',
    schedule: [
      {
        id: 'msg-1',
        title: 'Morning Free Study Slot',
        startTime: '8:00 AM',
        endTime: '10:30 AM',
        startHour: 8.0,
        endHour: 10.5,
        room: 'Library 2F',
        isBusy: false,
        description: 'Morning study & reviewing lecture slides',
      },
      {
        id: 'msg-2',
        title: 'GE 401 - Ethics & Professionalism',
        startTime: '10:30 AM',
        endTime: '12:00 PM',
        startHour: 10.5,
        endHour: 12.0,
        room: 'AS301',
        code: 'GE 401',
        isBusy: true,
        description: 'Case study analysis and class debate',
      },
      {
        id: 'msg-3',
        title: 'Lunch & Campus Commons Break',
        startTime: '12:00 PM',
        endTime: '3:00 PM',
        startHour: 12.0,
        endHour: 15.0,
        room: 'Student Commons',
        isBusy: false,
        description: 'Lunch with peers & chill time',
      },
      {
        id: 'msg-4',
        title: 'CS 314 - Web Systems & Technologies',
        startTime: '3:00 PM',
        endTime: '5:30 PM',
        startHour: 15.0,
        endHour: 17.5,
        room: 'AL212',
        code: 'CS 314',
        isBusy: true,
        description: 'Full-stack application practical lab',
      },
      {
        id: 'msg-5',
        title: 'Student Council Committee Meeting',
        startTime: '5:30 PM',
        endTime: '7:30 PM',
        startHour: 17.5,
        endHour: 19.5,
        room: 'SAC 102',
        code: 'ORG 101',
        isBusy: true,
        description: 'Planning upcoming university sportsfest',
      },
      {
        id: 'msg-6',
        title: 'Evening Free Window (Hangout)',
        startTime: '7:30 PM',
        endTime: '9:00 PM',
        startHour: 19.5,
        endHour: 21.0,
        room: 'Court Side Cafe',
        isBusy: false,
        description: 'Free for dinner and catch-up',
      },
    ],
  },
  {
    id: 'f-2',
    name: 'Allyna Aranez',
    initials: 'A',
    status: 'free',
    untilTime: '3:00PM',
    nextActivity: '6:00pm D314',
    groups: ['bora', 'dyd'],
    currentLocation: 'Campus Green Pavilion',
    freeSlots: [
      { startHour: 8.0, endHour: 15.0 },
      { startHour: 16.5, endHour: 18.0 },
      { startHour: 19.5, endHour: 21.5 },
    ],
    scheduleNotes: 'Free for group work and lunch!',
    schedule: [
      {
        id: 'aa-1',
        title: 'Morning & Midday Open Study',
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        startHour: 8.0,
        endHour: 15.0,
        room: 'Green Pavilion',
        isBusy: false,
        description: 'Free all morning to collaborate and study',
      },
      {
        id: 'aa-2',
        title: 'Bora Project Sprint Planning',
        startTime: '3:00 PM',
        endTime: '4:30 PM',
        startHour: 15.0,
        endHour: 16.5,
        room: 'Discussion Room 4',
        code: 'PROJ 302',
        isBusy: true,
        description: 'Sprint planning and task breakdown',
      },
      {
        id: 'aa-3',
        title: 'Pre-class Study Break',
        startTime: '4:30 PM',
        endTime: '6:00 PM',
        startHour: 16.5,
        endHour: 18.0,
        room: 'D Building Lobby',
        isBusy: false,
        description: 'Reading chapter notes',
      },
      {
        id: 'aa-4',
        title: 'CS 320 - Database Systems Lab',
        startTime: '6:00 PM',
        endTime: '7:30 PM',
        startHour: 18.0,
        endHour: 19.5,
        room: 'D314',
        code: 'CS 320',
        isBusy: true,
        description: 'Relational database schema evaluation',
      },
      {
        id: 'aa-5',
        title: 'Evening Chill Window',
        startTime: '7:30 PM',
        endTime: '9:00 PM',
        startHour: 19.5,
        endHour: 21.0,
        room: 'Campus Commons',
        isBusy: false,
        description: 'Free for evening hangout with group',
      },
    ],
  },
  {
    id: 'f-3',
    name: 'Noelle Angela Alarma',
    initials: 'N',
    status: 'busy',
    untilTime: '10:30AM',
    currentActivity: 'Networking D216',
    nextActivity: '1:00pm Tech Lab',
    groups: ['courtside', 'dyd'],
    currentLocation: 'Networking Lab D216',
    freeSlots: [
      { startHour: 10.5, endHour: 13.0 },
      { startHour: 15.5, endHour: 17.5 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Midterm project discussion during lunch break.',
    schedule: [
      {
        id: 'na-1',
        title: 'IT 210 - Computer Networking',
        startTime: '8:00 AM',
        endTime: '10:30 AM',
        startHour: 8.0,
        endHour: 10.5,
        room: 'D216',
        code: 'IT 210',
        isBusy: true,
        description: 'Hands-on router switch configuration',
      },
      {
        id: 'na-2',
        title: 'Post-Networking Vacant Interval',
        startTime: '10:30 AM',
        endTime: '1:00 PM',
        startHour: 10.5,
        endHour: 13.0,
        room: 'Engineering Quad',
        isBusy: false,
        description: 'Free time for lunch and resting',
      },
      {
        id: 'na-3',
        title: 'IT 305 - System Administration',
        startTime: '1:00 PM',
        endTime: '3:30 PM',
        startHour: 13.0,
        endHour: 15.5,
        room: 'L302',
        code: 'IT 305',
        isBusy: true,
        description: 'Linux server management & Docker setup',
      },
      {
        id: 'na-4',
        title: 'Afternoon Free Window',
        startTime: '3:30 PM',
        endTime: '5:30 PM',
        startHour: 15.5,
        endHour: 17.5,
        room: 'Student Lounge',
        isBusy: false,
        description: 'Relaxation and snacks',
      },
      {
        id: 'na-5',
        title: 'Court Side Team Conditioning',
        startTime: '5:30 PM',
        endTime: '7:30 PM',
        startHour: 17.5,
        endHour: 19.5,
        room: 'University Track Oval',
        code: 'TRAIN',
        isBusy: true,
        description: 'Strength and fitness training',
      },
      {
        id: 'na-6',
        title: 'Evening Free Window',
        startTime: '7:30 PM',
        endTime: '9:00 PM',
        startHour: 19.5,
        endHour: 21.0,
        room: 'Main Cafeteria',
        isBusy: false,
        description: 'Free for dinner and social time',
      },
    ],
  },
  {
    id: 'f-4',
    name: 'Samantha Lee',
    initials: 'S',
    status: 'free',
    untilTime: '11:45AM',
    nextActivity: '1:00pm CS Library',
    groups: ['bora', 'courtside', 'dyd'],
    freeSlots: [
      { startHour: 9.0, endHour: 11.75 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Reviewing algorithm notes in the library.',
  },
  {
    id: 'f-5',
    name: 'Christian Dave',
    initials: 'C',
    status: 'busy',
    untilTime: '12:00PM',
    currentActivity: 'Software Engineering Lecture',
    nextActivity: '2:00pm Court Side Practice',
    groups: ['courtside'],
    freeSlots: [
      { startHour: 12.0, endHour: 14.0 },
      { startHour: 17.0, endHour: 19.0 },
    ],
    scheduleNotes: 'Practice match at the university court.',
  },
  {
    id: 'f-6',
    name: 'Danielle Rivera',
    initials: 'D',
    status: 'free',
    untilTime: '1:30PM',
    nextActivity: '3:00pm Discrete Math',
    groups: ['dyd'],
    freeSlots: [
      { startHour: 8.0, endHour: 13.5 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Free for coffee near the main gate.',
  },
  {
    id: 'f-7',
    name: 'Joshua Emmanuel',
    initials: 'J',
    status: 'unknown',
    isPrivate: true,
    hasSchedule: false,
    groups: ['bora', 'courtside', 'dyd'],
    freeSlots: [],
    scheduleNotes: 'Schedule is set to private.',
  },
];

/**
 * Calculates time-aware greeting
 */
export function getTimeAwareGreeting(name: string, date: Date = new Date()): string {
  const hours = date.getHours();
  let timeGreeting = 'Good Day';
  if (hours >= 5 && hours < 12) {
    timeGreeting = 'Good Morning';
  } else if (hours >= 12 && hours < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (hours >= 17 && hours < 22) {
    timeGreeting = 'Good Evening';
  }
  return `${timeGreeting}, ${name}!`;
}

/**
 * Formats a dynamic date string in the Figma format:
 * "Sunday, October 25, 2026"
 */
export function formatDashboardDate(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();

  return `${dayName}, ${monthName} ${dayNum}, ${year}`;
}

/**
 * Filters friends according to the selected group
 */
export function filterFriendsByGroup(
  friends: FriendAvailability[],
  groupId: FriendGroupId
): FriendAvailability[] {
  const seen = new Set<string>();
  const uniqueFriends = friends.filter((friend) => {
    if (seen.has(friend.id)) {
      return false;
    }
    seen.add(friend.id);
    return true;
  });

  if (groupId === 'all') {
    return uniqueFriends;
  }
  return uniqueFriends.filter((f) => f.groups.includes(groupId as 'bora' | 'courtside' | 'dyd'));
}

/**
 * Dynamic calculation of the "Best Window Today" based on mutual free slots
 */
export function calculateBestWindow(
  friends: FriendAvailability[],
  groupId: FriendGroupId
): BestWindow | null {
  const activeFriends = filterFriendsByGroup(friends, groupId);
  if (activeFriends.length === 0) {
    return null;
  }

  // Common candidate slots throughout the day
  const candidateSlots = [
    { start: 19.5, end: 21.0, label: '7:30 – 9:00 PM today' },
    { start: 13.0, end: 14.5, label: '1:00 – 2:30 PM today' },
    { start: 16.5, end: 18.0, label: '4:30 – 6:00 PM today' },
    { start: 8.5, end: 10.0, label: '8:30 – 10:00 AM today' },
  ];

  let bestCandidate: (typeof candidateSlots)[0] | null = null;
  let maxOverlaps: FriendAvailability[] = [];

  for (const slot of candidateSlots) {
    const overlappingFriends = activeFriends.filter((friend) =>
      friend.freeSlots?.some(
        (fs) => fs.startHour <= slot.start && fs.endHour >= slot.end
      )
    );

    if (overlappingFriends.length > maxOverlaps.length) {
      maxOverlaps = overlappingFriends;
      bestCandidate = slot;
    }
  }

  if (!bestCandidate || maxOverlaps.length === 0) {
    return null;
  }

  // Format description
  const totalCount = maxOverlaps.length + 1; // including the user
  const firstName = maxOverlaps[0].name.split(' ')[0];
  const otherCount = totalCount - 2;

  let description = '';
  if (totalCount === 2) {
    description = `You and ${firstName} are both free`;
  } else if (otherCount === 1) {
    description = `You, ${firstName}, and 1 other are all free (${totalCount} people)`;
  } else {
    description = `You, ${firstName}, and ${otherCount} other are all free (${totalCount} people)`;
  }

  const initials = maxOverlaps.map((f) => f.initials.charAt(0).toUpperCase());

  return {
    timeRange: bestCandidate.label,
    description,
    initials,
    freeCount: totalCount,
    suggestedActivity: 'Court side meetup, review session, or campus coffee break',
    startHour: bestCandidate.start,
    endHour: bestCandidate.end,
  };
}

export interface TimeSlotTimeline {
  periodLabel: string; // e.g. "Morning 8:00 AM - 1:00 PM"
  timeMarkers: string[];
  segments: Array<{
    label: string;
    isFree: boolean;
    durationRatio: number;
    activityName: string;
  }>;
}

export const TIMELINE_PERIODS: TimeSlotTimeline[] = [
  {
    periodLabel: 'Daytime View',
    timeMarkers: ['8:00AM', '1:00PM', '3:00 PM'],
    segments: [
      { label: '8am - 10:30am', isFree: true, durationRatio: 2.5, activityName: 'Free Study Slot' },
      { label: '10:30am - 1pm', isFree: false, durationRatio: 2.5, activityName: 'Web Systems Class' },
      { label: '1pm - 2:30pm', isFree: true, durationRatio: 1.5, activityName: 'Lunch & Free Time' },
      { label: '2:30pm - 4:30pm', isFree: false, durationRatio: 2.0, activityName: 'Database Lab' },
      { label: '4:30pm - 7:30pm', isFree: true, durationRatio: 3.0, activityName: 'After-class Free Time' },
    ],
  },
  {
    periodLabel: 'Morning Window',
    timeMarkers: ['7:00AM', '9:30AM', '12:00PM'],
    segments: [
      { label: '7am - 9am', isFree: true, durationRatio: 2.0, activityName: 'Early Morning Prep' },
      { label: '9am - 11am', isFree: false, durationRatio: 2.0, activityName: 'Lecture Hall 1' },
      { label: '11am - 12pm', isFree: true, durationRatio: 1.0, activityName: 'Campus Free Window' },
    ],
  },
  {
    periodLabel: 'Evening & Night',
    timeMarkers: ['5:00PM', '7:30PM', '9:30 PM'],
    segments: [
      { label: '5pm - 6:30pm', isFree: true, durationRatio: 1.5, activityName: 'Gym / Sports' },
      { label: '6:30pm - 7:30pm', isFree: false, durationRatio: 1.0, activityName: 'Dinner' },
      { label: '7:30pm - 9:30pm', isFree: true, durationRatio: 2.0, activityName: 'Prime Overlap Window' },
    ],
  },
];

/**
 * Format 24-hr decimal hour (e.g. 10.5) to "10:30 AM"
 */
export function formatDecimalHourToTime(decimalHour: number): string {
  const totalMinutes = Math.round(decimalHour * 60);
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const formattedMinutes = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${formattedMinutes} ${period}`;
}

/**
 * Calculate mutual free time windows between the user and a friend
 */
export function calculateMutualFreeWindows(
  userActivities: ScheduleActivity[],
  friend: FriendAvailability
): MutualFreeWindow[] {
  const userFree = userActivities.filter((a) => !a.isBusy);
  const friendFree = friend.schedule
    ? friend.schedule.filter((s) => !s.isBusy)
    : (friend.freeSlots || []).map((fs, idx) => ({
        id: `fs-${idx}`,
        title: 'Free Window',
        startTime: formatDecimalHourToTime(fs.startHour),
        endTime: formatDecimalHourToTime(fs.endHour),
        startHour: fs.startHour,
        endHour: fs.endHour,
        isBusy: false,
      }));

  const overlaps: MutualFreeWindow[] = [];

  for (const u of userFree) {
    for (const f of friendFree) {
      const start = Math.max(u.startHour, f.startHour);
      const end = Math.min(u.endHour, f.endHour);

      if (end - start >= 0.5) {
        // At least 30 minutes
        overlaps.push({
          startTime: formatDecimalHourToTime(start),
          endTime: formatDecimalHourToTime(end),
          durationMinutes: Math.round((end - start) * 60),
        });
      }
    }
  }

  return overlaps;
}

