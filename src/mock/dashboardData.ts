import {
  FriendGroupOption,
  ScheduleActivity,
  FriendAvailability,
  BestWindow,
  UserProfile,
  FriendGroupId,
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

export const SAMPLE_FRIENDS: FriendAvailability[] = [
  {
    id: 'f-1',
    name: 'Maria Sophia Gonzales',
    initials: 'M',
    status: 'free',
    untilTime: '10:30AM',
    nextActivity: '3:00pm AL212',
    groups: ['bora', 'courtside'],
    freeSlots: [
      { startHour: 8.0, endHour: 10.5 },
      { startHour: 13.0, endHour: 15.0 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Available all morning until class in AL212.',
  },
  {
    id: 'f-2',
    name: 'Allyna Aranez',
    initials: 'A',
    status: 'free',
    untilTime: '3:00PM',
    nextActivity: '6:00pm D314',
    groups: ['bora', 'dyd'],
    freeSlots: [
      { startHour: 8.0, endHour: 15.0 },
      { startHour: 19.5, endHour: 21.5 },
    ],
    scheduleNotes: 'Free for group work and lunch!',
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
    freeSlots: [
      { startHour: 10.5, endHour: 13.0 },
      { startHour: 19.5, endHour: 21.0 },
    ],
    scheduleNotes: 'Midterm project discussion during lunch break.',
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
  if (groupId === 'all') {
    return friends;
  }
  return friends.filter((f) => f.groups.includes(groupId as 'bora' | 'courtside' | 'dyd'));
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
