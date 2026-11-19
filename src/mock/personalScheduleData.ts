/**
 * Mock data for Personal Schedule (PS-03 / PS-04)
 * Faithfully mirrors the Figma wireframe and attached screenshot.
 */

import {
  PersonalScheduleDay,
  PersonalSchedulePeriod,
  WeeklyScheduleDay,
  WeeklyScheduleSlot,
  WeeklyScheduleWeek,
} from '../types/personalSchedule';

/**
 * Tuesday Schedule (matches exact screenshot layout: 8AM Free, 9AM Free, 10AM Busy, 12PM Busy, 12PM Busy, 12PM Busy)
 */
const TUESDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-tue-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '9:00 AM',
    timeRange: '8:00AM – 9:00AM',
    startHour: 8.0,
    endHour: 9.0,
    dayKey: 'tue',
    notes: 'Morning quiet study or breakfast window',
  },
  {
    id: 'ps-tue-2',
    timeMarker: '9:00 AM',
    title: 'Free',
    isBusy: false,
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    timeRange: '9:00AM – 10:00AM',
    startHour: 9.0,
    endHour: 10.0,
    dayKey: 'tue',
    notes: 'Library open desk time',
  },
  {
    id: 'ps-tue-3',
    timeMarker: '10:00 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    timeRange: '10:00 to 12: 00PM',
    startHour: 10.0,
    endHour: 12.0,
    room: 'AL211A',
    notes: 'UI/UX Design Studio lecture & critique',
    dayKey: 'tue',
  },
  {
    id: 'ps-tue-4',
    timeMarker: '12:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '12:00 PM',
    endTime: '1:00 PM',
    timeRange: '12:00 pm to 1:00 PM',
    startHour: 12.0,
    endHour: 13.0,
    room: 'P216',
    notes: 'IPT2 (Integrative Programming & Technologies)',
    dayKey: 'tue',
  },
  {
    id: 'ps-tue-5',
    timeMarker: '12:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '1:00 PM',
    endTime: '2:00 PM',
    timeRange: '12:00 pm to 1:00 PM',
    startHour: 13.0,
    endHour: 14.0,
    room: 'RB412',
    notes: 'THEN102 Ethics & Contemporary Issues',
    dayKey: 'tue',
  },
  {
    id: 'ps-tue-6',
    timeMarker: '12:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    timeRange: '12:00 pm to 1:00 PM',
    startHour: 14.0,
    endHour: 15.0,
    room: 'Library 3F',
    notes: 'Capstone Group Sprint Meeting',
    dayKey: 'tue',
  },
];

/**
 * Sunday Schedule (matches "Sunday, October 25,2026" in the date bar)
 */
const SUNDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-sun-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    timeRange: '8:00AM – 10:00AM',
    startHour: 8.0,
    endHour: 10.0,
    dayKey: 'sun',
    notes: 'Personal morning rest & planning',
  },
  {
    id: 'ps-sun-2',
    timeMarker: '10:00 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    timeRange: '10:00 to 12: 00PM',
    startHour: 10.0,
    endHour: 12.0,
    room: 'Chapel / Hall',
    notes: 'Sunday Service & Family Fellowship',
    dayKey: 'sun',
  },
  {
    id: 'ps-sun-3',
    timeMarker: '12:00 PM',
    title: 'Free',
    isBusy: false,
    startTime: '12:00 PM',
    endTime: '2:30 PM',
    timeRange: '12:00PM – 2:30PM',
    startHour: 12.0,
    endHour: 14.5,
    dayKey: 'sun',
    notes: 'Lunch & downtime with peers',
  },
  {
    id: 'ps-sun-4',
    timeMarker: '3:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    timeRange: '3:00 pm to 5:00 PM',
    startHour: 15.0,
    endHour: 17.0,
    room: 'Home / Online',
    notes: 'Weekly prep & assignment review',
    dayKey: 'sun',
  },
];

/**
 * Monday Schedule
 */
const MONDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-mon-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    timeRange: '8:00AM – 10:00AM',
    startHour: 8.0,
    endHour: 10.0,
    dayKey: 'mon',
  },
  {
    id: 'ps-mon-2',
    timeMarker: '10:00 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    timeRange: '10:00 to 12: 00PM',
    startHour: 10.0,
    endHour: 12.0,
    room: 'AL214',
    notes: 'Web Systems & Technologies',
    dayKey: 'mon',
  },
  {
    id: 'ps-mon-3',
    timeMarker: '12:00 PM',
    title: 'Free',
    isBusy: false,
    startTime: '12:00 PM',
    endTime: '2:00 PM',
    timeRange: '12:00PM – 2:00PM',
    startHour: 12.0,
    endHour: 14.0,
    dayKey: 'mon',
  },
  {
    id: 'ps-mon-4',
    timeMarker: '2:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    timeRange: '2:00 to 4: 00PM',
    startHour: 14.0,
    endHour: 16.0,
    room: 'P310',
    notes: 'Database Systems Lab',
    dayKey: 'mon',
  },
  {
    id: 'ps-mon-5',
    timeMarker: '4:00 PM',
    title: 'Free',
    isBusy: false,
    startTime: '4:00 PM',
    endTime: '6:00 PM',
    timeRange: '4:00PM – 6:00PM',
    startHour: 16.0,
    endHour: 18.0,
    dayKey: 'mon',
  },
];

/**
 * Wednesday Schedule
 */
const WEDNESDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-wed-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '9:30 AM',
    timeRange: '8:00AM – 9:30AM',
    startHour: 8.0,
    endHour: 9.5,
    dayKey: 'wed',
  },
  {
    id: 'ps-wed-2',
    timeMarker: '9:30 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '9:30 AM',
    endTime: '11:30 AM',
    timeRange: '9:30 to 11: 30AM',
    startHour: 9.5,
    endHour: 11.5,
    room: 'AL302',
    notes: 'Software Engineering Lecture',
    dayKey: 'wed',
  },
  {
    id: 'ps-wed-3',
    timeMarker: '11:30 AM',
    title: 'Free',
    isBusy: false,
    startTime: '11:30 AM',
    endTime: '1:30 PM',
    timeRange: '11:30AM – 1:30PM',
    startHour: 11.5,
    endHour: 13.5,
    dayKey: 'wed',
  },
  {
    id: 'ps-wed-4',
    timeMarker: '1:30 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '1:30 PM',
    endTime: '3:30 PM',
    timeRange: '1:30 to 3: 30PM',
    startHour: 13.5,
    endHour: 15.5,
    room: 'RB205',
    notes: 'Network Security Lab',
    dayKey: 'wed',
  },
];

/**
 * Thursday Schedule
 */
const THURSDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-thu-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '9:00 AM',
    timeRange: '8:00AM – 9:00AM',
    startHour: 8.0,
    endHour: 9.0,
    dayKey: 'thu',
  },
  {
    id: 'ps-thu-2',
    timeMarker: '9:00 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    timeRange: '9:00 to 10: 30AM',
    startHour: 9.0,
    endHour: 10.5,
    room: 'AL211A',
    notes: 'UI/UX Design Studio',
    dayKey: 'thu',
  },
  {
    id: 'ps-thu-3',
    timeMarker: '11:00 AM',
    title: 'Free',
    isBusy: false,
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    timeRange: '11:00AM – 12:00PM',
    startHour: 11.0,
    endHour: 12.0,
    dayKey: 'thu',
  },
  {
    id: 'ps-thu-4',
    timeMarker: '12:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '12:00 PM',
    endTime: '1:30 PM',
    timeRange: '12:00 to 1: 30PM',
    startHour: 12.0,
    endHour: 13.5,
    room: 'P216',
    notes: 'IPT2 (Integrative Programming)',
    dayKey: 'thu',
  },
  {
    id: 'ps-thu-5',
    timeMarker: '1:30 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '1:30 PM',
    endTime: '3:00 PM',
    timeRange: '1:30 to 3: 00PM',
    startHour: 13.5,
    endHour: 15.0,
    room: 'RB412',
    notes: 'THEN102 Ethics',
    dayKey: 'thu',
  },
];

/**
 * Friday Schedule
 */
const FRIDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-fri-1',
    timeMarker: '8:00AM',
    title: 'Free',
    isBusy: false,
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    timeRange: '8:00AM – 10:00AM',
    startHour: 8.0,
    endHour: 10.0,
    dayKey: 'fri',
  },
  {
    id: 'ps-fri-2',
    timeMarker: '10:00 AM',
    title: 'Busy',
    isBusy: true,
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    timeRange: '10:00 to 1: 00PM',
    startHour: 10.0,
    endHour: 13.0,
    room: 'Lab 4',
    notes: 'Systems Integration Project Lab',
    dayKey: 'fri',
  },
  {
    id: 'ps-fri-3',
    timeMarker: '1:00 PM',
    title: 'Free',
    isBusy: false,
    startTime: '1:00 PM',
    endTime: '5:00 PM',
    timeRange: '1:00PM – 5:00PM',
    startHour: 13.0,
    endHour: 17.0,
    dayKey: 'fri',
  },
];

/**
 * Saturday Schedule
 */
const SATURDAY_PERIODS: PersonalSchedulePeriod[] = [
  {
    id: 'ps-sat-1',
    timeMarker: '9:00 AM',
    title: 'Free',
    isBusy: false,
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    timeRange: '9:00AM – 12:00PM',
    startHour: 9.0,
    endHour: 12.0,
    dayKey: 'sat',
  },
  {
    id: 'ps-sat-2',
    timeMarker: '1:00 PM',
    title: 'Busy',
    isBusy: true,
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    timeRange: '1:00 to 3: 00PM',
    startHour: 13.0,
    endHour: 15.0,
    room: 'Gym / Field',
    notes: 'University Badminton Tournament',
    dayKey: 'sat',
  },
  {
    id: 'ps-sat-3',
    timeMarker: '3:00 PM',
    title: 'Free',
    isBusy: false,
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    timeRange: '3:00PM – 6:00PM',
    startHour: 15.0,
    endHour: 18.0,
    dayKey: 'sat',
  },
];

/**
 * All 7 days matching the Figma mockup top weekday bar:
 * Mon 19 | Tue 19 | Wed 21 | Thurs 22 | Fri 23 | Sat 24 | Sun 25
 */
export const DEFAULT_PERSONAL_SCHEDULE_DAYS: PersonalScheduleDay[] = [
  {
    dayKey: 'mon',
    dayShort: 'Mon',
    dayDate: '19',
    fullDateString: 'Monday, October 19, 2026',
    periods: MONDAY_PERIODS,
  },
  {
    dayKey: 'tue',
    dayShort: 'Tue',
    dayDate: '19', // Matches exact Figma wireframe label "Tue 19"
    fullDateString: 'Tuesday, October 20, 2026',
    periods: TUESDAY_PERIODS,
  },
  {
    dayKey: 'wed',
    dayShort: 'Wed',
    dayDate: '21',
    fullDateString: 'Wednesday, October 21, 2026',
    periods: WEDNESDAY_PERIODS,
  },
  {
    dayKey: 'thu',
    dayShort: 'Thurs',
    dayDate: '22',
    fullDateString: 'Thursday, October 22, 2026',
    periods: THURSDAY_PERIODS,
  },
  {
    dayKey: 'fri',
    dayShort: 'Fri',
    dayDate: '23',
    fullDateString: 'Friday, October 23, 2026',
    periods: FRIDAY_PERIODS,
  },
  {
    dayKey: 'sat',
    dayShort: 'Sat',
    dayDate: '24',
    fullDateString: 'Saturday, October 24, 2026',
    periods: SATURDAY_PERIODS,
  },
  {
    dayKey: 'sun',
    dayShort: 'Sun',
    dayDate: '25',
    fullDateString: 'Sunday, October 25,2026', // Matches exact Figma reference string
    periods: SUNDAY_PERIODS,
  },
];

export function getInitialPersonalScheduleDays(): PersonalScheduleDay[] {
  // Deep clone to allow in-memory editing without mutating module exports
  return JSON.parse(JSON.stringify(DEFAULT_PERSONAL_SCHEDULE_DAYS));
}

