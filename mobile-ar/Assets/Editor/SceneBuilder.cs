using System;
using ArSafety.AR;
using ArSafety.Assessment;
using ArSafety.Core;
using ArSafety.Localization;
using ArSafety.UI;
using ArSafety.UI.Screens;
using TMPro;
using Unity.XR.CoreUtils;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.XR.ARFoundation;

namespace ArSafety.EditorTools
{
    /// <summary>
    /// Programmatically assembles Assets/Scenes/Main.unity: AR session hierarchy,
    /// manager singletons, and a Canvas panel per AppScreen wired to its
    /// controller script. Run via:
    /// Unity.exe -batchmode -projectPath &lt;path&gt; -executeMethod ArSafety.EditorTools.SceneBuilder.BuildAll -quit
    ///
    /// This exists because a 48-hour hackathon team can't hand-wire 13 screens
    /// in the Editor GUI reliably across 6 people — the scene is generated once,
    /// deterministically, from code, and re-generating it is idempotent.
    /// </summary>
    public static class SceneBuilder
    {
        [MenuItem("AR Safety/Build Main Scene")]
        public static void BuildAll()
        {
            try
            {
                BuildScene();
                Debug.Log("[SceneBuilder] Main.unity built successfully.");
            }
            catch (Exception e)
            {
                Debug.LogError("[SceneBuilder] FAILED: " + e);
                if (Application.isBatchMode) EditorApplication.Exit(1);
            }
        }

