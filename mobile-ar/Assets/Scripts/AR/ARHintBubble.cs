using TMPro;
using UnityEngine;

namespace ArSafety.AR
{
    /// <summary>
    /// World-space hint bubble shown above an AR object during guided practice.
    /// Independent practice and assessment phases keep this hidden — the
    /// pedagogical design explicitly withdraws hints as the worker progresses.
    /// </summary>
    public class ARHintBubble : MonoBehaviour
    {
        [SerializeField] private TMP_Text label;
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 offset = new Vector3(0, 0.3f, 0);

        private Camera mainCamera;

        private void Awake() => mainCamera = Camera.main;

        public void Show(Transform followTarget, string text)
        {
            target = followTarget;
            if (label != null) label.text = text;
            gameObject.SetActive(true);
        }

        public void Hide() => gameObject.SetActive(false);

        private void LateUpdate()
        {
            if (target == null || mainCamera == null) return;
            transform.position = target.position + offset;
            transform.rotation = Quaternion.LookRotation(transform.position - mainCamera.transform.position);
        }
    }
}
