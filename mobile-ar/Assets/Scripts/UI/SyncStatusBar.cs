using ArSafety.Core;
using ArSafety.Localization;
using TMPro;
using UnityEngine;

namespace ArSafety.UI
{
    /// <summary>Persistent banner (screen 16: Offline/Sync status) shown across every worker screen.</summary>
    public class SyncStatusBar : MonoBehaviour
    {
        [SerializeField] private TMP_Text statusText;
        [SerializeField] private GameObject offlineIcon;

        private void Start()
        {
            var sync = SyncManager.Instance;
            sync.OnConnectivityChanged += HandleConnectivityChanged;
            sync.OnPendingCountChanged += HandlePendingChanged;
            HandleConnectivityChanged(sync.IsOnline);
            HandlePendingChanged(sync.PendingCount);
        }

        private void OnDestroy()
        {
            if (SyncManager.Instance == null) return;
            SyncManager.Instance.OnConnectivityChanged -= HandleConnectivityChanged;
            SyncManager.Instance.OnPendingCountChanged -= HandlePendingChanged;
        }

        private void HandleConnectivityChanged(bool online)
        {
            offlineIcon.SetActive(!online);
            statusText.text = LocalizationManager.Instance.GetString(online ? "sync_status_online" : "sync_status_offline");
        }

        private void HandlePendingChanged(int count)
        {
            if (count > 0)
            {
                statusText.text = LocalizationManager.Instance.Format("sync_pending_count", count);
            }
        }
    }
}