        private static void BuildScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var eventSystem = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));

            var arRoot = BuildArHierarchy(out var placer, out var hintBubble);

            var fireFlow = BuildFireFlow(placer, hintBubble);
            var gasFlow = BuildGasFlow(placer, hintBubble);

            var managers = BuildManagers(fireFlow, gasFlow);

            var canvas = BuildCanvas();
            var screens = BuildScreens(canvas.transform, fireFlow);

            var router = managers.AddComponent<ScreenRouter>();
            SetPrivateField(router, "bindings", BuildScreenBindings(screens));

            var syncBar = BuildSyncStatusBar(canvas.transform);

            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/Scenes/Main.unity");
        }

        // ---------- AR hierarchy ----------

        private static GameObject BuildArHierarchy(out ARObjectPlacer placer, out ARHintBubble hintBubble)
        {
            var sessionGo = new GameObject("AR Session", typeof(ARSession));

            var originGo = new GameObject("XR Origin", typeof(XROrigin), typeof(ARPlaneManager), typeof(ARRaycastManager), typeof(ARObjectPlacer));
            var cameraOffset = new GameObject("Camera Offset");
            cameraOffset.transform.SetParent(originGo.transform);

            var cameraGo = new GameObject("AR Camera", typeof(Camera), typeof(ARCameraManager), typeof(ARCameraBackground));
            cameraGo.transform.SetParent(cameraOffset.transform);
            cameraGo.tag = "MainCamera";

            var origin = originGo.GetComponent<XROrigin>();
            origin.Camera = cameraGo.GetComponent<Camera>();
            origin.CameraFloorOffsetObject = cameraOffset;

            var planeManager = originGo.GetComponent<ARPlaneManager>();
            var planePrefab = BuildArPlanePrefab();
            planeManager.planePrefab = planePrefab;

            placer = originGo.GetComponent<ARObjectPlacer>();

            var hintGo = new GameObject("HintBubble", typeof(Canvas));
            var hintCanvas = hintGo.GetComponent<Canvas>();
            hintCanvas.renderMode = RenderMode.WorldSpace;
            hintGo.transform.localScale = Vector3.one * 0.01f;
            var hintTextGo = CreateText(hintGo.transform, "HintText", "", 24);
            hintBubble = hintGo.AddComponent<ARHintBubble>();
            SetPrivateField(hintBubble, "label", hintTextGo.GetComponent<TMP_Text>());
            hintGo.SetActive(false);

            return originGo;
        }

        private static GameObject BuildArPlanePrefab()
        {
            var plane = GameObject.CreatePrimitive(PrimitiveType.Quad);
            plane.name = "ARPlaneVisual";
            UnityEngine.Object.DestroyImmediate(plane.GetComponent<Collider>());
            var dir = "Assets/Prefabs";
            System.IO.Directory.CreateDirectory(dir);
            var prefab = PrefabUtility.SaveAsPrefabAsset(plane, dir + "/ARPlaneVisual.prefab");
            UnityEngine.Object.DestroyImmediate(plane);
            return prefab;
        }

        // ---------- Training flow controllers ----------

        private static FireModuleFlow BuildFireFlow(ARObjectPlacer placer, ARHintBubble hintBubble)
        {
            var go = new GameObject("FireModuleFlow", typeof(FireModuleFlow));
            var flow = go.GetComponent<FireModuleFlow>();
            SetPrivateField(flow, "placer", placer);
            SetPrivateField(flow, "hintBubble", hintBubble);
            AssignPrimitivePrefabs(flow, new[]
            {
                ("fireHazardPrefab", PrimitiveType.Sphere, new Color(1f, 0.3f, 0f)),
                ("correctExtinguisherPrefab", PrimitiveType.Cylinder, Color.red),
                ("wrongExtinguisherPrefab", PrimitiveType.Cylinder, Color.blue),
                ("correctExitPrefab", PrimitiveType.Cube, Color.green),
                ("wrongExitPrefab", PrimitiveType.Cube, Color.gray),
            });
            return flow;
        }

        private static GasModuleFlow BuildGasFlow(ARObjectPlacer placer, ARHintBubble hintBubble)
        {
            var go = new GameObject("GasModuleFlow", typeof(GasModuleFlow));
            var flow = go.GetComponent<GasModuleFlow>();
            SetPrivateField(flow, "placer", placer);
            SetPrivateField(flow, "hintBubble", hintBubble);
            AssignPrimitivePrefabs(flow, new[]
            {
                ("confinedSpacePrefab", PrimitiveType.Cube, new Color(0.4f, 0.4f, 0.4f)),
                ("gasHazardIndicatorPrefab", PrimitiveType.Sphere, Color.yellow),
                ("hazardZoneCorrectPrefab", PrimitiveType.Cylinder, Color.green),
                ("openWalkwayPrefab", PrimitiveType.Cylinder, Color.gray),
                ("ppeCorrectPrefab", PrimitiveType.Capsule, Color.cyan),
                ("ppeWrongPrefab", PrimitiveType.Capsule, Color.magenta),
                ("attendantMarkerPrefab", PrimitiveType.Cube, Color.blue),
            });
            return flow;
        }

        private static void AssignPrimitivePrefabs(Component target, (string field, PrimitiveType type, Color color)[] specs)
        {
            System.IO.Directory.CreateDirectory("Assets/Prefabs");
            foreach (var (field, type, color) in specs)
            {
                var prim = GameObject.CreatePrimitive(type);
                prim.name = field;
                var renderer = prim.GetComponent<Renderer>();
                var mat = new Material(Shader.Find("Universal Render Pipeline/Lit")) { color = color };
                if (mat.shader == null) mat = new Material(Shader.Find("Standard")) { color = color };
                renderer.sharedMaterial = mat;
                prim.transform.localScale = Vector3.one * 0.2f;

                var path = $"Assets/Prefabs/{field}.prefab";
                var prefab = PrefabUtility.SaveAsPrefabAsset(prim, path);
                UnityEngine.Object.DestroyImmediate(prim);
                SetPrivateField(target, field, prefab);
            }
        }

        // ---------- Managers ----------

        private static GameObject BuildManagers(FireModuleFlow fireFlow, GasModuleFlow gasFlow)
        {
            var go = new GameObject("Managers", typeof(ApiClient), typeof(LocalizationManager), typeof(SyncManager), typeof(GameSession));
            var session = go.GetComponent<GameSession>();
            SetPrivateField(session, "fireModuleFlow", fireFlow);
            SetPrivateField(session, "gasModuleFlow", gasFlow);
            return go;
        }

        // ---------- Canvas + screens ----------

        private static Canvas BuildCanvas()
        {
            var canvasGo = new GameObject("Canvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasGo.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            return canvas;
        }

        private static System.Collections.Generic.Dictionary<AppScreen, GameObject> BuildScreens(Transform canvasTransform, FireModuleFlow flowForAssessment)
        {
            var result = new System.Collections.Generic.Dictionary<AppScreen, GameObject>();

            result[AppScreen.Splash] = BuildSplashPanel(canvasTransform);
            result[AppScreen.LanguageSelect] = BuildLanguageSelectPanel(canvasTransform);
            result[AppScreen.Login] = BuildLoginPanel(canvasTransform);
            result[AppScreen.Home] = BuildHomePanel(canvasTransform);
            result[AppScreen.ModuleIntro] = BuildModuleIntroPanel(canvasTransform);
            result[AppScreen.LearningContent] = BuildLearningContentPanel(canvasTransform);
            result[AppScreen.ArCalibration] = BuildArCalibrationPanel(canvasTransform);
            result[AppScreen.ArTraining] = BuildArTrainingPanel(canvasTransform, out var assessmentController);
            result[AppScreen.Assessment] = BuildAssessmentPanel(canvasTransform, assessmentController);
            result[AppScreen.Result] = BuildResultPanel(canvasTransform);
            result[AppScreen.Certificate] = BuildCertificatePanel(canvasTransform);
            result[AppScreen.CertificateQr] = BuildCertificateQrPanel(canvasTransform);
            result[AppScreen.History] = BuildHistoryPanel(canvasTransform);

            foreach (var kv in result) kv.Value.SetActive(false);
            result[AppScreen.Splash].SetActive(true);

            return result;
        }

        private static System.Collections.Generic.List<ScreenRouter.ScreenBinding> BuildScreenBindings(System.Collections.Generic.Dictionary<AppScreen, GameObject> screens)
        {
            var list = new System.Collections.Generic.List<ScreenRouter.ScreenBinding>();
            foreach (var kv in screens)
            {
                list.Add(new ScreenRouter.ScreenBinding { screen = kv.Key, panel = kv.Value });
            }
            return list;
        }

        private static GameObject BuildSplashPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "SplashPanel");
            CreateText(panel.transform, "AppTitle", "Safety Trainer", 64);
            panel.AddComponent<SplashScreen>();
            return panel;
        }

        private static GameObject BuildLanguageSelectPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "LanguageSelectPanel");
            var controller = panel.AddComponent<LanguageSelectScreen>();
            CreateText(panel.transform, "Title", "Select your language", 48);
            var enBtn = CreateButton(panel.transform, "EnglishButton", "English");
            var hiBtn = CreateButton(panel.transform, "HindiButton", "हिन्दी");
            var satBtn = CreateButton(panel.transform, "SantaliButton", "Santali (Draft)");
            LayoutVertical(new[] { enBtn, hiBtn, satBtn });
            enBtn.GetComponent<Button>().onClick.AddListener(controller.SelectEnglish);
            hiBtn.GetComponent<Button>().onClick.AddListener(controller.SelectHindi);
            satBtn.GetComponent<Button>().onClick.AddListener(controller.SelectSantali);
            var banner = CreateText(panel.transform, "SantaliDraftBanner", "Santali translations are draft, pending native-speaker review.", 22);
            banner.SetActive(false);
            SetPrivateField(controller, "santaliDraftBanner", banner);
            return panel;
        }

        private static GameObject BuildLoginPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "LoginPanel");
            var controller = panel.AddComponent<LoginScreen>();
            CreateText(panel.transform, "Title", "Worker Login", 48);
            var workerIdField = CreateInputField(panel.transform, "WorkerIdField", "Worker ID");
            var passwordField = CreateInputField(panel.transform, "PasswordField", "Password");
            passwordField.GetComponent<TMP_InputField>().contentType = TMP_InputField.ContentType.Password;
            var loginBtn = CreateButton(panel.transform, "LoginButton", "Login");
            var errorText = CreateText(panel.transform, "ErrorText", "", 22);
            errorText.SetActive(false);
            var loading = CreateText(panel.transform, "LoadingIndicator", "Signing in...", 22);
            loading.SetActive(false);
            LayoutVertical(new[] { workerIdField, passwordField, loginBtn, errorText, loading });

            SetPrivateField(controller, "workerIdField", workerIdField.GetComponent<TMP_InputField>());
            SetPrivateField(controller, "passwordField", passwordField.GetComponent<TMP_InputField>());
            SetPrivateField(controller, "errorText", errorText.GetComponent<TMP_Text>());
            SetPrivateField(controller, "loadingIndicator", loading);
            loginBtn.GetComponent<Button>().onClick.AddListener(controller.OnLoginPressed);
            return panel;
        }

        private static GameObject BuildHomePanel(Transform parent)
        {
            var panel = CreatePanel(parent, "HomePanel");
            var controller = panel.AddComponent<HomeScreen>();
            var welcome = CreateText(panel.transform, "WelcomeText", "", 40);
            var listContainer = new GameObject("ModuleList", typeof(RectTransform), typeof(VerticalLayoutGroup));
            listContainer.transform.SetParent(panel.transform, false);
            var historyBtn = CreateButton(panel.transform, "HistoryButton", "Training History");
            historyBtn.GetComponent<Button>().onClick.AddListener(controller.OpenHistory);
            LayoutVertical(new[] { welcome, listContainer, historyBtn });

            var itemPrefabGo = BuildModuleListItemPrefab();
            SetPrivateField(controller, "welcomeText", welcome.GetComponent<TMP_Text>());
            SetPrivateField(controller, "moduleListContainer", listContainer.transform);
            SetPrivateField(controller, "moduleItemPrefab", itemPrefabGo.GetComponent<ModuleListItem>());
            return panel;
        }

        private static GameObject BuildModuleListItemPrefab()
        {
            var go = CreatePanelLike("ModuleListItem");
            var titleGo = CreateText(go.transform, "Title", "Module", 28);
            var statusGo = CreateText(go.transform, "Status", "Pending", 20);
            var btn = go.AddComponent<Button>();
            var item = go.AddComponent<ModuleListItem>();
            SetPrivateField(item, "titleText", titleGo.GetComponent<TMP_Text>());
            SetPrivateField(item, "statusText", statusGo.GetComponent<TMP_Text>());
            SetPrivateField(item, "button", btn);

            System.IO.Directory.CreateDirectory("Assets/Prefabs");
            var prefab = PrefabUtility.SaveAsPrefabAsset(go, "Assets/Prefabs/ModuleListItem.prefab");
            UnityEngine.Object.DestroyImmediate(go);
            return prefab;
        }

        private static GameObject BuildModuleIntroPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ModuleIntroPanel");
            var controller = panel.AddComponent<ModuleIntroScreen>();
            var title = CreateText(panel.transform, "Title", "", 44);
            var desc = CreateText(panel.transform, "Description", "", 26);
            var startBtn = CreateButton(panel.transform, "StartButton", "Start Training");
            LayoutVertical(new[] { title, desc, startBtn });
            SetPrivateField(controller, "titleText", title.GetComponent<TMP_Text>());
            SetPrivateField(controller, "descriptionText", desc.GetComponent<TMP_Text>());
            startBtn.GetComponent<Button>().onClick.AddListener(controller.OnStartTraining);
            return panel;
        }

        private static GameObject BuildLearningContentPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "LearningContentPanel");
            var controller = panel.AddComponent<LearningContentScreen>();
            var slide = CreateText(panel.transform, "SlideText", "", 30);
            var progress = CreateText(panel.transform, "ProgressText", "", 20);
            var backBtn = CreateButton(panel.transform, "BackButton", "Back");
            var nextBtn = CreateButton(panel.transform, "NextButton", "Next");
            LayoutVertical(new[] { slide, progress, backBtn, nextBtn });
            SetPrivateField(controller, "slideText", slide.GetComponent<TMP_Text>());
            SetPrivateField(controller, "progressText", progress.GetComponent<TMP_Text>());
            backBtn.GetComponent<Button>().onClick.AddListener(controller.OnBack);
            nextBtn.GetComponent<Button>().onClick.AddListener(controller.OnNext);
            return panel;
        }

        private static GameObject BuildArCalibrationPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ArCalibrationPanel");
            var controller = panel.AddComponent<ArCalibrationScreen>();
            var instruction = CreateText(panel.transform, "InstructionText", "", 30);
            var continueBtn = CreateButton(panel.transform, "ContinueButton", "Continue");
            LayoutVertical(new[] { instruction, continueBtn });
            SetPrivateField(controller, "instructionText", instruction.GetComponent<TMP_Text>());
            SetPrivateField(controller, "continueButton", continueBtn);
            continueBtn.GetComponent<Button>().onClick.AddListener(controller.OnContinue);
            return panel;
        }

        private static GameObject BuildArTrainingPanel(Transform parent, out AssessmentController assessmentController)
        {
            var panel = CreatePanel(parent, "ArTrainingPanel");
            var controller = panel.AddComponent<ArTrainingScreen>();
            var phaseTitle = CreateText(panel.transform, "PhaseTitle", "", 34);
            var instruction = CreateText(panel.transform, "InstructionText", "", 24);
            var continueBtn = CreateButton(panel.transform, "ContinueButton", "Continue");
            LayoutVertical(new[] { phaseTitle, instruction, continueBtn });

            // AssessmentController lives on a sibling object so it can stay active
            // across the ArTraining -> Assessment screen switch without being
            // parented under either panel (both get toggled off/on independently).
            var assessmentGo = new GameObject("AssessmentController", typeof(AssessmentController));
            assessmentController = assessmentGo.GetComponent<AssessmentController>();
            var flowGo = GameObject.Find("FireModuleFlow");
            SetPrivateField(assessmentController, "flow", flowGo.GetComponent<TrainingFlowController>());

            SetPrivateField(controller, "phaseTitleText", phaseTitle.GetComponent<TMP_Text>());
            SetPrivateField(controller, "instructionText", instruction.GetComponent<TMP_Text>());
            SetPrivateField(controller, "continueButton", continueBtn);
            SetPrivateField(controller, "assessmentController", assessmentController);
            continueBtn.GetComponent<Button>().onClick.AddListener(controller.OnContinuePressed);
            return panel;
        }

        private static GameObject BuildAssessmentPanel(Transform parent, AssessmentController controller)
        {
            var panel = CreatePanel(parent, "AssessmentPanel");
            var notice = CreateText(panel.transform, "NoHintsNotice", "", 20);
            var progress = CreateText(panel.transform, "ProgressText", "", 20);
            var question = CreateText(panel.transform, "QuestionText", "", 30);
            var optionsContainer = new GameObject("OptionsContainer", typeof(RectTransform), typeof(VerticalLayoutGroup));
            optionsContainer.transform.SetParent(panel.transform, false);
            var arTaskPrompt = CreateText(panel.transform, "ArTaskPrompt", "Look around and tap the correct marker", 26);
            LayoutVertical(new[] { notice, progress, question, optionsContainer, arTaskPrompt });

            var optionButtonPrefab = BuildOptionButtonPrefab();

            SetPrivateField(controller, "panelRoot", panel);
            SetPrivateField(controller, "questionText", question.GetComponent<TMP_Text>());
            SetPrivateField(controller, "optionsContainer", optionsContainer.transform);
            SetPrivateField(controller, "optionButtonPrefab", optionButtonPrefab.GetComponent<Button>());
            SetPrivateField(controller, "progressText", progress.GetComponent<TMP_Text>());
            SetPrivateField(controller, "arTaskPrompt", arTaskPrompt);
            SetPrivateField(controller, "noHintsNotice", notice.GetComponent<TMP_Text>());
            return panel;
        }

        private static GameObject BuildOptionButtonPrefab()
        {
            var btn = CreateButton(null, "OptionButton", "Option");
            System.IO.Directory.CreateDirectory("Assets/Prefabs");
            var prefab = PrefabUtility.SaveAsPrefabAsset(btn, "Assets/Prefabs/OptionButton.prefab");
            UnityEngine.Object.DestroyImmediate(btn);
            return prefab;
        }

        private static GameObject BuildResultPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ResultPanel");
            var controller = panel.AddComponent<ResultScreen>();
            var score = CreateText(panel.transform, "ScoreText", "", 34);
            var status = CreateText(panel.transform, "StatusText", "", 44);
            var recommendation = CreateText(panel.transform, "RecommendationText", "", 24);
            var certBtn = CreateButton(panel.transform, "GetCertificateButton", "Get Certificate");
            var pending = CreateText(panel.transform, "CertificatePendingLabel", "", 22);
            LayoutVertical(new[] { score, status, recommendation, certBtn, pending });

            SetPrivateField(controller, "scoreText", score.GetComponent<TMP_Text>());
            SetPrivateField(controller, "statusText", status.GetComponent<TMP_Text>());
            SetPrivateField(controller, "recommendationText", recommendation.GetComponent<TMP_Text>());
            SetPrivateField(controller, "getCertificateButton", certBtn);
            SetPrivateField(controller, "certificatePendingLabel", pending);
            certBtn.GetComponent<Button>().onClick.AddListener(controller.OnGetCertificate);
            return panel;
        }

        private static GameObject BuildCertificatePanel(Transform parent)
        {
            var panel = CreatePanel(parent, "CertificatePanel");
            var controller = panel.AddComponent<CertificateScreen>();
            var worker = CreateText(panel.transform, "WorkerNameText", "", 30);
            var module = CreateText(panel.transform, "ModuleNameText", "", 28);
            var score = CreateText(panel.transform, "ScoreText", "", 28);
            var date = CreateText(panel.transform, "DateText", "", 24);
            var certId = CreateText(panel.transform, "CertificateIdText", "", 20);
            var qrBtn = CreateButton(panel.transform, "ViewQrButton", "View QR Code");
            LayoutVertical(new[] { worker, module, score, date, certId, qrBtn });

            SetPrivateField(controller, "workerNameText", worker.GetComponent<TMP_Text>());
            SetPrivateField(controller, "moduleNameText", module.GetComponent<TMP_Text>());
            SetPrivateField(controller, "scoreText", score.GetComponent<TMP_Text>());
            SetPrivateField(controller, "dateText", date.GetComponent<TMP_Text>());
            SetPrivateField(controller, "certificateIdText", certId.GetComponent<TMP_Text>());
            qrBtn.GetComponent<Button>().onClick.AddListener(controller.OnViewQr);
            return panel;
        }

        private static GameObject BuildCertificateQrPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "CertificateQrPanel");
            var controller = panel.AddComponent<CertificateQrScreen>();
            var qrGo = new GameObject("QrImage", typeof(RectTransform), typeof(RawImage));
            qrGo.transform.SetParent(panel.transform, false);
            qrGo.GetComponent<RectTransform>().sizeDelta = new Vector2(400, 400);
            var pending = CreateText(panel.transform, "PendingText", "", 24);
            var caption = CreateText(panel.transform, "CaptionText", "", 22);
            LayoutVertical(new[] { qrGo, pending, caption });

            SetPrivateField(controller, "qrImage", qrGo.GetComponent<RawImage>());
            SetPrivateField(controller, "pendingText", pending.GetComponent<TMP_Text>());
            SetPrivateField(controller, "captionText", caption.GetComponent<TMP_Text>());
            return panel;
        }

        private static GameObject BuildHistoryPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "HistoryPanel");
            var controller = panel.AddComponent<HistoryScreen>();
            var listContainer = new GameObject("HistoryList", typeof(RectTransform), typeof(VerticalLayoutGroup));
            listContainer.transform.SetParent(panel.transform, false);
            var empty = CreateText(panel.transform, "EmptyLabel", "No training attempts yet", 24);
            LayoutVertical(new[] { listContainer, empty });

            var itemPrefabGo = BuildHistoryItemPrefab();
            SetPrivateField(controller, "listContainer", listContainer.transform);
            SetPrivateField(controller, "itemPrefab", itemPrefabGo.GetComponent<HistoryItem>());
            SetPrivateField(controller, "emptyLabel", empty);
            return panel;
        }

        private static GameObject BuildHistoryItemPrefab()
        {
            var go = CreatePanelLike("HistoryItem");
            var moduleT = CreateText(go.transform, "ModuleText", "", 24);
            var scoreT = CreateText(go.transform, "ScoreText", "", 22);
            var statusT = CreateText(go.transform, "StatusText", "", 22);
            var syncT = CreateText(go.transform, "SyncText", "", 18);
            var item = go.AddComponent<HistoryItem>();
            SetPrivateField(item, "moduleText", moduleT.GetComponent<TMP_Text>());
            SetPrivateField(item, "scoreText", scoreT.GetComponent<TMP_Text>());
            SetPrivateField(item, "statusText", statusT.GetComponent<TMP_Text>());
            SetPrivateField(item, "syncText", syncT.GetComponent<TMP_Text>());

            System.IO.Directory.CreateDirectory("Assets/Prefabs");
            var prefab = PrefabUtility.SaveAsPrefabAsset(go, "Assets/Prefabs/HistoryItem.prefab");
            UnityEngine.Object.DestroyImmediate(go);
            return prefab;
        }

        private static GameObject BuildSyncStatusBar(Transform canvasTransform)
        {
            var go = new GameObject("SyncStatusBar", typeof(RectTransform));
            go.transform.SetParent(canvasTransform, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0, 1);
            rect.anchorMax = new Vector2(1, 1);
            rect.pivot = new Vector2(0.5f, 1);
            rect.sizeDelta = new Vector2(0, 60);

            var statusText = CreateText(go.transform, "StatusText", "", 20);
            var offlineIcon = new GameObject("OfflineIcon", typeof(Image));
            offlineIcon.transform.SetParent(go.transform, false);

            var bar = go.AddComponent<SyncStatusBar>();
            SetPrivateField(bar, "statusText", statusText.GetComponent<TMP_Text>());
            SetPrivateField(bar, "offlineIcon", offlineIcon);
            return go;
        }

        // ---------- Low-level UI helpers ----------

        private static GameObject CreatePanel(Transform parent, string name)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasGroup));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var vlg = go.AddComponent<VerticalLayoutGroup>();
            vlg.childAlignment = TextAnchor.MiddleCenter;
            vlg.spacing = 20;
            vlg.padding = new RectOffset(60, 60, 100, 100);
            return go;
        }

        private static GameObject CreatePanelLike(string name)
        {
            var go = new GameObject(name, typeof(RectTransform));
            var vlg = go.AddComponent<VerticalLayoutGroup>();
            vlg.spacing = 8;
            return go;
        }

        private static GameObject CreateText(Transform parent, string name, string text, int fontSize)
        {
            var go = new GameObject(name, typeof(RectTransform));
            if (parent != null) go.transform.SetParent(parent, false);
            var tmp = go.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = fontSize;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.enableWordWrapping = true;
            return go;
        }

        private static GameObject CreateButton(Transform parent, string name, string label)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            if (parent != null) go.transform.SetParent(parent, false);
            go.GetComponent<RectTransform>().sizeDelta = new Vector2(400, 90);
            go.GetComponent<Image>().color = new Color(0.95f, 0.45f, 0f);
            CreateText(go.transform, "Label", label, 28);
            var labelRect = go.transform.GetChild(0).GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            return go;
        }

        private static GameObject CreateInputField(Transform parent, string name, string placeholder)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(TMP_InputField));
            go.transform.SetParent(parent, false);
            go.GetComponent<RectTransform>().sizeDelta = new Vector2(500, 80);
            go.GetComponent<Image>().color = Color.white;

            var textArea = new GameObject("TextArea", typeof(RectTransform), typeof(RectMask2D));
            textArea.transform.SetParent(go.transform, false);
            var textAreaRect = textArea.GetComponent<RectTransform>();
            textAreaRect.anchorMin = Vector2.zero;
            textAreaRect.anchorMax = Vector2.one;
            textAreaRect.offsetMin = new Vector2(10, 6);
            textAreaRect.offsetMax = new Vector2(-10, -6);

            var placeholderGo = CreateText(textArea.transform, "Placeholder", placeholder, 24);
            var placeholderTmp = placeholderGo.GetComponent<TextMeshProUGUI>();
            placeholderTmp.color = new Color(0.5f, 0.5f, 0.5f);
            placeholderTmp.alignment = TextAlignmentOptions.MidlineLeft;
            StretchFull(placeholderGo.GetComponent<RectTransform>());

            var textGo = CreateText(textArea.transform, "Text", "", 24);
            var textTmp = textGo.GetComponent<TextMeshProUGUI>();
            textTmp.alignment = TextAlignmentOptions.MidlineLeft;
            textTmp.color = Color.black;
            StretchFull(textGo.GetComponent<RectTransform>());

            var input = go.GetComponent<TMP_InputField>();
            input.textViewport = textAreaRect;
            input.textComponent = textTmp;
            input.placeholder = placeholderTmp;
            return go;
        }

        private static void StretchFull(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void LayoutVertical(GameObject[] items)
        {
            // Children are already parented with VerticalLayoutGroup on the panel;
            // this hook exists for readability at call sites and future spacing tweaks.
        }

        private static void SetPrivateField(object target, string fieldName, object value)
        {
            var type = target.GetType();
            var field = type.GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            if (field == null)
            {
                throw new Exception($"Field '{fieldName}' not found on {type.Name}");
            }
            field.SetValue(target, value);
        }
    }
}
