using ArSafety.Core;
using ArSafety.Localization;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class HistoryScreen : MonoBehaviour
    {
        [SerializeField] private Transform listContainer;
        [SerializeField] private HistoryItem itemPrefab;
        [SerializeField] private GameObject emptyLabel;

        private void OnEnable()
        {
            foreach (Transform child in listContainer) Destroy(child.gameObject);

            var attempts = LocalStorage.LoadAttempts();
            emptyLabel.SetActive(attempts.Count == 0);

            var passedLabel = LocalizationManager.Instance.GetString("passed_label");
            var failedLabel = LocalizationManager.Instance.GetString("failed_label");
            var pendingLabel = LocalizationManager.Instance.GetString("sync_status_offline");

            for (int i = attempts.Count - 1; i >= 0; i--)
            {
                var a = attempts[i];
                var item = Instantiate(itemPrefab, listContainer);
                item.Bind(a.moduleId, a.percentage, a.passed, a.pendingSync, passedLabel, failedLabel, pendingLabel);
            }
        }
    }
}