/**
 * Standard slots matching Figma PS-04 wireframe screenshot:
 * 7AM Activity, 8AM Activity, 9AM Activity, 10AM Activity, 11AM Free, 12PM Free, 1PM Free, 2PM Activity
 */
const DEFAULT_WEEKLY_SLOTS: WeeklyScheduleSlot[] = [
  { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Morning Lecture / Review', room: 'AL201', notes: 'Prof. Gomez' },
  { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Core Subject Lecture', room: 'AL211A', notes: 'Design Principles' },
  { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Laboratory Session', room: 'P310', notes: 'Hands-on practice' },
  { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Major Subject Lecture', room: 'P216', notes: 'Integrative Tech' },
  { time: '11:00 AM', status: 'FREE', activityTitle: 'Open Study Window', notes: 'Library desk study' },
  { time: '12:00 PM', status: 'FREE', activityTitle: 'Campus Lunch Break', notes: 'Student Lounge' },
  { time: '1:00 PM', status: 'FREE', activityTitle: 'Afternoon Group Free Time', notes: 'Collaborative desk' },
  { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Capstone / Project Sprint', room: 'Library 3F', notes: 'Team meeting' },
];

/**
 * 7 Days of Weekly Schedule:
 * SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
 */
export const DEFAULT_WEEKLY_DAYS: WeeklyScheduleDay[] = [
  {
    dayKey: 'sun',
    dayName: 'SUNDAY',
    dateNumber: '25',
    fullDateString: 'Sunday, October 25, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Personal Devotion & Study', room: 'Home', notes: 'Quiet reading' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Morning Exercise', room: 'Campus Oval', notes: 'Light jogging' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Family Fellowship', notes: 'Weekly breakfast' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Sunday Worship Service', room: 'Chapel', notes: 'Community service' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Sunday Downtime', notes: 'Rest & recharge' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Sunday Fellowship Lunch', notes: 'Campus cafeteria' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Open Afternoon Free Time', notes: 'Free leisure' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Weekly Academic Prep', room: 'Study Hall', notes: 'Reviewing week syllabus' },
    ],
  },
  {
    dayKey: 'mon',
    dayName: 'MONDAY',
    dateNumber: '19',
    fullDateString: 'Monday, October 19, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Web Systems & Technologies', room: 'AL214', notes: 'Morning lecture' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Web Systems Lab', room: 'AL214', notes: 'Frontend development' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Database Systems Lab', room: 'P310', notes: 'SQL Queries practice' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Database Systems Lecture', room: 'P310', notes: 'Schema design' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Morning Free Slot', notes: 'Quiet study at 2F' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Lunch & Break', notes: 'Canteen' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Open Consultation Slot', notes: 'Free for office hours' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Operating Systems Review', room: 'AL302', notes: 'Kernel concepts' },
    ],
  },
  {
    dayKey: 'tue',
    dayName: 'TUESDAY',
    dateNumber: '20',
    fullDateString: 'Tuesday, October 20, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'UI/UX Design Studio Lecture', room: 'AL211A', notes: 'Heuristic evaluation' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'UI/UX Prototyping', room: 'AL211A', notes: 'Figma wireframing' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'IPT2 (Integrative Tech)', room: 'P216', notes: 'React Native architecture' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'IPT2 Lab Practice', room: 'P216', notes: 'Component testing' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Midday Free Window', notes: 'Reviewing lecture slides' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Peer Lunch Window', notes: 'Student commons' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Library Study Break', notes: 'Library 3F' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'THEN102 Ethics Lecture', room: 'RB412', notes: 'Contemporary ethics' },
    ],
  },
  {
    dayKey: 'wed',
    dayName: 'WEDNESDAY',
    dateNumber: '21',
    fullDateString: 'Wednesday, October 21, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Software Engineering Lecture', room: 'AL302', notes: 'Agile sprints' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Software Engineering Lab', room: 'AL302', notes: 'Scrum backlog grooming' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Network Security Principles', room: 'RB205', notes: 'Cryptography overview' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Network Security Lab', room: 'RB205', notes: 'Wireshark packet capture' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Open Campus Free Time', notes: 'Available for group study' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Lunch with Peers', notes: 'Courtside benches' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Personal Rest Period', notes: 'Reading lounge' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Academic Consultation', room: 'Faculty Rm 4', notes: 'Advising session' },
    ],
  },
  {
    dayKey: 'thu',
    dayName: 'THURSDAY',
    dateNumber: '22',
    fullDateString: 'Thursday, October 22, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'UI/UX Design Studio Review', room: 'AL211A', notes: 'Critique & revision' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'IPT2 Advanced Topics', room: 'P216', notes: 'State management' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'THEN102 Ethics Discussion', room: 'RB412', notes: 'Case studies' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Technical Writing Workshop', room: 'CL101', notes: 'Documentation' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Free Time Available', notes: 'No classes scheduled' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Noon Lunch Window', notes: 'Campus food court' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Library Study Block', notes: 'Library quiet zone' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Research Seminar', room: 'Auditorium', notes: 'Guest keynote' },
    ],
  },
  {
    dayKey: 'fri',
    dayName: 'FRIDAY',
    dateNumber: '23',
    fullDateString: 'Friday, October 23, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Systems Integration Project Lab', room: 'Lab 4', notes: 'API integration' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Systems Integration Sprint', room: 'Lab 4', notes: 'Team coding' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Data Communications', room: 'Lab 2', notes: 'Routing protocols' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Capstone Advising Session', room: 'Consultation Rm', notes: 'Project signoff' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Friday Free Window', notes: 'Weekend prep' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Friday Lunch Window', notes: 'Cafeteria with peers' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Afternoon Campus Free Time', notes: 'Outdoor pavilion' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Student Org General Assembly', room: 'Hall B', notes: 'CS Guild monthly' },
    ],
  },
  {
    dayKey: 'sat',
    dayName: 'SATURDAY',
    dateNumber: '24',
    fullDateString: 'Saturday, October 24, 2026',
    slots: [
      { time: '7:00 AM', status: 'ACTIVITY', activityTitle: 'Weekend Jogging & Fitness', room: 'Track Oval', notes: 'Cardio' },
      { time: '8:00 AM', status: 'ACTIVITY', activityTitle: 'Open Lab Hours', room: 'Lab 1', notes: 'Personal projects' },
      { time: '9:00 AM', status: 'ACTIVITY', activityTitle: 'Badminton Team Training', room: 'Gymnasium', notes: 'Inter-college cup' },
      { time: '10:00 AM', status: 'ACTIVITY', activityTitle: 'Badminton Scrimmage', room: 'Gymnasium', notes: 'Match prep' },
      { time: '11:00 AM', status: 'FREE', activityTitle: 'Post-Workout Downtime', notes: 'Rest & hydrate' },
      { time: '12:00 PM', status: 'FREE', activityTitle: 'Weekend Lunch Window', notes: 'Bistro' },
      { time: '1:00 PM', status: 'FREE', activityTitle: 'Personal Creative Free Time', notes: 'Drawing / coding' },
      { time: '2:00 PM', status: 'ACTIVITY', activityTitle: 'Weekly Summary & Study', room: 'Home Desk', notes: 'Goal tracking' },
    ],
  },
];

export const DEFAULT_WEEKLY_SCHEDULE_WEEKS: WeeklyScheduleWeek[] = [
  {
    weekId: 'week-1',
    weekRangeLabel: 'October 12 – 18, 2026',
    days: DEFAULT_WEEKLY_DAYS,
  },
  {
    weekId: 'week-2',
    weekRangeLabel: 'October 19 – 25, 2026', // Current / matches Figma wireframe
    days: DEFAULT_WEEKLY_DAYS,
  },
  {
    weekId: 'week-3',
    weekRangeLabel: 'October 26 – November 1, 2026',
    days: DEFAULT_WEEKLY_DAYS,
  },
  {
    weekId: 'week-4',
    weekRangeLabel: 'November 2 – 8, 2026',
    days: DEFAULT_WEEKLY_DAYS,
  },
];

export function getInitialWeeklyScheduleWeeks(): WeeklyScheduleWeek[] {
  return JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE_WEEKS));
}
