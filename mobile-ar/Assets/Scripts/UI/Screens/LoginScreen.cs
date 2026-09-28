using System.Collections;
using ArSafety.Core;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class LoginScreen : MonoBehaviour
    {
        [SerializeField] private TMP_InputField workerIdField;
        [SerializeField] private TMP_InputField passwordField;
        [SerializeField] private TMP_Text errorText;
        [SerializeField] private GameObject loadingIndicator;

        public void OnLoginPressed() => StartCoroutine(DoLogin());

        private IEnumerator DoLogin()
        {
            errorText.gameObject.SetActive(false);
            loadingIndicator.SetActive(true);

            bool finished = false;
            bool ok = false;
            string error = null;

            yield return GameSession.Instance.Login(workerIdField.text, passwordField.text, (success, err) =>
            {
                ok = success;
                error = err;
                finished = true;
            });

            loadingIndicator.SetActive(false);
            if (ok)
            {
                ScreenRouter.Instance.Show(AppScreen.Home);
            }
            else
            {
                errorText.text = Localization.LocalizationManager.Instance.GetString("login_error");
                errorText.gameObject.SetActive(true);
            }
        }
    }
}
