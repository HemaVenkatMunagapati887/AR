using ArSafety.AR;
using ArSafety.Assessment;
using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    /// <summary>Hosts both GuidedPractice and IndependentPractice — same AR scene,
    /// hints simply stop appearing (TrainingFlowController.HintsAllowed) once the
    /// worker advances, matching the brief's "fewer hints" independent-practice rule.</summary>
    public class ArTrainingScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text phaseTitleText;
        [SerializeField] private TMP_Text instructionText;
        [SerializeField] private GameObject continueButton;
        [SerializeField] private AssessmentController assessmentController;

        private void OnEnable()
        {
            GameSession.Instance.ActiveFlow.OnPhaseChanged += HandlePhaseChanged;
            HandlePhaseChanged(TrainingPhase.GuidedPractice);
        }

        private void OnDisable()
        {
            if (GameSession.Instance.ActiveFlow != null)
            {
                GameSession.Instance.ActiveFlow.OnPhaseChanged -= HandlePhaseChanged;
            }
        }

        private void HandlePhaseChanged(TrainingPhase phase)
        {
            switch (phase)
            {
                case TrainingPhase.GuidedPractice:
                    phaseTitleText.text = LocalizationManager.Instance.GetString("guided_practice_title");
                    instructionText.text = LocalizationManager.Instance.GetString("tap_to_place");
                    continueButton.SetActive(true);
                    break;
                case TrainingPhase.IndependentPractice:
                    phaseTitleText.text = LocalizationManager.Instance.GetString("independent_practice_title");
                    instructionText.text = "";
                    continueButton.SetActive(true);
                    break;
                case TrainingPhase.Assessment:
                    phaseTitleText.text = LocalizationManager.Instance.GetString("assessment_title");
                    continueButton.SetActive(false);
                    ScreenRouter.Instance.Show(AppScreen.Assessment);
                    assessmentController.BeginAssessment(GameSession.Instance.SelectedModule);
                    break;
            }
        }

        public void OnContinuePressed()
        {
            var flow = GameSession.Instance.ActiveFlow;
            if (flow.CurrentPhase == TrainingPhase.GuidedPractice)
            {
                flow.GoTo(TrainingPhase.IndependentPractice);
            }
            else if (flow.CurrentPhase == TrainingPhase.IndependentPractice)
            {
                flow.GoTo(TrainingPhase.Assessment);
            }
        }
    }
}
