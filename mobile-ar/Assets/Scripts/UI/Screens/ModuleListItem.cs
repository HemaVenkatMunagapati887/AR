using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace ArSafety.UI.Screens
{
    public class ModuleListItem : MonoBehaviour
    {
        [SerializeField] private TMP_Text titleText;
        [SerializeField] private TMP_Text statusText;
        [SerializeField] private Button button;

        public void Bind(string title, string status, Action onClick)
        {
            titleText.text = title;
            statusText.text = status;
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(() => onClick());
        }
    }
}
