using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    /// <summary>PHASE 1 (Introduction) + PHASE 2 (concept teaching) from the brief — the
    /// worker must read this before any AR practice begins.</summary>
    public class LearningContentScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text slideText;
        [SerializeField] private TMP_Text progressText;

        private string[] slideKeys;
        private int index;

        private void OnEnable()
        {
            var moduleId = GameSession.Instance.SelectedModule?.moduleId;
            slideKeys = moduleId == "gas-confined-space"
                ? new[] { "gas_learn_slide_1", "gas_learn_slide_2", "gas_learn_slide_3" }
                : new[] { "fire_learn_slide_1", "fire_learn_slide_2", "fire_learn_slide_3" };
            index = 0;
            Render();
        }

        private void Render()
        {
            slideText.text = LocalizationManager.Instance.GetString(slideKeys[index]);
            progressText.text = $"{index + 1} / {slideKeys.Length}";
        }

        public void OnBack()
        {
            if (index > 0) { index--; Render(); }
        }

        public void OnNext()
        {
            if (index < slideKeys.Length - 1)
            {
                index++;
                Render();
            }
            else
            {
                GameSession.Instance.ActiveFlow.GoTo(AR.TrainingPhase.ArCalibration);
                ScreenRouter.Instance.Show(AppScreen.ArCalibration);
            }
        }
    }
}
