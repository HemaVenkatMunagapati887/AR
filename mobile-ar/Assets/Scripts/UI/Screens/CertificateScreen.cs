using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class CertificateScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text workerNameText;
        [SerializeField] private TMP_Text moduleNameText;
        [SerializeField] private TMP_Text scoreText;
        [SerializeField] private TMP_Text dateText;
        [SerializeField] private TMP_Text certificateIdText;

        private void OnEnable()
        {
            var cert = GameSession.Instance.LastIssuedCertificate;
            var worker = GameSession.Instance.CurrentWorker;
            var module = GameSession.Instance.SelectedModule;
            if (cert == null) return;

            workerNameText.text = worker?.name;
            moduleNameText.text = module?.name.Get(LocalizationManager.Instance.CurrentLanguage);
            scoreText.text = $"{cert.percentage}%";
            dateText.text = System.DateTime.TryParse(cert.issuedAtIso, out var d) ? d.ToShortDateString() : cert.issuedAtIso;
            certificateIdText.text = cert.certificateId;
        }

        public void OnViewQr() => ScreenRouter.Instance.Show(AppScreen.CertificateQr);
    }
}
