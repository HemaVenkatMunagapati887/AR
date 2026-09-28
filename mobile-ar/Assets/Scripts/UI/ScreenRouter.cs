using System;
using System.Collections.Generic;
using UnityEngine;

namespace ArSafety.UI
{
    /// <summary>Single active-panel switcher for every screen listed in AppScreen.</summary>
    public class ScreenRouter : MonoBehaviour
    {
        public static ScreenRouter Instance { get; private set; }

        [Serializable]
        public struct ScreenBinding
        {
            public AppScreen screen;
            public GameObject panel;
        }

        [SerializeField] private List<ScreenBinding> bindings;

        public AppScreen Current { get; private set; }
        public event Action<AppScreen> OnScreenChanged;

        private Dictionary<AppScreen, GameObject> map;

        private void Awake()
        {
            Instance = this;
            map = new Dictionary<AppScreen, GameObject>();
            foreach (var b in bindings) map[b.screen] = b.panel;
        }

        public void Show(AppScreen screen)
        {
            foreach (var kv in map)
            {
                if (kv.Value != null) kv.Value.SetActive(kv.Key == screen);
            }
            Current = screen;
            OnScreenChanged?.Invoke(screen);
        }
    }
}
