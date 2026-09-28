using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using ArSafety.Data;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace ArSafety.Core
{
    /// <summary>
    /// Implements the offline-first contract from the SIH brief: local result
    /// first (pending_sync = true), then opportunistic POST to /api/sync/results
    /// when connectivity returns, with failed syncs simply retried later since
    /// the local record is never deleted until the server confirms it.
    /// </summary>
    public class SyncManager : MonoBehaviour
    {
        public static SyncManager Instance { get; private set; }

        public bool IsOnline { get; private set; }
        public int PendingCount { get; private set; }

        public event Action<bool> OnConnectivityChanged;
        public event Action<int> OnPendingCountChanged;

        private float checkInterval = 15f;
        private float timer;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            RefreshPendingCount();
            StartCoroutine(CheckConnectivityLoop());
        }

        private void RefreshPendingCount()
        {
            PendingCount = LocalStorage.LoadAttempts().Count(a => a.pendingSync);
            OnPendingCountChanged?.Invoke(PendingCount);
        }

        private IEnumerator CheckConnectivityLoop()
        {
            while (true)
            {
                if (Application.internetReachability == NetworkReachability.NotReachable)
                {
                    SetOnline(false);
                }
                else
                {
                    yield return ApiClient.Instance.CheckHealth(reachable => SetOnline(reachable));
                }

                if (IsOnline)
                {
                    yield return TrySyncPending();
                }

                yield return new WaitForSeconds(checkInterval);
            }
        }

        private void SetOnline(bool online)
        {
            if (online == IsOnline) return;
            IsOnline = online;
            OnConnectivityChanged?.Invoke(IsOnline);
        }

        public IEnumerator TrySyncPending()
        {
            var profile = LocalStorage.LoadProfile();
            if (profile == null || string.IsNullOrEmpty(profile.authToken)) yield break;

            var attempts = LocalStorage.LoadAttempts();
            var pending = attempts.Where(a => a.pendingSync).ToList();
            if (pending.Count == 0) yield break;

            bool done = false;
            JObject response = null;
            bool ok = false;

            yield return ApiClient.Instance.SyncResults(pending, profile.authToken, (success, json) =>
            {
                ok = success;
                response = json;
                done = true;
            });

            if (!done || !ok || response == null) yield break;

            var results = response["results"] as JArray;
            if (results != null)
            {
                foreach (var r in results)
                {
                    var clientId = r["clientAttemptId"]?.ToString();
                    var status = r["status"]?.ToString();
                    if (status == "accepted" || status == "duplicate")
                    {
                        var match = attempts.FirstOrDefault(a => a.clientAttemptId == clientId);
                        if (match != null)
                        {
                            match.pendingSync = false;
                            match.serverAttemptId = r["attemptId"]?.ToString();
                        }
                    }
                }
                LocalStorage.SaveAttempts(attempts);
                RefreshPendingCount();
            }
        }
    }
}
