using System.Collections;
using ArSafety.Assessment;
using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class ResultScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text scoreText;
        [SerializeField] private TMP_Text statusText;
        [SerializeField] private TMP_Text recommendationText;
        [SerializeField] private GameObject getCertificateButton;
        [SerializeField] private GameObject certificatePendingLabel;

        private void OnEnable()
        {
            GameSession.Instance.ActiveFlow.OnAssessmentComplete += HandleResult;
        }

        private void OnDisable()
        {
            if (GameSession.Instance.ActiveFlow != null)
            {
                GameSession.Instance.ActiveFlow.OnAssessmentComplete -= HandleResult;
            }
        }

        private void HandleResult(AssessmentResult result)
        {
            scoreText.text = LocalizationManager.Instance.Format("score_label") + $": {result.score}/{result.maxScore} ({result.percentage}%)";
            statusText.text = LocalizationManager.Instance.GetString(result.passed ? "passed_label" : "failed_label");
            recommendationText.gameObject.SetActive(!result.passed);
            if (!result.passed)
            {
                recommendationText.text = LocalizationManager.Instance.GetString("retrain_recommendation");
            }
            getCertificateButton.SetActive(result.passed);
            certificatePendingLabel.SetActive(false);
        }

        public void OnGetCertificate() => StartCoroutine(TryIssue());

        private IEnumerator TryIssue()
        {
            certificatePendingLabel.SetActive(true);
            getCertificateButton.SetActive(false);

            // The attempt may still be mid-sync (SyncManager runs opportunistically);
            // retry briefly rather than failing outright.
            for (int attempt = 0; attempt < 5; attempt++)
            {
                CertificateRecordResult result = default;
                yield return IssueOnce(r => result = r);
                if (result.certificate != null)
                {
                    ScreenRouter.Instance.Show(AppScreen.Certificate);
                    yield break;
                }
                yield return new WaitForSeconds(2f);
            }

            certificatePendingLabel.SetActive(true);
            certificatePendingLabel.GetComponent<TMP_Text>().text =
                LocalizationManager.Instance.GetString("certificate_pending_sync");
        }

        private struct CertificateRecordResult
        {
            public Data.CertificateRecord certificate;
        }

        private IEnumerator IssueOnce(System.Action<CertificateRecordResult> onDone)
        {
            Data.CertificateRecord cert = null;
            yield return GameSession.Instance.IssueCertificateForLastAttempt(c => cert = c);
            onDone(new CertificateRecordResult { certificate = cert });
        }
    }
}
