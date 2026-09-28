using System.Collections.Generic;
using System.IO;
using ArSafety.Data;
using Newtonsoft.Json;
using UnityEngine;

namespace ArSafety.Core
{
    /// <summary>
    /// File-based local persistence under Application.persistentDataPath so training,
    /// practice and assessment work with zero network connectivity. This is the
    /// single source of truth on-device; SyncManager pushes it to the backend
    /// opportunistically and never blocks the training flow on that push.
    /// </summary>
    public static class LocalStorage
    {
        private static string Root => Application.persistentDataPath;
        private static string ProfilePath => Path.Combine(Root, "profile.json");
        private static string ModulesDir => Path.Combine(Root, "modules");
        private static string AttemptsPath => Path.Combine(Root, "attempts.json");
        private static string CertificatesPath => Path.Combine(Root, "certificates.json");

        public static void SaveProfile(WorkerProfile profile)
        {
            File.WriteAllText(ProfilePath, JsonConvert.SerializeObject(profile));
        }

        public static WorkerProfile LoadProfile()
        {
            if (!File.Exists(ProfilePath)) return null;
            return JsonConvert.DeserializeObject<WorkerProfile>(File.ReadAllText(ProfilePath));
        }

        public static void ClearProfile()
        {
            if (File.Exists(ProfilePath)) File.Delete(ProfilePath);
        }

        public static void SaveModule(ModuleData module)
        {
            Directory.CreateDirectory(ModulesDir);
            var path = Path.Combine(ModulesDir, module.moduleId + ".json");
            File.WriteAllText(path, JsonConvert.SerializeObject(module));
        }

        public static ModuleData LoadModule(string moduleId)
        {
            var path = Path.Combine(ModulesDir, moduleId + ".json");
            if (!File.Exists(path)) return null;
            return JsonConvert.DeserializeObject<ModuleData>(File.ReadAllText(path));
        }

        public static List<ModuleData> LoadAllModules()
        {
            var result = new List<ModuleData>();
            if (!Directory.Exists(ModulesDir)) return result;
            foreach (var file in Directory.GetFiles(ModulesDir, "*.json"))
            {
                result.Add(JsonConvert.DeserializeObject<ModuleData>(File.ReadAllText(file)));
            }
            return result;
        }

        public static List<AttemptRecord> LoadAttempts()
        {
            if (!File.Exists(AttemptsPath)) return new List<AttemptRecord>();
            return JsonConvert.DeserializeObject<List<AttemptRecord>>(File.ReadAllText(AttemptsPath))
                   ?? new List<AttemptRecord>();
        }

        public static void SaveAttempts(List<AttemptRecord> attempts)
        {
            File.WriteAllText(AttemptsPath, JsonConvert.SerializeObject(attempts));
        }

        public static void AppendAttempt(AttemptRecord attempt)
        {
            var attempts = LoadAttempts();
            attempts.Add(attempt);
            SaveAttempts(attempts);
        }

        public static List<CertificateRecord> LoadCertificates()
        {
            if (!File.Exists(CertificatesPath)) return new List<CertificateRecord>();
            return JsonConvert.DeserializeObject<List<CertificateRecord>>(File.ReadAllText(CertificatesPath))
                   ?? new List<CertificateRecord>();
        }

        public static void SaveCertificates(List<CertificateRecord> certificates)
        {
            File.WriteAllText(CertificatesPath, JsonConvert.SerializeObject(certificates));
        }

        public static void AppendCertificate(CertificateRecord cert)
        {
            var certs = LoadCertificates();
            certs.RemoveAll(c => c.certificateId == cert.certificateId);
            certs.Add(cert);
            SaveCertificates(certs);
        }
    }
}
