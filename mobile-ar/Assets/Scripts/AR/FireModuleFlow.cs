using ArSafety.Localization;
using UnityEngine;

namespace ArSafety.AR
{
    /// <summary>
    /// Fire & Explosion Response module (PS domain 1/2 implemented for the MVP).
    /// Phase content maps directly onto backend/src/seed/fireModule.data.js
    /// question ids (fire-q1..fire-q6) so AR taps and quiz answers score
    /// identically whether graded on-device or by the server.
    /// </summary>
    public class FireModuleFlow : TrainingFlowController
    {
        [Header("Fire scenario prefabs (simple primitives — functionality over graphics)")]
        [SerializeField] private GameObject fireHazardPrefab;
        [SerializeField] private GameObject correctExtinguisherPrefab; // tag_id: "co2_dcp"
        [SerializeField] private GameObject wrongExtinguisherPrefab;   // tag_id: "water"
        [SerializeField] private GameObject correctExitPrefab;        // tag_id: "exit_a" -> fire-q6 correctAnswer 0
        [SerializeField] private GameObject wrongExitPrefab;          // tag_id: "exit_b"

        private GameObject spawnedRoot;

        protected override void OnIntroduction()
        {
            // ScreenRouter shows LearningContentScreen with module.description +
            // fire-class / PASS-technique explainer slides (see docs/demo-script.md).
        }

        protected override void OnLearning()
        {
            // Handled by LearningContentScreen paging through localized slides;
            // "Continue" advances to ArCalibration.
        }

        protected override void OnArCalibration()
        {
            placer.OnFirstPlaneDetected += HandlePlaneDetected;
            placer.OnSurfaceTapped += HandleSurfaceTapped;
        }

        private void HandlePlaneDetected()
        {
            // UI hint text switches from "scanning" to "surface_detected" via ScreenRouter.
        }

        private void HandleSurfaceTapped(Vector3 pos, Quaternion rot)
        {
            if (spawnedRoot != null) Destroy(spawnedRoot);
            spawnedRoot = new GameObject("FireScenario");
            spawnedRoot.transform.position = pos;

            SpawnTagged(fireHazardPrefab, pos, "fire");
            SpawnTagged(correctExtinguisherPrefab, pos + new Vector3(0.4f, 0, 0), "co2_dcp");
            SpawnTagged(wrongExtinguisherPrefab, pos + new Vector3(-0.4f, 0, 0), "water");
            SpawnTagged(correctExitPrefab, pos + new Vector3(0, 0, 0.6f), "exit_a");
            SpawnTagged(wrongExitPrefab, pos + new Vector3(0.3f, 0, -0.6f), "exit_b");

            InteractableHazard.OnAnyTapped += HandleObjectTapped;
        }

        private void SpawnTagged(GameObject prefab, Vector3 pos, string tagId)
        {
            if (prefab == null) return;
            var go = placer.SpawnAt(prefab, pos, Quaternion.identity);
            go.transform.SetParent(spawnedRoot.transform);
            var interactable = go.GetComponent<InteractableHazard>();
            if (interactable == null) interactable = go.AddComponent<InteractableHazard>();
            interactable.tag_id = tagId;
        }

        protected override void OnGuidedPractice()
        {
            ShowHint(LocalizationManager.Instance.GetString("identify_hazard_prompt"));
        }

        protected override void OnIndependentPractice()
        {
            if (hintBubble != null) hintBubble.Hide();
        }

        private void HandleObjectTapped(InteractableHazard obj)
        {
            bool isExitChoice = obj.tag_id == "exit_a" || obj.tag_id == "exit_b";

            if (CurrentPhase == TrainingPhase.Assessment)
            {
                // Only the exit-identification tap (fire-q6, an ar_task question) is
                // graded via AR interaction. The extinguisher/PASS-technique/evacuation
                // knowledge questions (fire-q1..q5) are answered through
                // AssessmentController's UI, matching their mcq/ordering question types
                // in backend/src/seed/fireModule.data.js.
                if (isExitChoice) RecordAnswer("fire-q6", obj.tag_id == "exit_a" ? 0 : 1);
                return; // no feedback shown during formal assessment
            }

            bool correct = obj.tag_id == "co2_dcp" || obj.tag_id == "exit_a" || obj.tag_id == "fire";
            obj.PlayFeedback(correct);

            if (HintsAllowed && hintBubble != null)
            {
                var key = correct ? "correct_feedback" : "incorrect_feedback";
                hintBubble.Show(obj.transform, LocalizationManager.Instance.GetString(key));
            }
        }

        private void ShowHint(string text)
        {
            if (hintBubble != null && spawnedRoot != null)
            {
                hintBubble.Show(spawnedRoot.transform, text);
            }
        }

        private void OnDestroy()
        {
            InteractableHazard.OnAnyTapped -= HandleObjectTapped;
            if (placer != null)
            {
                placer.OnFirstPlaneDetected -= HandlePlaneDetected;
                placer.OnSurfaceTapped -= HandleSurfaceTapped;
            }
        }
    }
}
