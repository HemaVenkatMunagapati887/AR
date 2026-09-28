using ArSafety.Localization;
using UnityEngine;

namespace ArSafety.AR
{
    /// <summary>
    /// Gas Leak & Confined Space Protocol module. Mirrors FireModuleFlow's
    /// structure; only the scenario content and AR tags differ, which is the
    /// point of sharing TrainingFlowController — adding a third domain later
    /// means writing one more class like this one, not touching shared logic.
    /// </summary>
    public class GasModuleFlow : TrainingFlowController
    {
        [Header("Confined-space scenario prefabs (simple primitives)")]
        [SerializeField] private GameObject confinedSpacePrefab;
        [SerializeField] private GameObject gasHazardIndicatorPrefab;
        [SerializeField] private GameObject hazardZoneCorrectPrefab; // tag_id: "hazard_zone" -> gas-q7 correctAnswer 0
        [SerializeField] private GameObject openWalkwayPrefab;      // tag_id: "open_walkway"
        [SerializeField] private GameObject ppeCorrectPrefab;       // tag_id: "scba"
        [SerializeField] private GameObject ppeWrongPrefab;         // tag_id: "sunglasses"
        [SerializeField] private GameObject attendantMarkerPrefab;  // tag_id: "attendant"

        private GameObject spawnedRoot;

        protected override void OnIntroduction() { }

        protected override void OnLearning() { }

        protected override void OnArCalibration()
        {
            placer.OnFirstPlaneDetected += HandlePlaneDetected;
            placer.OnSurfaceTapped += HandleSurfaceTapped;
        }

        private void HandlePlaneDetected() { }

        private void HandleSurfaceTapped(Vector3 pos, Quaternion rot)
        {
            if (spawnedRoot != null) Destroy(spawnedRoot);
            spawnedRoot = new GameObject("GasScenario");
            spawnedRoot.transform.position = pos;

            SpawnTagged(confinedSpacePrefab, pos, "confined_space");
            SpawnTagged(gasHazardIndicatorPrefab, pos + new Vector3(0, 0.2f, 0.2f), "gas_indicator");
            SpawnTagged(hazardZoneCorrectPrefab, pos + new Vector3(0.5f, 0, 0), "hazard_zone");
            SpawnTagged(openWalkwayPrefab, pos + new Vector3(-0.5f, 0, 0), "open_walkway");
            SpawnTagged(ppeCorrectPrefab, pos + new Vector3(0.3f, 0, 0.5f), "scba");
            SpawnTagged(ppeWrongPrefab, pos + new Vector3(-0.3f, 0, 0.5f), "sunglasses");
            SpawnTagged(attendantMarkerPrefab, pos + new Vector3(0, 0, -0.5f), "attendant");

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
            ShowHint(LocalizationManager.Instance.GetString("hazard_zone_prompt"));
        }

        protected override void OnIndependentPractice()
        {
            if (hintBubble != null) hintBubble.Hide();
        }

        private void HandleObjectTapped(InteractableHazard obj)
        {
            bool isHazardZoneChoice = obj.tag_id == "hazard_zone" || obj.tag_id == "open_walkway";

            if (CurrentPhase == TrainingPhase.Assessment)
            {
                // Only the hazard-zone tap (gas-q7, an ar_task question) is graded via
                // AR interaction; PPE/buddy-system/atmosphere-testing knowledge
                // (gas-q1..q6) is answered through AssessmentController's UI.
                if (isHazardZoneChoice) RecordAnswer("gas-q7", obj.tag_id == "hazard_zone" ? 0 : 1);
                return;
            }

            bool correct = obj.tag_id == "hazard_zone" || obj.tag_id == "scba" || obj.tag_id == "attendant";
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
