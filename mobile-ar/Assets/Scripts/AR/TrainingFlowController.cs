using System;
using System.Collections.Generic;
using ArSafety.Assessment;
using ArSafety.Data;
using UnityEngine;

namespace ArSafety.AR
{
    /// <summary>
    /// Base state machine shared by every safety module. Concrete modules
    /// (FireModuleFlow, GasModuleFlow) only supply their own content and AR
    /// object placement — the phase sequence, hint suppression rule, and
    /// scoring pipeline live here once, so a new safety domain (e.g. Machinery)
    /// is a new subclass + Module JSON, not new engine code.
    /// </summary>
    public abstract class TrainingFlowController : MonoBehaviour
    {
        [SerializeField] protected ARObjectPlacer placer;
        [SerializeField] protected ARHintBubble hintBubble;

        public ARObjectPlacer Placer => placer;

        public ModuleData Module { get; private set; }
        public TrainingPhase CurrentPhase { get; private set; }
        public bool HintsAllowed => CurrentPhase == TrainingPhase.GuidedPractice;

        public event Action<TrainingPhase> OnPhaseChanged;
        public event Action<AssessmentResult> OnAssessmentComplete;
        public event Action<string, object> OnAnswerRecorded;

        private readonly Dictionary<string, object> assessmentAnswers = new Dictionary<string, object>();
        private System.Diagnostics.Stopwatch attemptTimer;

        public virtual void Begin(ModuleData module)
        {
            Module = module;
            assessmentAnswers.Clear();
            GoTo(TrainingPhase.Introduction);
        }

        public void GoTo(TrainingPhase phase)
        {
            CurrentPhase = phase;
            if (hintBubble != null && !HintsAllowed) hintBubble.Hide();

            switch (phase)
            {
                case TrainingPhase.Introduction: OnIntroduction(); break;
                case TrainingPhase.Learning: OnLearning(); break;
                case TrainingPhase.ArCalibration: OnArCalibration(); break;
                case TrainingPhase.GuidedPractice: OnGuidedPractice(); break;
                case TrainingPhase.IndependentPractice: OnIndependentPractice(); break;
                case TrainingPhase.Assessment: StartAssessment(); break;
                case TrainingPhase.Result: break; // handled by ResultScreen listening to OnAssessmentComplete
                case TrainingPhase.Certificate: break;
            }

            OnPhaseChanged?.Invoke(phase);
        }

        protected abstract void OnIntroduction();
        protected abstract void OnLearning();
        protected abstract void OnArCalibration();
        protected abstract void OnGuidedPractice();
        protected abstract void OnIndependentPractice();

        private void StartAssessment()
        {
            assessmentAnswers.Clear();
            attemptTimer = System.Diagnostics.Stopwatch.StartNew();
        }

        /// <summary>Called by AssessmentController / AR tap handlers as each question is answered.</summary>
        public void RecordAnswer(string questionId, object selected)
        {
            assessmentAnswers[questionId] = selected;
            OnAnswerRecorded?.Invoke(questionId, selected);
        }

        public void SubmitAssessment()
        {
            attemptTimer?.Stop();
            var result = AssessmentEngine.Score(Module, assessmentAnswers);

            var attempt = new AttemptRecord
            {
                clientAttemptId = Guid.NewGuid().ToString(),
                moduleId = Module.moduleId,
                answers = result.gradedAnswers,
                score = result.score,
                maxScore = result.maxScore,
                percentage = result.percentage,
                passed = result.passed,
                mistakes = result.mistakes,
                durationSeconds = attemptTimer != null ? (int)attemptTimer.Elapsed.TotalSeconds : 0,
                takenAtIso = DateTime.UtcNow.ToString("o"),
                pendingSync = true,
            };

            Core.LocalStorage.AppendAttempt(attempt);
            LastAttempt = attempt;

            // Try to sync immediately for a snappy certificate flow when online;
            // SyncManager's periodic loop is the fallback if this attempt is offline.
            if (Core.SyncManager.Instance != null && Core.SyncManager.Instance.IsOnline)
            {
                StartCoroutine(Core.SyncManager.Instance.TrySyncPending());
            }

            GoTo(TrainingPhase.Result);
            OnAssessmentComplete?.Invoke(result);
        }

        public AttemptRecord LastAttempt { get; private set; }
    }
}
