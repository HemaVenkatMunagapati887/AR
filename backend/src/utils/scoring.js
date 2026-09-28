/**
 * Reusable assessment scoring engine — works for any module's question set
 * (mcq / scenario / ordering / ar_task) as long as answers compare equal
 * to correctAnswer via JSON deep-equality. Keeps per-module logic out of
 * the controller so new safety domains only need new Module + Question data.
 */
function isAnswerCorrect(question, selected) {
  return JSON.stringify(question.correctAnswer) === JSON.stringify(selected);
}

function scoreAttempt(moduleDoc, submittedAnswers) {
  const answersByQuestion = new Map(submittedAnswers.map((a) => [a.questionId, a.selected]));

  let score = 0;
  let maxScore = 0;
  const mistakes = [];
  const gradedAnswers = [];

  for (const question of moduleDoc.questions) {
    maxScore += question.points;
    const selected = answersByQuestion.has(question.questionId)
      ? answersByQuestion.get(question.questionId)
      : null;
    const correct = selected !== null && isAnswerCorrect(question, selected);

    if (correct) {
      score += question.points;
    } else {
      mistakes.push(question.questionId);
    }

    gradedAnswers.push({ questionId: question.questionId, selected, correct });
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= moduleDoc.passThreshold;

  return { gradedAnswers, score, maxScore, percentage, passed, mistakes };
}

module.exports = { scoreAttempt, isAnswerCorrect };
