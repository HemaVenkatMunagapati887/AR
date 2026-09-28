using System.Collections.Generic;
using ArSafety.Data;
using Newtonsoft.Json.Linq;

namespace ArSafety.Assessment
{
    public struct AssessmentResult
    {
        public List<AnswerRecord> gradedAnswers;
        public int score;
        public int maxScore;
        public int percentage;
        public bool passed;
        public List<string> mistakes;
    }

    /// <summary>
    /// On-device mirror of backend/src/utils/scoring.js so a worker can complete
    /// training and assessment fully offline and still get an immediate,
    /// server-consistent score; the same graded record is re-sent on sync and
    /// the backend recomputes it as the source of truth.
    /// </summary>
    public static class AssessmentEngine
    {
        public static AssessmentResult Score(ModuleData module, Dictionary<string, object> submittedAnswers)
        {
            int score = 0;
            int maxScore = 0;
            var mistakes = new List<string>();
            var graded = new List<AnswerRecord>();

            foreach (var question in module.questions)
            {
                maxScore += question.points;
                object selected = submittedAnswers.ContainsKey(question.questionId)
                    ? submittedAnswers[question.questionId]
                    : null;

                bool correct = selected != null && IsCorrect(question, selected);
                if (correct)
                {
                    score += question.points;
                }
                else
                {
                    mistakes.Add(question.questionId);
                }

                graded.Add(new AnswerRecord
                {
                    questionId = question.questionId,
                    selected = selected,
                    correct = correct,
                });
            }

            int percentage = maxScore > 0 ? (int)System.Math.Round(100.0 * score / maxScore) : 0;

            return new AssessmentResult
            {
                gradedAnswers = graded,
                score = score,
                maxScore = maxScore,
                percentage = percentage,
                passed = percentage >= module.passThreshold,
                mistakes = mistakes,
            };
        }

        private static bool IsCorrect(QuestionData question, object selected)
        {
            if (question.correctAnswer == null) return false;
            var expected = JToken.FromObject(question.correctAnswer);
            var actual = JToken.FromObject(selected);
            return JToken.DeepEquals(expected, actual);
        }
    }
}
