import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttemptRecord, CertificateRecord, ModuleData, WorkerProfile } from '../types/models';

// Offline-first local persistence. This is the single source of truth on the
// device — training, practice, and assessment all read/write here and never
// block on the network; SyncManager pushes it to the backend opportunistically.
const KEYS = {
  profile: 'profile',
  modulePrefix: 'module:',
  attempts: 'attempts',
  certificates: 'certificates',
};

export async function saveProfile(profile: WorkerProfile) {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export async function loadProfile(): Promise<WorkerProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export async function clearProfile() {
  await AsyncStorage.removeItem(KEYS.profile);
}

export async function saveModule(module: ModuleData) {
  await AsyncStorage.setItem(KEYS.modulePrefix + module.moduleId, JSON.stringify(module));
}

export async function loadModule(moduleId: string): Promise<ModuleData | null> {
  const raw = await AsyncStorage.getItem(KEYS.modulePrefix + moduleId);
  return raw ? JSON.parse(raw) : null;
}

export async function loadAllModules(): Promise<ModuleData[]> {
  const keys = await AsyncStorage.getAllKeys();
  const moduleKeys = keys.filter((k: string) => k.startsWith(KEYS.modulePrefix));
  if (moduleKeys.length === 0) return [];
  const values = await AsyncStorage.getMany(moduleKeys);
  return Object.values(values)
    .map((value) => (value ? (JSON.parse(value) as ModuleData) : null))
    .filter((m): m is ModuleData => m !== null);
}

export async function loadAttempts(): Promise<AttemptRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.attempts);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAttempts(attempts: AttemptRecord[]) {
  await AsyncStorage.setItem(KEYS.attempts, JSON.stringify(attempts));
}

export async function appendAttempt(attempt: AttemptRecord) {
  const attempts = await loadAttempts();
  attempts.push(attempt);
  await saveAttempts(attempts);
}

export async function loadCertificates(): Promise<CertificateRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.certificates);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCertificates(certs: CertificateRecord[]) {
  await AsyncStorage.setItem(KEYS.certificates, JSON.stringify(certs));
}

export async function appendCertificate(cert: CertificateRecord) {
  const certs = (await loadCertificates()).filter((c) => c.certificateId !== cert.certificateId);
  certs.push(cert);
  await saveCertificates(certs);
}
