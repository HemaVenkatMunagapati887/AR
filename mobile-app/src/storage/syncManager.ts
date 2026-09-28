import NetInfo from '@react-native-community/netinfo';
import * as LocalStore from './localStorage';
import * as Api from '../api/client';

/**
 * Implements the offline-first contract from the SIH brief: local result
 * first (pendingSync = true), then opportunistic POST to /api/sync/results
 * when connectivity returns. Idempotent per clientAttemptId, so a retried
 * sync never double-counts an attempt.
 */

type Listener = () => void;
const listeners = new Set<Listener>();
let isOnline = false;
let pendingCount = 0;
let syncing = false;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

export function getStatus() {
  return { isOnline, pendingCount };
}

export async function refreshPendingCount() {
  const attempts = await LocalStore.loadAttempts();
  pendingCount = attempts.filter((a) => a.pendingSync).length;
  notify();
}

export async function trySyncNow(): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    const netState = await NetInfo.fetch();
    const reachable = !!netState.isConnected;
    if (!reachable) {
      isOnline = false;
      notify();
      return;
    }

    const healthy = await Api.checkHealth();
    isOnline = healthy;
    notify();
    if (!healthy) return;

    const profile = await LocalStore.loadProfile();
    if (!profile) return;

    const attempts = await LocalStore.loadAttempts();
    const pending = attempts.filter((a) => a.pendingSync);
    if (pending.length === 0) return;

    const response = await Api.syncResults(pending, profile.authToken);
    for (const r of response.results) {
      if (r.status === 'accepted' || r.status === 'duplicate') {
        const match = attempts.find((a) => a.clientAttemptId === r.clientAttemptId);
        if (match) {
          match.pendingSync = false;
          match.serverAttemptId = r.attemptId;
        }
      }
    }
    await LocalStore.saveAttempts(attempts);
    await refreshPendingCount();
  } catch {
    // Swallow — the attempt stays pendingSync and will retry on the next tick.
  } finally {
    syncing = false;
  }
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startBackgroundSync(intervalMs = 15000) {
  if (intervalHandle) return;
  refreshPendingCount();
  trySyncNow();
  intervalHandle = setInterval(trySyncNow, intervalMs);

  NetInfo.addEventListener((state) => {
    if (state.isConnected) trySyncNow();
  });
}

export function stopBackgroundSync() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
