using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class ArCalibrationScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text instructionText;
        [SerializeField] private GameObject continueButton;

        private void OnEnable()
        {
            instructionText.text = LocalizationManager.Instance.GetString("ar_calibration_instruction");
            continueButton.SetActive(false);
            var placer = GameSession.Instance.ActiveFlow.Placer;
            if (placer != null) placer.OnFirstPlaneDetected += HandlePlaneDetected;
        }

        private void OnDisable()
        {
            var placer = GameSession.Instance.ActiveFlow?.Placer;
            if (placer != null) placer.OnFirstPlaneDetected -= HandlePlaneDetected;
        }

        private void HandlePlaneDetected()
        {
            instructionText.text = LocalizationManager.Instance.GetString("surface_detected");
            continueButton.SetActive(true);
        }

        public void OnContinue()
        {
            GameSession.Instance.ActiveFlow.GoTo(AR.TrainingPhase.GuidedPractice);
            ScreenRouter.Instance.Show(AppScreen.ArTraining);
        }
    }
}
