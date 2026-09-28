using System;
using UnityEngine;
using UnityEngine.EventSystems;

namespace ArSafety.AR
{
    /// <summary>
    /// Attach to any AR-placed object (fire, exit marker, extinguisher, PPE item,
    /// hazard-zone boundary) that the worker must tap to interact with during
    /// guided practice, independent practice, or an ar_task assessment item.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class InteractableHazard : MonoBehaviour
    {
        [Tooltip("Matches an option id / questionId answer value used by AssessmentEngine, e.g. 'exit_a', 'extinguisher_co2'.")]
        public string tag_id;

        [Tooltip("If true, a correct/incorrect flash plays immediately on tap (guided practice). Assessment phase sets this false.")]
        public bool showImmediateFeedback = true;

        public static event Action<InteractableHazard> OnAnyTapped;

        private Camera mainCamera;

        private void Awake() => mainCamera = Camera.main;

        private void Update()
        {
            if (Input.touchCount == 0) return;
            var touch = Input.GetTouch(0);
            if (touch.phase != TouchPhase.Began) return;
            if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject(touch.fingerId)) return;

            var ray = mainCamera.ScreenPointToRay(touch.position);
            if (Physics.Raycast(ray, out var hit) && hit.collider.gameObject == gameObject)
            {
                OnAnyTapped?.Invoke(this);
            }
        }

        public void PlayFeedback(bool correct)
        {
            // Simple, functional feedback for the 48-hour MVP: a colour pulse.
            // Priority is functionality over graphics per the brief.
            var renderer = GetComponentInChildren<Renderer>();
            if (renderer == null) return;
            renderer.material.color = correct ? Color.green : Color.red;
        }
    }
}
