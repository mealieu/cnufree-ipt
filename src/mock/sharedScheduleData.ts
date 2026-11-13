import {
  SharedCalendarFriend,
  SharedFriendGroup,
  OverlappingFreeWindow,
  SharedScheduleItem,
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
const OCT_24 = '2026-10-24'; // Saturday (Empty state)
const OCT_25 = '2026-10-25'; // Sunday (Empty state)

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
    room: 'Hall B 102',
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
    room: 'Art Bldg 204',
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

// Tuesday Oct 20 schedules for variety
const AVA_OCT_20: SharedScheduleItem[] = [
  {
    id: 'ava-20-1',
    title: 'Design Tech',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    timeRange: '10:00–12:00',
    startHour: 10.0,
    endHour: 12.0,
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
    isBusy: true,
    colorVariant: 'teal',
  },
  {
    id: 'ben-20-2',
    title: 'Library Study',
    startTime: '1:00 PM',
    endTime: '2:30 PM',
    timeRange: '1:00–2:30',
    startHour: 13.0,
    endHour: 14.5,
    isBusy: true,
    colorVariant: 'teal',
  },
];

const CHLOE_OCT_20: SharedScheduleItem[] = [
  {
    id: 'chloe-20-1',
    title: 'Busy',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    timeRange: '11:00–1:00',
    startHour: 11.0,
    endHour: 13.0,
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
    isBusy: true,
    colorVariant: 'olive',
  },
  {
    id: 'dev-20-2',
    title: 'Code Review',
    startTime: '1:30 PM',
    endTime: '3:00 PM',
    timeRange: '1:30–3:00',
    startHour: 13.5,
    endHour: 15.0,
    isBusy: true,
    colorVariant: 'olive',
  },
];

export const PROJECT_TEAM_MEMBERS: SharedCalendarFriend[] = [
  {
    id: 'friend-ava',
    name: 'Ava',
    nickname: 'Ava',
    initials: 'AC',
    scheduleByDate: {
      [OCT_19]: AVA_SCHEDULE_OCT_19,
      [OCT_20]: AVA_OCT_20,
      [OCT_21]: AVA_SCHEDULE_OCT_19,
      [OCT_22]: AVA_OCT_20,
      [OCT_23]: AVA_SCHEDULE_OCT_19,
      [OCT_24]: [], // Empty Saturday
      [OCT_25]: [], // Empty Sunday
    },
  },
  {
    id: 'friend-ben',
    name: 'Ben',
    nickname: 'Ben',
    initials: 'BO',
    scheduleByDate: {
      [OCT_19]: BEN_SCHEDULE_OCT_19,
      [OCT_20]: BEN_OCT_20,
      [OCT_21]: BEN_SCHEDULE_OCT_19,
      [OCT_22]: BEN_OCT_20,
      [OCT_23]: BEN_SCHEDULE_OCT_19,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'friend-chloe',
    name: 'Chloe',
    nickname: 'Chloe',
    initials: 'CP',
    isPrivate: true, // Privacy indicator for SS-06
    scheduleByDate: {
      [OCT_19]: CHLOE_SCHEDULE_OCT_19,
      [OCT_20]: CHLOE_OCT_20,
      [OCT_21]: CHLOE_SCHEDULE_OCT_19,
      [OCT_22]: CHLOE_OCT_20,
      [OCT_23]: CHLOE_SCHEDULE_OCT_19,
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
  {
    id: 'friend-dev',
    name: 'Dev',
    nickname: 'Dev',
    initials: 'DP',
    scheduleByDate: {
      [OCT_19]: DEV_SCHEDULE_OCT_19,
      [OCT_20]: DEV_OCT_20,
      [OCT_21]: DEV_SCHEDULE_OCT_19,
      [OCT_22]: DEV_OCT_20,
      [OCT_23]: DEV_SCHEDULE_OCT_19,
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
      [OCT_20]: [],
      [OCT_21]: [],
      [OCT_22]: [],
      [OCT_23]: [],
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
      [OCT_20]: [],
      [OCT_21]: [],
      [OCT_22]: [],
      [OCT_23]: [],
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
      [OCT_20]: [],
      [OCT_21]: [],
      [OCT_22]: [],
      [OCT_23]: [],
      [OCT_24]: [],
      [OCT_25]: [],
    },
  },
];

export const SHARED_FRIEND_GROUPS: SharedFriendGroup[] = [
  {
    id: 'grp-project-team',
    name: 'Project Team',
    memberCount: 4,
    members: PROJECT_TEAM_MEMBERS,
    description: 'Capstone / IPT project team members',
  },
  {
    id: 'grp-it-pwends',
    name: 'IT Pwends',
    memberCount: 3,
    members: IT_PWENDS_MEMBERS,
    description: 'IT classmates & study group',
  },
  {
    id: 'grp-all-friends',
    name: 'All Friends',
    memberCount: 7,
    members: [...PROJECT_TEAM_MEMBERS, ...IT_PWENDS_MEMBERS],
    description: 'All connected friends schedule',
  },
  {
    id: 'grp-shs-friends',
    name: 'SHS Friends',
    memberCount: 2,
    members: [IT_PWENDS_MEMBERS[0], IT_PWENDS_MEMBERS[1]],
    description: 'High school friends group',
  },
  {
    id: 'grp-dyd-squad',
    name: 'DYD Squad',
    memberCount: 1,
    members: [IT_PWENDS_MEMBERS[1]],
    description: 'Dorm & dining squad',
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
 * Calculates overlapping free windows for a given set of friends on a specific date.
 */
export function calculateOverlappingWindows(
  friends: SharedCalendarFriend[],
  dateKey: string
): { allFreeWindows: OverlappingFreeWindow[]; partialWindows: OverlappingFreeWindow[] } {
  if (dateKey === OCT_19 && friends.length === 4) {
    return {
      allFreeWindows: OCT_19_FREE_WINDOWS,
      partialWindows: OCT_19_PARTIAL_FREE_WINDOWS,
    };
  }

  // Fallback calculation for other dates
  const totalFriends = friends.length;
  if (totalFriends === 0) {
    return { allFreeWindows: [], partialWindows: [] };
  }

  // Check 30-min increments from 8.0 to 18.0
  const slots: { hour: number; freeCount: number }[] = [];
  for (let h = 8.0; h < 18.0; h += 0.5) {
    let freeCount = 0;
    friends.forEach((friend) => {
      const schedule = friend.scheduleByDate[dateKey] || [];
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
      if (endHour - allFreeStart >= 1.0) {
        allFreeWindows.push({
          id: `calc-all-${allFreeStart}`,
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
      id: `calc-all-${allFreeStart}`,
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

