export interface OcrExtractedEntry {
  id: string;
  activityName: string;
  date: string;
  time: string;
  room?: string;
  isBusy?: boolean;
}

export type OcrImportStep = 'upload' | 'processing' | 'review' | 'success' | 'error';

export type OcrConfirmationType = 'save' | 'discard' | null;

export interface OcrImageSample {
  id: string;
  title: string;
  subtitle: string;
  fileSize: string;
  dimensions: string;
  isErrorSample?: boolean;
  errorMessage?: string;
  entries: OcrExtractedEntry[];
}

export interface ScheduleFactCheckResult {
  isSchedule: boolean;
  confidence: number;
  detectedFeatures: string[];
  rejectionReason?: string;
  extractedEntries?: OcrExtractedEntry[];
}

export interface OcrScheduleImportScreenProps {
  onClose: () => void;
  onViewMySchedule: () => void;
  onBackToHome?: () => void;
  onImportSuccess?: (entries: OcrExtractedEntry[]) => void;
}
