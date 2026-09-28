namespace ArSafety.AR
{
    /// <summary>
    /// The mandatory pedagogical sequence from the PS brief:
    /// LEARN -> GUIDED PRACTICE -> INDEPENDENT PRACTICE -> ASSESSMENT -> CERTIFICATION.
    /// A worker can never skip straight from Introduction to Assessment.
    /// </summary>
    public enum TrainingPhase
    {
        Introduction,
        Learning,
        ArCalibration,
        GuidedPractice,
        IndependentPractice,
        Assessment,
        Result,
        Certificate,
    }
}
