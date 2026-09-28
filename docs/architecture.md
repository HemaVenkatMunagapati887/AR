# Architecture — AR Vocational Safety Training Platform (SIH 26041)

## System overview

```
                         ┌────────────────────────┐
                         │   MongoDB (Atlas/local) │
                         └────────────▲────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │  Node.js / Express API   │
                         │  backend/                │
                         │  - auth (JWT)             │
                         │  - modules + questions     │
                         │  - attempts + scoring      │
                         │  - certificates + QR        │
                         │  - admin stats             │
                         │  - offline sync             │
                         └──────▲─────────────▲─────┘
                                │             │
              REST (JWT)        │             │  REST (JWT) + public /verify
                                │             │
              ┌─────────────────┘             └─────────────────┐
   ┌──────────┴─────────┐                          ┌────────────┴───────────┐
   │ React Native AR App │                          │  React Admin Dashboard  │
   │  mobile-app/          │                          │  admin-dashboard/         │
   │  - ViroReact/ARCore     │                          │  - compliance overview     │
   │  - offline-first local │                          │  - workers / modules        │
   │    storage + sync queue │                          │  - attempts / certificates   │
   └────────────────────────┘                          │  - public /verify/:id page    │
                                                          └──────────────────────────────┘
```

## Why this split

- **Backend is the single source of truth** for certificate numbering (sequential, collision-free `JH-SAFE-YYYY-NNNNN` IDs), scoring verification, and compliance reporting — a worker's device can score itself offline for immediate feedback, but a certificate is only ever issued once the backend has recorded the passing attempt.
- **The mobile app never blocks on the network.** `mobile-app/src/assessment/assessmentEngine.ts` is a line-for-line port of `backend/src/utils/scoring.js` so training, guided/independent practice, and the formal assessment all work fully offline; `src/storage/syncManager.ts` pushes results opportunistically and idempotently (via a client-generated `clientAttemptId`) once connectivity returns.
- **The admin dashboard and the QR verification page share one API** — verification is a public, unauthenticated endpoint (`GET /api/certificates/verify/:id`) precisely so a QR code can be scanned and checked by anyone (an inspector, DGMS, another employer) without needing dashboard credentials.

## Modularity for future safety domains

Adding a third module (e.g. "Machinery Safety") requires:
1. A new `ModuleData` document seeded on the backend (`backend/src/seed/<name>.data.js`) — no backend code changes, since `/api/attempts` and `/api/modules` are already generic over `moduleId`.
2. A new entry in `mobile-app/src/ar/moduleConfig.ts` (a `ModuleArConfig`: which AR objects to spawn, their colours/positions, and which question is graded via an AR tap) — `ARTrainingScene.tsx` and `TrainingFlowContext.tsx` are shared by every module and need no changes.
3. New localization keys in `en.json` / `hi.json` / `sat.json` for that module's learning slides.

No shared engine code (scoring, sync, certificate, admin dashboard, verification, the AR scene component itself) needs to change.

## Mobile app structure (`mobile-app/src/`)

| Folder | Responsibility |
|---|---|
| `types/models.ts` | TypeScript mirrors of the backend Mongoose schemas |
| `api/client.ts` | Axios wrapper over every backend REST route |
| `storage/localStorage.ts` | AsyncStorage-backed offline persistence (profile, module bundles, attempts, certificates) |
| `storage/syncManager.ts` | Connectivity polling + idempotent offline-sync push |
| `assessment/assessmentEngine.ts` | On-device scoring, mirrors `backend/src/utils/scoring.js` |
| `assessment/AssessmentOverlay.tsx` | UI-driven mcq/ordering questions; defers `ar_task` questions to the AR scene |
| `localization/` | `LocalizationContext` + `en.json`/`hi.json`/`sat.json` string tables |
| `ar/moduleConfig.ts` | Per-module AR object/scenario data (see "Modularity" above) |
| `ar/TrainingFlowContext.tsx` | Phase state machine: Introduction → Learning → ArCalibration → GuidedPractice → IndependentPractice → Assessment → Result → Certificate |
| `ar/ARTrainingScene.tsx` | The single ViroReact `ViroARScene` used by every module, driven by `moduleConfig.ts` |
| `session/SessionContext.tsx` | Login/logout, module fetch, certificate issuance |
| `screens/` | The 13 worker-app screens, each a thin view over the contexts above |
| `navigation/RootNavigator.tsx` | React Navigation native-stack wiring |

## Data flow: one assessment attempt

1. Worker completes Learn → Guided Practice → Independent Practice in AR (client-only, no network required).
2. Worker takes the Assessment (mixed mcq/ordering/ar_task questions) — `assessmentEngine.scoreAttempt()` grades it on-device immediately using the offline module bundle (which includes the answer key, unlike the online training endpoint).
3. The graded `AttemptRecord` is written to AsyncStorage with `pendingSync = true`.
4. `syncManager.trySyncNow()` checks `/api/health` periodically (and immediately after a submit); when reachable, it POSTs the pending batch to `/api/sync/results`, which re-scores server-side (never trusts the client score) and returns each attempt's server `_id`.
5. If the attempt passed, the app calls `POST /api/certificates` with that server attempt id; the backend assigns the next sequential certificate ID and generates a QR PNG whose payload is a verification URL (no PII in the QR itself).
6. The admin dashboard and the public `/verify/:certId` page both read this same certificate record.
