import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { AttemptRecord, ModuleData } from '../types/models';
import { AssessmentResult, scoreAttempt } from '../assessment/assessmentEngine';
import * as LocalStore from '../storage/localStorage';
import { trySyncNow } from '../storage/syncManager';

// The mandatory pedagogical sequence from the PS brief:
// LEARN -> GUIDED PRACTICE -> INDEPENDENT PRACTICE -> ASSESSMENT -> CERTIFICATION.
export enum TrainingPhase {
  Introduction = 'Introduction',
  Learning = 'Learning',
  ArCalibration = 'ArCalibration',
  GuidedPractice = 'GuidedPractice',
  IndependentPractice = 'IndependentPractice',
  Assessment = 'Assessment',
  Result = 'Result',
  Certificate = 'Certificate',
}

interface TrainingFlowContextValue {
  module: ModuleData | null;
  phase: TrainingPhase;
  hintsAllowed: boolean;
  lastAttempt: AttemptRecord | null;
  lastResult: AssessmentResult | null;
  /** Question ids answered so far in the current Assessment pass — a React
   * state mirror of the answers ref, so screens can re-render when an AR tap
   * (not a UI button) records an answer. */
  answeredQuestionIds: Set<string>;
  begin: (module: ModuleData) => void;
  goToPhase: (phase: TrainingPhase) => void;
  recordAnswer: (questionId: string, selected: number | number[] | null) => void;
  isAnswered: (questionId: string) => boolean;
  submitAssessment: () => Promise<AssessmentResult>;
}

const TrainingFlowContext = createContext<TrainingFlowContextValue | undefined>(undefined);

export function TrainingFlowProvider({ children }: { children: React.ReactNode }) {
  const [module, setModule] = useState<ModuleData | null>(null);
  const [phase, setPhase] = useState<TrainingPhase>(TrainingPhase.Introduction);
  const [lastAttempt, setLastAttempt] = useState<AttemptRecord | null>(null);
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());

  const answersRef = useRef<Record<string, number | number[] | null>>({});
  const startTimeRef = useRef<number>(0);

  const begin = useCallback((m: ModuleData) => {
    setModule(m);
    answersRef.current = {};
    setAnsweredQuestionIds(new Set());
    setPhase(TrainingPhase.Introduction);
  }, []);

  const goToPhase = useCallback((p: TrainingPhase) => {
    if (p === TrainingPhase.Assessment) {
      answersRef.current = {};
      setAnsweredQuestionIds(new Set());
      startTimeRef.current = Date.now();
    }
    setPhase(p);
  }, []);

  const recordAnswer = useCallback((questionId: string, selected: number | number[] | null) => {
    answersRef.current[questionId] = selected;
    setAnsweredQuestionIds((prev) => new Set(prev).add(questionId));
  }, []);

  const isAnswered = useCallback((questionId: string) => {
    return Object.prototype.hasOwnProperty.call(answersRef.current, questionId);
  }, []);

  const submitAssessment = useCallback(async (): Promise<AssessmentResult> => {
    if (!module) throw new Error('submitAssessment called with no active module');

    const result = scoreAttempt(module, answersRef.current);
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const attempt: AttemptRecord = {
      clientAttemptId: uuidv4(),
      moduleId: module.moduleId,
      answers: result.gradedAnswers,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: result.passed,
      mistakes: result.mistakes,
      durationSeconds,
      takenAt: new Date().toISOString(),
      pendingSync: true,
    };

    await LocalStore.appendAttempt(attempt);
    setLastAttempt(attempt);
    setLastResult(result);
    setPhase(TrainingPhase.Result);

    // Best-effort immediate sync for a snappy certificate flow when online;
    // the periodic SyncManager loop is the fallback if this attempt is offline.
    trySyncNow().catch(() => {});

    return result;
  }, [module]);

  const hintsAllowed = phase === TrainingPhase.GuidedPractice;

  const value = useMemo(
    () => ({
      module,
      phase,
      hintsAllowed,
      lastAttempt,
      lastResult,
      answeredQuestionIds,
      begin,
      goToPhase,
      recordAnswer,
      isAnswered,
      submitAssessment,
    }),
    [module, phase, hintsAllowed, lastAttempt, lastResult, answeredQuestionIds, begin, goToPhase, recordAnswer, isAnswered, submitAssessment]
  );

  return <TrainingFlowContext.Provider value={value}>{children}</TrainingFlowContext.Provider>;
}

export function useTrainingFlow() {
  const ctx = useContext(TrainingFlowContext);
  if (!ctx) throw new Error('useTrainingFlow must be used within a TrainingFlowProvider');
  return ctx;
}
