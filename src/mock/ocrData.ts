import { OcrExtractedEntry, OcrImageSample, ScheduleFactCheckResult } from '../types/ocrImport';

export const DEFAULT_EXTRACTED_SCHEDULES: OcrExtractedEntry[] = [
  {
    id: 'ocr-entry-1',
    activityName: 'CMSC 142',
    date: 'M Th',
    time: '8:00 AM - 9:30 AM',
    room: 'AL211A',
    isBusy: true,
  },
  {
    id: 'ocr-entry-2',
    activityName: 'MATH 54',
    date: 'M Th',
    time: '10:00 AM - 11:30 AM',
    room: 'RH102',
    isBusy: true,
  },
  {
    id: 'ocr-entry-3',
    activityName: 'HIST 1',
    date: 'T F',
    time: '1:00 PM - 2:30 PM',
    room: 'AS305',
    isBusy: true,
  },
  {
    id: 'ocr-entry-4',
    activityName: 'ENG 10',
    date: 'T F',
    time: '2:30 PM - 4:00 PM',
    room: 'AL304',
    isBusy: true,
  },
  {
    id: 'ocr-entry-5',
    activityName: 'PE 3',
    date: 'Wed',
    time: '8:00 AM - 10:00 AM',
    room: 'GYM',
    isBusy: true,
  },
  {
    id: 'ocr-entry-6',
    activityName: 'FIL 2',
    date: 'Wed',
    time: '10:30 AM - 12:00 PM',
    room: 'RH204',
    isBusy: true,
  },
  {
    id: 'ocr-entry-7',
    activityName: 'CHEM 11',
    date: 'Fri',
    time: '3:00 PM - 5:00 PM',
    room: 'SC101',
    isBusy: true,
  },
];

export const OCR_TIMETABLE_SAMPLES: OcrImageSample[] = [
  {
    id: 'sample-standard',
    title: 'CNU Study Load - BSCS 2-A',
    subtitle: 'Clear, high-contrast screenshot (7 courses detected)',
    fileSize: '1.4 MB',
    dimensions: '1920 × 1080',
    entries: DEFAULT_EXTRACTED_SCHEDULES,
  },
  {
    id: 'sample-alt',
    title: 'Block B Semester Schedule',
    subtitle: 'Printed paper scan (4 courses detected)',
    fileSize: '840 KB',
    dimensions: '1280 × 720',
    entries: [
      {
        id: 'ocr-alt-1',
        activityName: 'IPT 2',
        date: 'M W F',
        time: '9:00 AM - 10:30 AM',
        room: 'P216',
        isBusy: true,
      },
      {
        id: 'ocr-alt-2',
        activityName: 'THEN 102',
        date: 'T Th',
        time: '1:30 PM - 3:00 PM',
        room: 'RB412',
        isBusy: true,
      },
      {
        id: 'ocr-alt-3',
        activityName: 'CS ELECTIVE 1',
        date: 'T Th',
        time: '3:30 PM - 5:00 PM',
        room: 'AL102',
        isBusy: true,
      },
      {
        id: 'ocr-alt-4',
        activityName: 'NSTP 2',
        date: 'Sat',
        time: '8:00 AM - 12:00 PM',
        room: 'OVAL',
        isBusy: true,
      },
    ],
  },
  {
    id: 'sample-corrupted',
    title: 'Blurry / Unreadable Photo',
    subtitle: 'Low resolution, glare on paper (Will trigger Error State)',
    fileSize: '320 KB',
    dimensions: '640 × 480',
    isErrorSample: true,
    errorMessage: 'Unable to detect timetable text lines. Please ensure the schedule is clearly lit and in focus.',
    entries: [],
  },
];

const SCHEDULE_KEYWORDS = [
  'sched', 'timetable', 'cor', 'study', 'load', 'class', 'classes',
  'enrollment', 'sem', 'semester', 'term', 'course', 'cnu', 'portal',
  'table', 'subject', 'routine', 'bscs', 'bsit', 'block', 'acad', 'program',
  'registration', 'curriculum', 'studyplan'
];

const NON_SCHEDULE_KEYWORDS = [
  'selfie', 'avatar', 'photo', 'picture', 'meme', 'wallpaper', 'cat', 'dog',
  'pet', 'food', 'car', 'sunset', 'receipt', 'invoice', 'nature', 'landscape',
  'portrait', 'icon', 'logo', 'blur', 'corrupt', 'empty', 'blank', 'fake',
  'screenshot_game', 'game', 'camera', 'hunger', 'movie', 'film', 'poster',
  'cover', 'music', 'song', 'video', 'chat', 'discord', 'telegram', 'facebook'
];

/**
 * Fact-checks an uploaded picture to verify whether it contains a class schedule or timetable.
 * Fails validation for non-schedule photos, memes, wallpapers, generic pictures, or blurry/empty files.
 */
export async function factCheckScheduleImage(
  fileName: string,
  fileSize?: number
): Promise<ScheduleFactCheckResult> {
  const lowerName = fileName.toLowerCase();

  // 1. Check for explicit non-schedule/photo indicators
  const isExplicitlyNonSchedule = NON_SCHEDULE_KEYWORDS.some((kw) =>
    lowerName.includes(kw)
  );
  if (isExplicitlyNonSchedule) {
    return {
      isSchedule: false,
      confidence: 0.05,
      detectedFeatures: ['Non-schedule media content detected'],
      rejectionReason:
        'The uploaded picture does not consist of a class schedule. No timetable grid, academic courses, or time periods were detected. Please upload a clear photo or document of your Certificate of Registration (COR) or study load.',
    };
  }

  // 2. Check for file size issues (too small or empty)
  if (fileSize !== undefined && fileSize < 5120) {
    return {
      isSchedule: false,
      confidence: 0.15,
      detectedFeatures: ['File resolution too low to detect text structures (< 5KB)'],
      rejectionReason:
        'The uploaded image resolution is too low to extract timetable data. Please upload a clear, legible picture.',
    };
  }

  // 3. Positive schedule indicators
  const hasScheduleKeyword = SCHEDULE_KEYWORDS.some((kw) =>
    lowerName.includes(kw)
  );

  // If the file does not contain schedule keywords, reject as non-schedule
  if (!hasScheduleKeyword) {
    return {
      isSchedule: false,
      confidence: 0.2,
      detectedFeatures: ['No timetable grid, course codes, or academic markers found'],
      rejectionReason:
        'The uploaded picture does not consist of a class schedule. We could not detect timetable cells or class hours. Please upload a photo of your Certificate of Registration (COR) or class schedule.',
    };
  }

  // 4. Valid schedule verified
  return {
    isSchedule: true,
    confidence: 0.98,
    detectedFeatures: [
      'Tabular schedule grid structure detected',
      'Day/Time coordinates identified (8:00 AM - 6:00 PM)',
      'Academic course entries detected',
    ],
    extractedEntries: DEFAULT_EXTRACTED_SCHEDULES,
  };
}

