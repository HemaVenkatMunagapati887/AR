namespace ArSafety.UI
{
    // The 16 required worker-app screens (see project README / SIH brief).
    public enum AppScreen
    {
        Splash,
        LanguageSelect,
        Login,
        Home,
        ModuleIntro,
        LearningContent,
        ArCalibration,
        ArTraining,       // guided + independent practice share the AR scene view
        Assessment,
        Result,
        Certificate,
        CertificateQr,
        History,
    }
}
