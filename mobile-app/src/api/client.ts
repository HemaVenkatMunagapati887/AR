import axios, { AxiosInstance } from 'axios';
import { AttemptRecord } from '../types/models';

// Android emulator -> host machine loopback. Override at runtime via
// setBaseUrl() for a physical device on the same Wi-Fi as the backend
// (see docs/setup.md in the repo root).
const DEFAULT_BASE_URL = 'http://10.27.82.78:5000/api';

let baseUrl = DEFAULT_BASE_URL;
let client: AxiosInstance = axios.create({ baseURL: baseUrl, timeout: 8000 });

export function setBaseUrl(url: string) {
  baseUrl = url;
  client = axios.create({ baseURL: baseUrl, timeout: 8000 });
}

export function getBaseUrl() {
  return baseUrl;
}

function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await client.get('/health', { timeout: 4000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function login(workerId: string, password: string) {
  const res = await client.post('/auth/login', { workerId, password });
  return res.data as { token: string; user: any };
}

export async function getModules(token: string) {
  const res = await client.get('/modules', { headers: authHeader(token) });
  return res.data.modules as any[];
}

export async function getModuleForTraining(moduleId: string, token: string) {
  const res = await client.get(`/modules/${moduleId}`, { headers: authHeader(token) });
  return res.data.module;
}

// Includes the answer key — see backend/src/controllers/module.controller.js's
// getModuleOfflineBundle for why this is intentionally worker-accessible.
export async function getModuleOfflineBundle(moduleId: string, token: string) {
  const res = await client.get(`/modules/${moduleId}/offline-bundle`, { headers: authHeader(token) });
  return res.data.module;
}

export async function submitAttempt(attempt: AttemptRecord, token: string) {
  const res = await client.post(
    '/attempts',
    {
      moduleId: attempt.moduleId,
      clientAttemptId: attempt.clientAttemptId,
      durationSeconds: attempt.durationSeconds,
      answers: attempt.answers,
    },
    { headers: authHeader(token) }
  );
  return res.data.attempt;
}

export async function syncResults(attempts: AttemptRecord[], token: string) {
  const res = await client.post('/sync/results', { attempts }, { headers: authHeader(token) });
  return res.data as { accepted: number; duplicate: number; results: any[] };
}

export async function issueCertificate(attemptId: string, token: string) {
  const res = await client.post('/certificates', { attemptId }, { headers: authHeader(token) });
  return res.data.certificate;
}

export async function getCertificate(certificateId: string, token: string) {
  const res = await client.get(`/certificates/${certificateId}`, { headers: authHeader(token) });
  return res.data as { certificate: any; qrDataUrl: string };
}

export async function verifyCertificate(certificateId: string) {
  const res = await client.get(`/certificates/verify/${certificateId}`);
  return res.data;
}
