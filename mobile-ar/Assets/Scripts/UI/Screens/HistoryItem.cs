using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class HistoryItem : MonoBehaviour
    {
        [SerializeField] private TMP_Text moduleText;
        [SerializeField] private TMP_Text scoreText;
        [SerializeField] private TMP_Text statusText;
        [SerializeField] private TMP_Text syncText;

        public void Bind(string moduleId, int percentage, bool passed, bool pendingSync, string passedLabel, string failedLabel, string pendingLabel)
        {
            moduleText.text = moduleId;
            scoreText.text = $"{percentage}%";
            statusText.text = passed ? passedLabel : failedLabel;
            syncText.gameObject.SetActive(pendingSync);
            if (pendingSync) syncText.text = pendingLabel;
        }
    }
}
