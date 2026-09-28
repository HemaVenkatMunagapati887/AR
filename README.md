# AR-Based Vocational Training Simulator for Industrial Safety (Jharkhand)

Smart India Hackathon — Problem Statement **26041** · Government of Jharkhand, Department of Higher & Technical Education · Theme: Smart Education

## 1. Problem Statement

Jharkhand's mining, steel, and mica sectors employ many young, first-time industrial workers with minimal safety orientation. Classroom manuals show under-20% one-week retention; live drills are disruptive; VR headsets are inaccessible to small mines and contract workers. DGMS Dhanbad recorded 48 fatal mine accidents in Jharkhand in 2022–23, many involving workers with under 30 days of orientation. No standardised, regional-language digital training-and-certification platformPS C:\Users\venky\OneDrive\Desktop\AR\backend> npm run seed
>> npm start
>> 

> ar-safety-backend@1.0.0 seed
> node src/seed/seed.js

[db] connected to mongodb://127.0.0.1:27017/ar-safety
[seed] Modules seeded: fire-explosion, gas-confined-space
[seed] Admin already exists, skipping
[seed] Demo worker already exists, skipping  
[seed] Done.

> ar-safety-backend@1.0.0 start
> node src/server.js

[db] connected to mongodb://127.0.0.1:27017/ar-safety
node:events:486
      throw er; // Unhandled 'error' event   
      ^

Error: listen EADDRINUSE: address already in use :::5000
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)    
    at Server.listen (node:net:2102:7)       
    at app.listen (C:\Users\venky\OneDrive\Desktop\AR\backend\node_modules\express\lib\application.js:635:24)
    at C:\Users\venky\OneDrive\Desktop\AR\backend\src\server.js:9:9
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)        
Emitted 'error' event on Server instance at: 
    at emitErrorNT (node:net:1976:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21) {      
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 5000
}

Node.js v24.12.0 currently exists.

## 2. Problem Understanding

The core gap is not a lack of safety rules — it's that training doesn't teach, verify comprehension, or work where workers actually are (a mid-range Android phone, often offline, often not in English/Hindi). A solution needs to: teach before testing, run on ordinary phones without a headset, work offline, support regional languages, and produce a certificate that can actually be verified rather than just printed.

## 3. Proposed Solution

A mobile AR training-and-certification app (React Native + ViroReact/ARCore) covering two complete safety domains for this MVP — **Fire & Explosion Response** and **Gas Leak & Confined Space Protocol** — with a Node/Express/MongoDB backend and a React compliance dashboard. Every module follows a strict **Learn → Guided Practice → Independent Practice → Assessment → Certification** pedagogy; training and assessment work fully offline; passing generates a QR-verifiable certificate.

## 4. Key Features

- Real AR (camera feed, plane detection, tap-to-place virtual hazards/exits/PPE) — not a video or animation.
- Two complete training modules with a shared, reusable assessment engine (mcq / ordering / ar_task question types).
- Offline-first: local scoring, local certificate queueing, background sync with retry.
- Hindi localization; Santali localization in draft (see `docs/localization-review.md`).
- QR certificate generation and a public, unauthenticated verification page/API.
- Web admin dashboard: worker roster, module completion, assessment results, certificates, compliance overview.

## 5. Architecture

See `docs/architecture.md` for the full diagram and data-flow walkthrough.

## 6. Technology Stack

| Layer | Stack |
|---|---|
| Mobile / AR | React Native 0.86 (TypeScript, new architecture/Fabric), `@reactvision/react-viro` (ViroReact) over ARCore |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Admin dashboard | React (Vite), Tailwind CSS, React Router |
| Certificates | `qrcode` (server-generated PNG), sequential certificate IDs |
| Offline storage | `@react-native-async-storage/async-storage` (JSON blobs), sync queue |

## 7. AR Workflow

Camera opens via `ViroARSceneNavigator` → `ViroARPlaneSelector` detects a real horizontal surface and the worker taps it → module-specific primitives (hazard, extinguisher/PPE options, exit/hazard-zone markers), defined in `src/ar/moduleConfig.ts`, spawn at that point → tapping an object fires `onClick` in `ARTrainingScene.tsx`, which `TrainingFlowContext` routes to hint feedback (Guided Practice), silent feedback (Independent Practice), or a recorded assessment answer (Assessment, no feedback shown).

## 8. Fire & Explosion Module

Concepts: hazard recognition, extinguisher selection (PASS technique, matching extinguisher type to fire class), emergency exit identification, evacuation sequencing. See `backend/src/seed/fireModule.data.js` for the full question bank and `mobile-app/src/ar/moduleConfig.ts` (`FIRE_MODULE_AR_CONFIG`) for the AR object/interaction mapping.

