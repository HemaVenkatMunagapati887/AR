using System.Collections;
using System.Collections.Generic;
using System.Linq;
using ArSafety.Core;
using ArSafety.Data;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI.Screens
{
    public class HomeScreen : MonoBehaviour
    {
        [SerializeField] private TMP_Text welcomeText;
        [SerializeField] private Transform moduleListContainer;
        [SerializeField] private ModuleListItem moduleItemPrefab;

        private void OnEnable() => StartCoroutine(Refresh());

        private IEnumerator Refresh()
        {
            var worker = GameSession.Instance.CurrentWorker;
            welcomeText.text = worker != null ? worker.name : "";

            List<ModuleData> modules = null;
            yield return GameSession.Instance.LoadModules(result => modules = result);

            foreach (Transform child in moduleListContainer) Destroy(child.gameObject);
            if (modules == null) yield break;

            var attempts = LocalStorage.LoadAttempts();

            foreach (var module in modules)
            {
                var passed = attempts.Any(a => a.moduleId == module.moduleId && a.passed);
                var statusKey = passed ? "completed_modules" : "pending_training";
                var item = Instantiate(moduleItemPrefab, moduleListContainer);
                var lang = LocalizationManager.Instance.CurrentLanguage;
                item.Bind(
                    module.name.Get(lang),
                    LocalizationManager.Instance.GetString(statusKey),
                    () => OpenModule(module.moduleId)
                );
            }
        }

        private void OpenModule(string moduleId)
        {
            StartCoroutine(OpenModuleRoutine(moduleId));
        }

        private IEnumerator OpenModuleRoutine(string moduleId)
        {
            ModuleData module = null;
            yield return GameSession.Instance.SelectModuleForTraining(moduleId, m => module = m);
            if (module != null)
            {
                ScreenRouter.Instance.Show(AppScreen.ModuleIntro);
            }
        }

        public void OpenHistory() => ScreenRouter.Instance.Show(AppScreen.History);
    }
}
