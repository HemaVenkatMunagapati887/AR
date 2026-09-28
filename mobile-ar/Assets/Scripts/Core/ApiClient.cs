using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using ArSafety.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.Networking;

namespace ArSafety.Core
{
    /// <summary>
    /// Thin UnityWebRequest wrapper over the Node/Express backend
    /// (see backend/src/app.js for the matching route table). Every call is a
    /// coroutine so screens can run it with StartCoroutine and never block the
    /// main thread; every call is also optional — the app must work with the
    /// server unreachable, which is why AssessmentEngine/LocalStorage exist.
    /// </summary>
    public class ApiClient : MonoBehaviour
    {
        public static ApiClient Instance { get; private set; }

        [SerializeField] private string baseUrl = "http://10.0.2.2:5000/api"; // 10.0.2.2 = host machine from Android emulator

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void SetBaseUrl(string url) => baseUrl = url;

        private UnityWebRequest BuildRequest(string method, string path, object body, string token)
        {
            var req = new UnityWebRequest(baseUrl + path, method);
            if (body != null)
            {
                var json = JsonConvert.SerializeObject(body);
                req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
                req.SetRequestHeader("Content-Type", "application/json");
            }
            req.downloadHandler = new DownloadHandlerBuffer();
            if (!string.IsNullOrEmpty(token))
            {
                req.SetRequestHeader("Authorization", "Bearer " + token);
            }
            return req;
        }

        public IEnumerator Login(string workerId, string password, Action<bool, JObject> onDone)
        {
            var body = new Dictionary<string, string> { { "workerId", workerId }, { "password", password } };
            using var req = BuildRequest("POST", "/auth/login", body, null);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator GetModules(string token, Action<bool, JObject> onDone)
        {
            using var req = BuildRequest("GET", "/modules", null, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator GetModuleFull(string moduleId, string token, Action<bool, JObject> onDone)
        {
            using var req = BuildRequest("GET", "/modules/" + moduleId, null, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator SubmitAttempt(AttemptRecord attempt, string token, Action<bool, JObject> onDone)
        {
            var body = new Dictionary<string, object>
            {
                { "moduleId", attempt.moduleId },
                { "clientAttemptId", attempt.clientAttemptId },
                { "durationSeconds", attempt.durationSeconds },
                { "answers", attempt.answers },
            };
            using var req = BuildRequest("POST", "/attempts", body, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator SyncResults(List<AttemptRecord> attempts, string token, Action<bool, JObject> onDone)
        {
            var body = new Dictionary<string, object> { { "attempts", attempts } };
            using var req = BuildRequest("POST", "/sync/results", body, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator IssueCertificate(string attemptId, string token, Action<bool, JObject> onDone)
        {
            var body = new Dictionary<string, string> { { "attemptId", attemptId } };
            using var req = BuildRequest("POST", "/certificates", body, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator GetCertificate(string certificateId, string token, Action<bool, JObject> onDone)
        {
            using var req = BuildRequest("GET", "/certificates/" + certificateId, null, token);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator VerifyCertificate(string certificateId, Action<bool, JObject> onDone)
        {
            using var req = BuildRequest("GET", "/certificates/verify/" + certificateId, null, null);
            yield return req.SendWebRequest();
            HandleJsonResponse(req, onDone);
        }

        public IEnumerator CheckHealth(Action<bool> onDone)
        {
            using var req = BuildRequest("GET", "/health", null, null);
            req.timeout = 4;
            yield return req.SendWebRequest();
            onDone(req.result == UnityWebRequest.Result.Success);
        }

        private void HandleJsonResponse(UnityWebRequest req, Action<bool, JObject> onDone)
        {
            bool ok = req.result == UnityWebRequest.Result.Success;
            JObject json = null;
            try
            {
                if (!string.IsNullOrEmpty(req.downloadHandler?.text))
                {
                    json = JObject.Parse(req.downloadHandler.text);
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning("[ApiClient] Failed to parse response JSON: " + e.Message);
            }
            onDone(ok, json);
        }
    }
}
