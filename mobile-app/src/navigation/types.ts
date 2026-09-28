export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Login: undefined;
  Home: undefined;
  ModuleIntro: { moduleId: string };
  LearningContent: undefined;
  // Hosts one persistent ViroARSceneNavigator across calibration, guided
  // practice, independent practice, and the assessment's ar_task question —
  // the overlay UI changes with TrainingFlowContext.phase, but the AR session
  // itself is never torn down and remounted between those phases.
  ArExperience: undefined;
  Result: undefined;
  Certificate: undefined;
  CertificateQr: undefined;
  History: undefined;
  Verify: { certificateId: string };
};
