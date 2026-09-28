using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class ModuleIntroScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text titleText;
        [SerializeField] private TMP_Text descriptionText;

        private void OnEnable()
        {
            var module = GameSession.Instance.SelectedModule;
            if (module == null) return;
            var lang = LocalizationManager.Instance.CurrentLanguage;
            titleText.text = module.name.Get(lang);
            descriptionText.text = module.description.Get(lang);
        }

        public void OnStartTraining()
        {
            GameSession.Instance.ActiveFlow.Begin(GameSession.Instance.SelectedModule);
            ScreenRouter.Instance.Show(AppScreen.LearningContent);
        }
    }
}
