# Backend API Reference

Base URL: `http://localhost:5000/api` (dev) — set `VITE_API_BASE_URL` / the Unity `ApiClient.baseUrl` for other environments.

All authenticated routes require `Authorization: Bearer <token>` from `/auth/login`.

## Auth

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{ name, workerId, password, phone?, sector?, language? }` | Creates a `worker` role account |
| POST | `/auth/login` | none | `{ workerId, password }` | Returns `{ token, user }` |
| GET | `/auth/me` | worker/admin | — | Returns the current user |

## Modules

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/modules` | worker/admin | List active modules, optional `?sector=Mining`. Strips answer key. |
| GET | `/modules/:id` | worker/admin | Single module with questions/options, **no** `correctAnswer`/`explanation` — used by the online training screen. |
| GET | `/modules/:id/full` | admin only | Full module including answer key, for content review. |

## Attempts

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/attempts` | worker | `{ moduleId, answers[], durationSeconds?, clientAttemptId? }` | Server re-scores via `scoring.js`; `clientAttemptId` makes retries idempotent. |
| GET | `/attempts/:userId` | worker (self) / admin | — | Attempt history. |

## Certificates

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/certificates` | worker | `{ attemptId }` (server attempt id, must belong to caller and be `passed`). Assigns sequential `JH-SAFE-YYYY-NNNNN` id. |
| GET | `/certificates/:id` | worker/admin | Returns certificate + a freshly generated `qrDataUrl` (base64 PNG). |
| GET | `/certificates/verify/:id` | **public, no auth** | `{ valid, workerName, moduleName, score, status, issuedAt }` or `{ valid: false }`. This is what the QR code links to. |

## Admin

All require an `admin`-role JWT.

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | Aggregate compliance counters for the Overview dashboard. |
| GET | `/admin/workers` | All worker accounts. |
| GET | `/admin/attempts` | Most recent 500 attempts, populated with worker name/sector. |
| GET | `/admin/certificates` | All certificates, populated with worker name/sector. |

## Sync (offline-first)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/sync/results` | worker | `{ attempts: AttemptRecord[] }` | Batch-idempotent via each item's `clientAttemptId`; returns per-item `accepted` / `duplicate` / `error`. |

## Error shape

Every error response is `{ "error": "<message>" }` with an appropriate HTTP status code (400/401/403/404/409/500).
