# Database Schema (MongoDB)

## `users`
| Field | Type | Notes |
|---|---|---|
| name | String | |
| workerId | String, unique, uppercased | Login identifier |
| passwordHash | String | bcrypt |
| phone | String | optional |
| sector | Enum: Mining / Steel / Mica / Other | |
| language | Enum: en / hi / sat | Preferred UI language |
| role | Enum: worker / admin | |

## `modules`
| Field | Type | Notes |
|---|---|---|
| moduleId | String, unique | e.g. `fire-explosion`, `gas-confined-space` |
| name / description | `{ en, hi, sat }` | Localized strings |
| category | String | |
| sectors | String[] | Which sectors this module applies to |
| version | Number | Bump when question content changes |
| active | Boolean | |
| passThreshold | Number | Percentage required to pass |
| questions | Question[] | Embedded (see below) — kept embedded rather than a separate collection since questions are always read/written as a whole module bundle (never queried independently), and the offline client needs the entire set in one document anyway |

### Embedded `question`
| Field | Type | Notes |
|---|---|---|
| questionId | String | e.g. `fire-q1` |
| questionType | Enum: mcq / scenario / ordering / ar_task | |
| question / explanation | `{ en, hi, sat }` | |
| options | `{ en, hi, sat }[]` | |
| correctAnswer | Mixed | `number` for mcq, `number[]` for ordering, `number` (tag index) for ar_task |
| points | Number | |

## `attempts`
| Field | Type | Notes |
|---|---|---|
| clientAttemptId | String, indexed | Set by the Unity client; used for idempotent sync |
| userId | ObjectId → users | |
| moduleId | String | |
| answers | `{ questionId, selected, correct }[]` | Graded server-side, never trusts client-computed `correct` |
| score / maxScore / percentage | Number | |
| passed | Boolean | |
| mistakes | String[] | questionIds answered incorrectly |
| durationSeconds | Number | |
| syncedFromOffline | Boolean | True if it arrived via `/sync/results` rather than `/attempts` |
| takenAt | Date | When the worker actually completed it (may be in the past for offline syncs) |

## `certificates`
| Field | Type | Notes |
|---|---|---|
| certificateId | String, unique | `JH-SAFE-<year>-<00001>`, sequential per year |
| userId | ObjectId → users | |
| attemptId | ObjectId → attempts | |
| moduleId | String | |
| score / percentage | Number | |
| status | Enum: VALID / REVOKED | |
| issuedAt | Date | |
| qrPayloadUrl | String | The verification URL encoded in the QR — contains only `certificateId`, no PII |

## `sync_logs`
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId → users | |
| attemptsReceived / attemptsAccepted / attemptsDuplicate | Number | For debugging sync behaviour during the demo |
| syncedAt | Date | |
