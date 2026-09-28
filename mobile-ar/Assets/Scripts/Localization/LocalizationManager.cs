using System;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;
using UnityEngine.Networking;

namespace ArSafety.Localization
{
    /// <summary>
    /// Loads en/hi/sat UI-string tables from StreamingAssets (bundled with the
    /// APK, so language switching needs no network) and exposes GetString(key).
    /// Keeping strings in JSON rather than hardcoded in scripts is what lets a
    /// fourth language be added later without touching any screen's code.
    /// </summary>
    public class LocalizationManager : MonoBehaviour
    {
        public static LocalizationManager Instance { get; private set; }

        public const string DefaultLanguage = "en";
        public static readonly string[] SupportedLanguages = { "en", "hi", "sat" };

        public string CurrentLanguage { get; private set; } = DefaultLanguage;
        public event Action<string> OnLanguageChanged;

        private Dictionary<string, Dictionary<string, string>> tables = new Dictionary<string, Dictionary<string, string>>();
        private bool loaded;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public IEnumerator LoadAll(Action onComplete)
        {
            foreach (var lang in SupportedLanguages)
            {
                yield return LoadLanguageFile(lang);
            }
            loaded = true;
            CurrentLanguage = PlayerPrefs.GetString("selected_language", DefaultLanguage);
            onComplete?.Invoke();
        }

        private IEnumerator LoadLanguageFile(string lang)
        {
            string path = System.IO.Path.Combine(Application.streamingAssetsPath, "Localization", lang + ".json");
            string json;

            if (path.Contains("://") || path.Contains(":///"))
            {
                using var req = UnityWebRequest.Get(path);
                yield return req.SendWebRequest();
                json = req.result == UnityWebRequest.Result.Success ? req.downloadHandler.text : "{}";
            }
            else
            {
                json = System.IO.File.Exists(path) ? System.IO.File.ReadAllText(path) : "{}";
            }

            try
            {
                var dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(json) ?? new Dictionary<string, string>();
                tables[lang] = dict;
            }
            catch (Exception e)
            {
                Debug.LogError($"[Localization] Failed to parse {lang}.json: {e.Message}");
                tables[lang] = new Dictionary<string, string>();
            }
        }

        public void SetLanguage(string lang)
        {
            if (Array.IndexOf(SupportedLanguages, lang) < 0) lang = DefaultLanguage;
            CurrentLanguage = lang;
            PlayerPrefs.SetString("selected_language", lang);
            OnLanguageChanged?.Invoke(lang);
        }

        public string GetString(string key)
        {
            if (!loaded) return key;

            if (tables.TryGetValue(CurrentLanguage, out var table) && table.TryGetValue(key, out var value) && !string.IsNullOrEmpty(value))
            {
                return value;
            }

            // Fall back to English so a missing or not-yet-reviewed Santali
            // string never shows a raw key to the worker.
            if (tables.TryGetValue(DefaultLanguage, out var enTable) && enTable.TryGetValue(key, out var enValue))
            {
                return enValue;
            }

            return key;
        }

        public string Format(string key, params object[] args) => string.Format(GetString(key), args);

        public bool IsDraftLanguage(string lang) => lang == "sat";
    }
}
