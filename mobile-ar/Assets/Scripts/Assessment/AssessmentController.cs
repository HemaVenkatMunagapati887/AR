using System.Collections.Generic;
using ArSafety.AR;
using ArSafety.Data;
using ArSafety.Localization;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace ArSafety.Assessment
{
    /// <summary>
    /// Drives the no-hints assessment phase for mcq/scenario/ordering questions
    /// through UI; ar_task questions are skipped here and instead resolved by
    /// the active TrainingFlowController listening for an AR tap
    /// (FireModuleFlow/GasModuleFlow), then reported back via OnAnswerRecorded.
    /// One controller serves every module — see class comment on
    /// TrainingFlowController for why question-type logic isn't duplicated
    /// per module.
    /// </summary>
    public class AssessmentController : MonoBehaviour
    {
        [SerializeField] private TrainingFlowController flow;
        [SerializeField] private GameObject panelRoot;
        [SerializeField] private TMP_Text questionText;
        [SerializeField] private Transform optionsContainer;
        [SerializeField] private Button optionButtonPrefab;
        [SerializeField] private TMP_Text progressText;
        [SerializeField] private GameObject arTaskPrompt;
        [SerializeField] private TMP_Text noHintsNotice;

        private List<QuestionData> questions;
        private int currentIndex;
        private readonly List<int> orderingSelection = new List<int>();
        private readonly List<Button> spawnedButtons = new List<Button>();

        private void OnEnable()
        {
            if (flow != null) flow.OnAnswerRecorded += HandleArAnswerRecorded;
        }

        private void OnDisable()
        {
            if (flow != null) flow.OnAnswerRecorded -= HandleArAnswerRecorded;
        }

        public void BeginAssessment(ModuleData module)
        {
            questions = module.questions;
            currentIndex = 0;
            panelRoot.SetActive(true);
            if (noHintsNotice != null)
            {
                noHintsNotice.text = LocalizationManager.Instance.GetString("assessment_no_hints_notice");
            }
            ShowCurrentQuestion();
        }

        private void ShowCurrentQuestion()
        {
            ClearOptions();
            if (currentIndex >= questions.Count)
            {
                panelRoot.SetActive(false);
                flow.SubmitAssessment();
                return;
            }

            var q = questions[currentIndex];
            UpdateProgress();

            if (q.questionType == "ar_task")
            {
                // Hand control to the AR scene; HandleArAnswerRecorded advances us
                // once the worker taps the correct/incorrect marker in-camera.
                questionText.text = q.question.Get(LocalizationManager.Instance.CurrentLanguage);
                if (arTaskPrompt != null) arTaskPrompt.SetActive(true);
                return;
            }

            if (arTaskPrompt != null) arTaskPrompt.SetActive(false);
            questionText.text = q.question.Get(LocalizationManager.Instance.CurrentLanguage);

            if (q.questionType == "ordering")
            {
                orderingSelection.Clear();
                BuildOrderingOptions(q);
            }
            else
            {
                BuildMcqOptions(q);
            }
        }

        private void BuildMcqOptions(QuestionData q)
        {
            for (int i = 0; i < q.options.Count; i++)
            {
                int optionIndex = i;
                var btn = Instantiate(optionButtonPrefab, optionsContainer);
                var label = btn.GetComponentInChildren<TMP_Text>();
                if (label != null) label.text = q.options[i].Get(LocalizationManager.Instance.CurrentLanguage);
                btn.onClick.AddListener(() => SubmitMcqAnswer(q.questionId, optionIndex));
                spawnedButtons.Add(btn);
            }
        }

        private void BuildOrderingOptions(QuestionData q)
        {
            for (int i = 0; i < q.options.Count; i++)
            {
                int optionIndex = i;
                var btn = Instantiate(optionButtonPrefab, optionsContainer);
                var label = btn.GetComponentInChildren<TMP_Text>();
                if (label != null) label.text = q.options[i].Get(LocalizationManager.Instance.CurrentLanguage);
                btn.onClick.AddListener(() => SubmitOrderingTap(q.questionId, optionIndex, btn));
                spawnedButtons.Add(btn);
            }
        }

        private void SubmitMcqAnswer(string questionId, int optionIndex)
        {
            flow.RecordAnswer(questionId, optionIndex);
            currentIndex++;
            ShowCurrentQuestion();
        }

        private void SubmitOrderingTap(string questionId, int optionIndex, Button btn)
        {
            if (orderingSelection.Contains(optionIndex)) return;
            orderingSelection.Add(optionIndex);
            btn.interactable = false;
            var label = btn.GetComponentInChildren<TMP_Text>();
            if (label != null) label.text = $"{orderingSelection.Count}. {label.text}";

            if (orderingSelection.Count == questions[currentIndex].options.Count)
            {
                flow.RecordAnswer(questionId, new List<int>(orderingSelection));
                currentIndex++;
                ShowCurrentQuestion();
            }
        }

        private void HandleArAnswerRecorded(string questionId, object selected)
        {
            if (currentIndex >= questions.Count) return;
            if (questions[currentIndex].questionId != questionId) return;
            if (arTaskPrompt != null) arTaskPrompt.SetActive(false);
            currentIndex++;
            ShowCurrentQuestion();
        }

        private void UpdateProgress()
        {
            if (progressText != null)
            {
                progressText.text = $"{currentIndex + 1} / {questions.Count}";
            }
        }

        private void ClearOptions()
        {
            foreach (var btn in spawnedButtons)
            {
                if (btn != null) Destroy(btn.gameObject);
            }
            spawnedButtons.Clear();
        }
    }
}
