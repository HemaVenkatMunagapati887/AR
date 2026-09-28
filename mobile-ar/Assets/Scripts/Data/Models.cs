using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace ArSafety.Data
{
    // Mirrors the backend's localizedStringSchema (backend/src/models/Module.js)
    [Serializable]
    public class LocalizedString
    {
        public string en;
        public string hi;
        public string sat;

        public string Get(string languageCode)
        {
            switch (languageCode)
            {
                case "hi": return string.IsNullOrEmpty(hi) ? en : hi;
                case "sat": return string.IsNullOrEmpty(sat) ? en : sat;
                default: return en;
            }
        }
    }

    [Serializable]
    public class QuestionOption
    {
        public string en;
        public string hi;
        public string sat;
    }

    [Serializable]
    public class QuestionData
    {
        public string questionId;
        public string questionType; // mcq | scenario | ordering | ar_task
        public LocalizedString question;
        public List<LocalizedString> options;
        public LocalizedString explanation;
        public int points = 10;

        // Only present on the admin/full endpoint or bundled offline package —
        // the training endpoint strips this so a device can't read the answer key
        // over the wire, but the offline bundle ships it for local scoring.
        public object correctAnswer;
    }

    [Serializable]
    public class ModuleData
    {
        public string moduleId;
        public LocalizedString name;
        public LocalizedString description;
        public string category;
        public List<string> sectors;
        public int version = 1;
        public bool active = true;
        public int passThreshold = 70;
        public List<QuestionData> questions;
    }

    [Serializable]
    public class AnswerRecord
    {
        public string questionId;
        public object selected;
        public bool correct;
    }

    [Serializable]
    public class AttemptRecord
    {
        public string clientAttemptId;
        public string moduleId;
        public List<AnswerRecord> answers = new List<AnswerRecord>();
        public int score;
        public int maxScore;
        public int percentage;
        public bool passed;
        public List<string> mistakes = new List<string>();
        public int durationSeconds;
        [JsonProperty("takenAt")]
        public string takenAtIso;
        public bool pendingSync = true;
        [JsonProperty("_id")]
        public string serverAttemptId; // filled in once synced (mirrors backend Attempt._id)
    }

    [Serializable]
    public class CertificateRecord
    {
        public string certificateId;
        public string moduleId;
        public int percentage;
        public string status;
        [JsonProperty("issuedAt")]
        public string issuedAtIso;
        public string qrPayloadUrl;
        public bool qrReady; // true once the QR image has been fetched from the server
    }

    [Serializable]
    public class WorkerProfile
    {
        public string id;
        public string name;
        public string workerId;
        public string sector;
        public string language = "en";
        public string role = "worker";
        public string authToken;
    }
}
