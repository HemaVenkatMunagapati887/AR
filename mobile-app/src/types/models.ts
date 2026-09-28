// Mirrors backend/src/models/*.js — keep field names identical so JSON from
// the API needs no remapping on the client.

export type LanguageCode = 'en' | 'hi' | 'sat';

export interface LocalizedString {
  en: string;
  hi?: string;
  sat?: string;
}

export function localize(str: LocalizedString | undefined, lang: LanguageCode): string {
  if (!str) return '';
  const value = lang === 'en' ? str.en : str[lang];
  return value && value.length > 0 ? value : str.en;
}

export type QuestionType = 'mcq' | 'scenario' | 'ordering' | 'ar_task';

export interface QuestionData {
  questionId: string;
  questionType: QuestionType;
  question: LocalizedString;
  options: LocalizedString[];
  explanation?: LocalizedString;
  points: number;
  // Present only in the offline bundle (see api/client.ts) — the online
  // training endpoint strips this so it's never sent over the wire at rest.
  correctAnswer?: number | number[];
}

export interface ModuleData {
  moduleId: string;
  name: LocalizedString;
  description: LocalizedString;
  category: string;
  sectors: string[];
  version: number;
  active: boolean;
  passThreshold: number;
  questions: QuestionData[];
}

export interface AnswerRecord {
  questionId: string;
  selected: number | number[] | null;
  correct: boolean;
}

export interface AttemptRecord {
  clientAttemptId: string;
  moduleId: string;
  answers: AnswerRecord[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  mistakes: string[];
  durationSeconds: number;
  takenAt: string;
  pendingSync: boolean;
  serverAttemptId?: string;
}

export interface CertificateRecord {
  certificateId: string;
  moduleId: string;
  percentage: number;
  status: 'VALID' | 'REVOKED';
  issuedAt: string;
  qrPayloadUrl: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  workerId: string;
  sector: string;
  language: LanguageCode;
  role: 'worker' | 'admin';
  authToken: string;
}
