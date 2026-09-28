using System.Collections;
using ArSafety.Core;
using ArSafety.Localization;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class SplashScreen : MonoBehaviour
    {
        private void Start() => StartCoroutine(Boot());

        private IEnumerator Boot()
        {
            yield return LocalizationManager.Instance.LoadAll(null);

            var profile = LocalStorage.LoadProfile();
            if (profile != null && !string.IsNullOrEmpty(profile.authToken))
            {
                LocalizationManager.Instance.SetLanguage(profile.language);
                ScreenRouter.Instance.Show(AppScreen.Home);
            }
            else
            {
                ScreenRouter.Instance.Show(AppScreen.LanguageSelect);
            }
        }
    }
}
