using ArSafety.Localization;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class LanguageSelectScreen : MonoBehaviour
    {
        [SerializeField] private GameObject santaliDraftBanner;

        public void SelectEnglish() => Select("en");
        public void SelectHindi() => Select("hi");
        public void SelectSantali() => Select("sat");

        private void Select(string lang)
        {
            LocalizationManager.Instance.SetLanguage(lang);
            if (santaliDraftBanner != null)
            {
                santaliDraftBanner.SetActive(LocalizationManager.Instance.IsDraftLanguage(lang));
            }
            ScreenRouter.Instance.Show(AppScreen.Login);
        }
    }
}
