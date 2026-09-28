import { AnswerRecord, ModuleData, QuestionData } from '../types/models';

export interface AssessmentResult {
  gradedAnswers: AnswerRecord[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  mistakes: string[];
}

/**
 * On-device mirror of backend/src/utils/scoring.js so a worker can complete
 * training and assessment fully offline and still get an immediate,
 * server-consistent score; the same graded record is re-sent on sync and the
 * backend recomputes it as the source of truth.
 */
function isCorrect(question: QuestionData, selected: unknown): boolean {
  if (question.correctAnswer === undefined || question.correctAnswer === null) return false;
  return JSON.stringify(question.correctAnswer) === JSON.stringify(selected);
}

export function scoreAttempt(
  module: ModuleData,
  submittedAnswers: Record<string, number | number[] | null>
): AssessmentResult {
  let score = 0;
  let maxScore = 0;
  const mistakes: string[] = [];
  const gradedAnswers: AnswerRecord[] = [];

  for (const question of module.questions) {
    maxScore += question.points;
    const selected = Object.prototype.hasOwnProperty.call(submittedAnswers, question.questionId)
      ? submittedAnswers[question.questionId]
      : null;

    const correct = selected !== null && isCorrect(question, selected);
    if (correct) {
      score += question.points;
    } else {
      mistakes.push(question.questionId);
    }

    gradedAnswers.push({ questionId: question.questionId, selected, correct });
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= module.passThreshold;

  return { gradedAnswers, score, maxScore, percentage, passed, mistakes };
}
