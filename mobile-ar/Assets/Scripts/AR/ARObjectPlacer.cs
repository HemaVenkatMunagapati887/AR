using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace ArSafety.AR
{
    /// <summary>
    /// Minimal AR Foundation plane-detection + tap-to-place used by both safety
    /// modules: real camera feed, real surface detection, real placed objects —
    /// per the PS requirement this must not be a fake animated screen.
    /// </summary>
    [RequireComponent(typeof(ARRaycastManager))]
    public class ARObjectPlacer : MonoBehaviour
    {
        [SerializeField] private ARPlaneManager planeManager;
        [SerializeField] private ARRaycastManager raycastManager;

        public event Action OnFirstPlaneDetected;
        public event Action<Vector3, Quaternion> OnSurfaceTapped;

        private static readonly List<ARRaycastHit> hits = new List<ARRaycastHit>();
        private bool firstPlaneReported;

        private void Awake()
        {
            if (raycastManager == null) raycastManager = GetComponent<ARRaycastManager>();
            if (planeManager == null) planeManager = GetComponent<ARPlaneManager>();
        }

        private void OnEnable()
        {
            if (planeManager != null) planeManager.planesChanged += HandlePlanesChanged;
        }

        private void OnDisable()
        {
            if (planeManager != null) planeManager.planesChanged -= HandlePlanesChanged;
        }

        private void HandlePlanesChanged(ARPlanesChangedEventArgs args)
        {
            if (firstPlaneReported) return;
            if (args.added != null && args.added.Count > 0)
            {
                firstPlaneReported = true;
                OnFirstPlaneDetected?.Invoke();
            }
        }

        private void Update()
        {
            if (Input.touchCount == 0) return;
            var touch = Input.GetTouch(0);
            if (touch.phase != TouchPhase.Began) return;
            if (UnityEngine.EventSystems.EventSystem.current != null &&
                UnityEngine.EventSystems.EventSystem.current.IsPointerOverGameObject(touch.fingerId))
            {
                return; // ignore taps on UI overlays
            }

            if (raycastManager.Raycast(touch.position, hits, TrackableType.PlaneWithinPolygon))
            {
                var hitPose = hits[0].pose;
                OnSurfaceTapped?.Invoke(hitPose.position, hitPose.rotation);
            }
        }

        public GameObject SpawnAt(GameObject prefab, Vector3 position, Quaternion rotation)
        {
            return Instantiate(prefab, position, rotation);
        }

        public void SetPlaneVisualsActive(bool active)
        {
            if (planeManager == null) return;
            foreach (var plane in planeManager.trackables)
            {
                plane.gameObject.SetActive(active);
            }
            planeManager.enabled = active;
        }
    }
}
