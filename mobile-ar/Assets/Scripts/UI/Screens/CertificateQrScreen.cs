using System;
using System.Collections;
using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace ArSafety.UI.Screens
{
    /// <summary>
    /// Displays the QR image generated server-side (backend/src/utils/qr.js) —
    /// the QR payload is a verification URL keyed only by certificateId, with no
    /// worker PII embedded, per the certification requirements.
    /// </summary>
    public class CertificateQrScreen : MonoBehaviour
    {
        [SerializeField] private RawImage qrImage;
        [SerializeField] private TMP_Text pendingText;
        [SerializeField] private TMP_Text captionText;

        private void OnEnable() => StartCoroutine(LoadQr());

        private IEnumerator LoadQr()
        {
            qrImage.gameObject.SetActive(false);
            pendingText.gameObject.SetActive(false);

            var cert = GameSession.Instance.LastIssuedCertificate;
            var worker = GameSession.Instance.CurrentWorker;
            if (cert == null || worker == null) yield break;

            Newtonsoft.Json.Linq.JObject response = null;
            yield return ApiClient.Instance.GetCertificate(cert.certificateId, worker.authToken, (ok, json) => response = ok ? json : null);

            var dataUrl = response?["qrDataUrl"]?.ToString();
            if (string.IsNullOrEmpty(dataUrl))
            {
                pendingText.text = LocalizationManager.Instance.GetString("certificate_pending_sync");
                pendingText.gameObject.SetActive(true);
                yield break;
            }

            var base64 = dataUrl.Substring(dataUrl.IndexOf(",", StringComparison.Ordinal) + 1);
            var bytes = Convert.FromBase64String(base64);
            var texture = new Texture2D(2, 2);
            texture.LoadImage(bytes);

            qrImage.texture = texture;
            qrImage.gameObject.SetActive(true);
            captionText.text = LocalizationManager.Instance.GetString("scan_to_verify");
        }
    }
}
