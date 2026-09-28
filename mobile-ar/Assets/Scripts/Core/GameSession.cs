using System;
using System.Collections;
using System.Collections.Generic;
using ArSafety.AR;
using ArSafety.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace ArSafety.Core
{
    /// <summary>
    /// Central app controller: owns the logged-in worker, the currently selected
    /// module, and the active TrainingFlowController. Screens call into this
    /// rather than talking to ApiClient/LocalStorage directly, so the offline
    /// vs. online decision lives in one place.
    /// </summary>
    public class GameSession : MonoBehaviour
    {
        public static GameSession Instance { get; private set; }

        [SerializeField] private FireModuleFlow fireModuleFlow;
        [SerializeField] private GasModuleFlow gasModuleFlow;

        public WorkerProfile CurrentWorker { get; private set; }
        public ModuleData SelectedModule { get; private set; }
        public TrainingFlowController ActiveFlow { get; private set; }
        public CertificateRecord LastIssuedCertificate { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public IEnumerator Login(string workerId, string password, Action<bool, string> onDone)
        {
            bool done = false;
            bool ok = false;
            JObject response = null;

            yield return ApiClient.Instance.Login(workerId, password, (success, json) =>
            {
                ok = success;
                response = json;
                done = true;
            });

            if (ok && response != null)
            {
                var profile = response["user"].ToObject<WorkerProfile>();
                profile.authToken = response["token"]?.ToString();
                CurrentWorker = profile;
                LocalStorage.SaveProfile(profile);
                onDone(true, null);
                yield break;
            }

            // Offline fallback: allow re-entry with a cached profile matching this
            // worker ID so training never depends on a live connection.
            var cached = LocalStorage.LoadProfile();
            if (cached != null && string.Equals(cached.workerId, workerId, StringComparison.OrdinalIgnoreCase))
            {
                CurrentWorker = cached;
                onDone(true, null);
                yield break;
            }

            var error = response?["error"]?.ToString() ?? "login_error";
            onDone(false, error);
        }

        public IEnumerator LoadModules(Action<List<ModuleData>> onDone)
        {
            var cached = LocalStorage.LoadAllModules();

            bool done = false;
            JObject response = null;
            yield return ApiClient.Instance.GetModules(CurrentWorker?.authToken, (success, json) =>
            {
                response = success ? json : null;
                done = true;
            });

            if (response != null && response["modules"] is JArray arr)
            {
                var modules = new List<ModuleData>();
                foreach (var item in arr)
                {
                    modules.Add(item.ToObject<ModuleData>());
                }
                onDone(modules);
                yield break;
            }

            // No network — serve whatever was cached from the last successful sync.
            onDone(cached);
        }

        public IEnumerator SelectModuleForTraining(string moduleId, Action<ModuleData> onDone)
        {
            // Prefer the offline bundle (includes correctAnswer for local scoring);
            // refresh it from the server when online so content stays current.
            var cached = LocalStorage.LoadModule(moduleId);

            bool done = false;
            JObject response = null;
            yield return ApiClient.Instance.GetModuleFull(moduleId, CurrentWorker?.authToken, (success, json) =>
            {
                response = success ? json : null;
                done = true;
            });

            ModuleData module = cached;
            if (response != null && response["module"] != null)
            {
                module = response["module"].ToObject<ModuleData>();
                LocalStorage.SaveModule(module);
            }

            SelectedModule = module;
            ActiveFlow = module?.moduleId == "gas-confined-space" ? (TrainingFlowController)gasModuleFlow : fireModuleFlow;
            onDone(module);
        }

        public IEnumerator IssueCertificateForLastAttempt(Action<CertificateRecord> onDone)
        {
            var attempt = ActiveFlow?.LastAttempt;
            if (attempt == null || !attempt.passed)
            {
                onDone(null);
                yield break;
            }

            if (string.IsNullOrEmpty(attempt.serverAttemptId))
            {
                // Not synced yet — certificate numbering is server-assigned to
                // guarantee uniqueness, so show a pending state until sync succeeds.
                onDone(null);
                yield break;
            }

            JObject response = null;
            yield return ApiClient.Instance.IssueCertificate(attempt.serverAttemptId, CurrentWorker.authToken, (success, json) =>
            {
                response = success ? json : null;
            });

            if (response?["certificate"] == null)
            {
                onDone(null);
                yield break;
            }

            var cert = response["certificate"].ToObject<CertificateRecord>();
            cert.qrReady = false;
            LocalStorage.AppendCertificate(cert);
            LastIssuedCertificate = cert;
            onDone(cert);
        }

        public void Logout()
        {
            LocalStorage.ClearProfile();
            CurrentWorker = null;
        }
    }
}
