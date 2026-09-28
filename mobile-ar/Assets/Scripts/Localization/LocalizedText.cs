using TMPro;
using UnityEngine;

namespace ArSafety.Localization
{
    /// <summary>Attach next to a TMP_Text; keeps it in sync with the active language.</summary>
    [RequireComponent(typeof(TMP_Text))]
    public class LocalizedText : MonoBehaviour
    {
        [SerializeField] private string key;
        private TMP_Text label;

        public string Key
        {
            get => key;
            set { key = value; Refresh(); }
        }

        private void Awake() => label = GetComponent<TMP_Text>();

        private void OnEnable()
        {
            Refresh();
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged += HandleLanguageChanged;
            }
        }

        private void OnDisable()
        {
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged -= HandleLanguageChanged;
            }
        }

        private void HandleLanguageChanged(string lang) => Refresh();

        private void Refresh()
        {
            if (label == null) label = GetComponent<TMP_Text>();
            if (LocalizationManager.Instance != null && !string.IsNullOrEmpty(key))
            {
                label.text = LocalizationManager.Instance.GetString(key);
            }
        }
    }
}
