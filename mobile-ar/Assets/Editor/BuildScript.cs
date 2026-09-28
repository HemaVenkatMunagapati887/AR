using System;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace ArSafety.EditorTools
{
    /// <summary>
    /// Batchmode Android build entry point:
    /// Unity.exe -batchmode -projectPath &lt;path&gt; -executeMethod ArSafety.EditorTools.BuildScript.PerformAndroidBuild -quit
    /// </summary>
    public static class BuildScript
    {
        private const string PackageName = "com.jharkhand.safetytraining";
        private const string ProductName = "Jharkhand Safety Trainer";

        [MenuItem("AR Safety/Configure Android Player Settings")]
        public static void ConfigurePlayerSettings()
        {
            PlayerSettings.productName = ProductName;
            PlayerSettings.companyName = "SIH26041 Team";
            PlayerSettings.applicationIdentifier = PackageName;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29; // Android 10+
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
            PlayerSettings.SetScriptingBackend(BuildTargetGroup.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.colorSpace = ColorSpace.Linear;
            EditorUtility.SetDirty(null);
            Debug.Log("[BuildScript] Player settings configured for Android 10+ (API 29) target.");
        }

        [MenuItem("AR Safety/Build Android APK")]
        public static void PerformAndroidBuild()
        {
            ConfigurePlayerSettings();

            var scenes = new[] { "Assets/Scenes/Main.unity" };
            var outputDir = "Builds/Android";
            System.IO.Directory.CreateDirectory(outputDir);
            var outputPath = System.IO.Path.Combine(outputDir, "ARSafetyTrainer.apk");

            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = outputPath,
                target = BuildTarget.Android,
                options = BuildOptions.None,
            };

            var report = BuildPipeline.BuildPlayer(options);
            var summary = report.summary;

            Debug.Log($"[BuildScript] Build result: {summary.result}, size: {summary.totalSize} bytes, errors: {summary.totalErrors}");

            if (summary.result != BuildResult.Succeeded)
            {
                EditorApplication.Exit(1);
            }
        }
    }
}