## 9. Gas Leak & Confined Space Module

Concepts: atmosphere testing before entry, buddy/attendant system, PPE selection (respiratory protection), hazard-zone boundary recognition. See `backend/src/seed/gasModule.data.js` and `mobile-app/src/ar/moduleConfig.ts` (`GAS_MODULE_AR_CONFIG`).

## 10. Assessment Engine

One reusable engine, not per-question hardcoding: `backend/src/utils/scoring.js` (server, source of truth) and `mobile-app/src/assessment/assessmentEngine.ts` (on-device mirror for offline scoring) both grade any module's `mcq` / `ordering` / `ar_task` questions against a `correctAnswer` via deep equality. Adding a new safety domain means adding module + question data (plus one `ModuleArConfig` entry for its AR objects), not new scoring or scene code.

## 11. Offline Architecture

Training and assessment never call the network. `src/storage/localStorage.ts` persists the worker profile, the offline module bundle (with answer key, fetched once from `/api/modules/:id/offline-bundle`), attempts (`pendingSync` flag), and certificates in AsyncStorage. `src/storage/syncManager.ts` polls `/api/health` every 15s (and immediately after a submit), and on reachability pushes pending attempts to `/api/sync/results`, which is idempotent per `clientAttemptId` so a retried sync never double-counts. See `docs/architecture.md` for the full sequence.

## 12. Certification

On a passing attempt, once synced, the app requests `POST /api/certificates`; the backend assigns a sequential `JH-SAFE-<year>-<00001>` ID (server-side, to guarantee uniqueness) and returns a QR PNG whose payload is a verification URL — no worker PII is embedded in the QR itself.

## 13. QR Verification

`GET /api/certificates/verify/:id` is public and unauthenticated by design, since a QR scan needs to work for anyone (an inspector, another employer) without dashboard credentials. The admin dashboard's `/verify/:certId` page and the mobile app's certificate screen both call this same endpoint.

## 14. Admin Dashboard

React + Tailwind SPA: Overview (compliance rate, pass/fail counts), Workers, Training Modules, Assessment Results, Certificates (with a link into the same public verification page), and a manual Certificate Verification lookup.

## 15. Localization

`en` / `hi` / `sat` JSON tables under `mobile-app/src/localization/strings/` drive every UI string via `LocalizationContext`; module/question content is localized directly in the Module schema (`{ en, hi, sat }` per string). Santali is currently **draft, romanized, and flagged in-app** — see `docs/localization-review.md` for what's needed before real deployment.

## 16–20. Installation, Backend Setup, Android Build, Admin Setup, Environment Variables

See `docs/setup.md` for the full step-by-step guide.

## 21. Demo Instructions

See `docs/demo-script.md` for a 3–5 minute walkthrough script covering both modules, the admin dashboard, and the offline/sync demo.

## 22. Screenshots

_Add screenshots/recordings here once the APK is built and the dashboard is running — see `docs/demo-script.md` for the shot list._

## 23. Team Contribution

| Area | Suggested owner |
|---|---|
| React Native AR — Fire module | Member 1 |
| React Native AR — Gas module | Member 2 |
| React Native UI / navigation / localization wiring | Member 3 |
| Backend (Node/Express/MongoDB) | Member 4 |
| Admin dashboard + verification page | Member 5 |
| Training content, QA, integration, demo, docs | Member 6 |

## 24. Future Enhancements

- Machinery Safety module (third domain — see `docs/architecture.md` §"Modularity" for exactly what to add).
- Native-speaker-reviewed Santali in Ol Chiki script.
- Push-based sync (instead of polling) once a message broker is justified by real scale.
- Richer 3D assets once functionality is fully validated (explicitly deprioritized for this MVP per the brief).

## 25. Repository Structure

```
/backend           Node/Express/MongoDB API
/admin-dashboard    React/Tailwind compliance dashboard + public verification page
/mobile-app          React Native (TypeScript) + ViroReact/ARCore worker app
/docs                 Architecture, API, database, setup, demo docs
```

## 26. Disclaimer

This is a hackathon training-simulation prototype built for Smart India Hackathon Problem Statement 26041. It is **not** an official government safety certification system, and the certificates it issues are not a substitute for official industrial safety certification or professional instruction under the Factories Act, 1948 or the Mines Act, 1952. Safety content is based on recognized general safety guidance (extinguisher/PASS technique, confined-space entry/buddy-system principles) and is presented as simulated training scenarios, not exhaustive official procedure.
