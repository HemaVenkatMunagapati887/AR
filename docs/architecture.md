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
   │  Unity Android App  │                          │  React Admin Dashboard  │
   │  mobile-ar/          │                          │  admin-dashboard/         │
   │  - AR Foundation/     │                          │  - compliance overview     │
   │    ARCore              │                          │  - workers / modules        │
   │  - offline-first local │                          │  - attempts / certificates   │
   │    storage + sync queue │                          │  - public /verify/:id page    │
   └────────────────────────┘                          └──────────────────────────────┘
```

## Why this split

- **Backend is the single source of truth** for certificate numbering (sequential, collision-free `JH-SAFE-YYYY-NNNNN` IDs), scoring verification, and compliance reporting — a worker's device can score itself offline for immediate feedback, but a certificate is only ever issued once the backend has recorded the passing attempt.
- **The Unity app never blocks on the network.** `AssessmentEngine.cs` (C#) is a line-for-line mirror of `backend/src/utils/scoring.js` so training, guided/independent practice, and the formal assessment all work fully offline; `SyncManager.cs` pushes results opportunistically and idempotently (via a client-generated `clientAttemptId`) once connectivity returns.
- **The admin dashboard and the QR verification page share one API** — verification is a public, unauthenticated endpoint (`GET /api/certificates/verify/:id`) precisely so a QR code can be scanned and checked by anyone (an inspector, DGMS, another employer) without needing dashboard credentials.

## Modularity for future safety domains

Adding a third module (e.g. "Machinery Safety") requires:
1. A new `ModuleData` document seeded on the backend (`backend/src/seed/<name>.data.js`) — no backend code changes, since `/api/attempts` and `/api/modules` are already generic over `moduleId`.
2. A new `TrainingFlowController` subclass in Unity (see `FireModuleFlow.cs` / `GasModuleFlow.cs`) that only implements module-specific AR placement and hint text — phase sequencing, scoring, certificate issuance, and offline sync are inherited, not duplicated.
3. New localization keys in `en.json` / `hi.json` / `sat.json` for that module's learning slides.

No shared engine code (scoring, sync, certificate, admin dashboard, verification) needs to change.

## Data flow: one assessment attempt

1. Worker completes Learn → Guided Practice → Independent Practice in AR (client-only, no network required).
2. Worker takes the Assessment (mixed mcq/ordering/ar_task questions) — `AssessmentEngine.Score()` grades it on-device immediately using the offline module bundle (which includes the answer key, unlike the online training endpoint).
3. The graded `AttemptRecord` is written to local JSON (`Application.persistentDataPath/attempts.json`) with `pendingSync = true`.
4. `SyncManager` checks `/api/health` periodically (and immediately after a submit); when reachable, it POSTs the pending batch to `/api/sync/results`, which re-scores server-side (never trusts the client score) and returns each attempt's server `_id`.
5. If the attempt passed, the app calls `POST /api/certificates` with that server attempt id; the backend assigns the next sequential certificate ID and generates a QR PNG whose payload is a verification URL (no PII in the QR itself).
6. The admin dashboard and the public `/verify/:certId` page both read this same certificate record.
