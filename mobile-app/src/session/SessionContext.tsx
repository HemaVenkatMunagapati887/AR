import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AttemptRecord, CertificateRecord, ModuleData, WorkerProfile } from '../types/models';
import * as Api from '../api/client';
import * as LocalStore from '../storage/localStorage';

interface SessionContextValue {
  worker: WorkerProfile | null;
  lastIssuedCertificate: CertificateRecord | null;
  login: (workerId: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadModules: () => Promise<ModuleData[]>;
  selectModuleForTraining: (moduleId: string) => Promise<ModuleData | null>;
  issueCertificateForAttempt: (attempt: AttemptRecord) => Promise<CertificateRecord | null>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [lastIssuedCertificate, setLastIssuedCertificate] = useState<CertificateRecord | null>(null);

  const login = useCallback(async (workerId: string, password: string) => {
    try {
      const { token, user } = await Api.login(workerId, password);
      const profile: WorkerProfile = {
        id: user.id,
        name: user.name,
        workerId: user.workerId,
        sector: user.sector,
        language: user.language,
        role: user.role,
        authToken: token,
      };
      await LocalStore.saveProfile(profile);
      setWorker(profile);
      return { ok: true };
    } catch (err: any) {
      // Offline fallback: allow re-entry with a cached profile matching this
      // worker ID so training never depends on a live connection.
      const cached = await LocalStore.loadProfile();
      if (cached && cached.workerId.toUpperCase() === workerId.toUpperCase()) {
        setWorker(cached);
        return { ok: true };
      }
      return { ok: false, error: err?.response?.data?.error ?? 'login_error' };
    }
  }, []);

  const logout = useCallback(async () => {
    await LocalStore.clearProfile();
    setWorker(null);
  }, []);

  const loadModules = useCallback(async (): Promise<ModuleData[]> => {
    const cached = await LocalStore.loadAllModules();
    if (!worker) return cached;
    try {
      const modules = await Api.getModules(worker.authToken);
      return modules as ModuleData[];
    } catch {
      return cached;
    }
  }, [worker]);

  const selectModuleForTraining = useCallback(
    async (moduleId: string): Promise<ModuleData | null> => {
      const cached = await LocalStore.loadModule(moduleId);
      if (!worker) return cached;
      try {
        const module = (await Api.getModuleOfflineBundle(moduleId, worker.authToken)) as ModuleData;
        await LocalStore.saveModule(module);
        return module;
      } catch {
        return cached;
      }
    },
    [worker]
  );

  const issueCertificateForAttempt = useCallback(
    async (attempt: AttemptRecord): Promise<CertificateRecord | null> => {
      if (!worker || !attempt.passed || !attempt.serverAttemptId) return null;
      try {
        const cert = (await Api.issueCertificate(attempt.serverAttemptId, worker.authToken)) as CertificateRecord;
        await LocalStore.appendCertificate(cert);
        setLastIssuedCertificate(cert);
        return cert;
      } catch {
        return null;
      }
    },
    [worker]
  );

  const value = useMemo(
    () => ({ worker, lastIssuedCertificate, login, logout, loadModules, selectModuleForTraining, issueCertificateForAttempt }),
    [worker, lastIssuedCertificate, login, logout, loadModules, selectModuleForTraining, issueCertificateForAttempt]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
