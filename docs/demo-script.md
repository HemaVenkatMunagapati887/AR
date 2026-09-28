# Demo Script (3–5 minutes)

## Setup before recording
- Backend running (`npm start` in `backend/`), seeded (`npm run seed`).
- Admin dashboard running (`npm run dev` in `admin-dashboard/`).
- APK installed on an ARCore-supported Android 10+ phone, connected to the same network as the backend (or backend deployed publicly).

## Worker flow (Fire & Explosion Response) — ~2 min
1. Open the app → **Language Select** → choose Hindi (or Santali, noting the draft-translation banner).
2. **Login** as `WORKER001` / `Worker@123`.
3. **Home** screen — show the Fire & Explosion module listed as pending.
4. Tap the module → **Module Intro** → **Start Training**.
5. **Learning** slides — page through fire-class / PASS-technique content.
6. **AR Calibration** — pan the camera to show real plane detection on a real surface.
7. Tap the surface → fire, extinguishers, and exit markers appear in AR (**Guided Practice**) — tap the wrong extinguisher to show the hint/feedback, then the correct one.
8. **Continue** → **Independent Practice** — same scenario, no hints shown.
9. **Continue** → **Assessment** — answer the MCQ/ordering questions, then perform the AR exit-identification task with no hints.
10. **Result** — show score, PASSED, → **Get Certificate**.
11. **Certificate** screen → **View QR Code**.

## Gas Leak & Confined Space — ~1 min (fast-forward through Learn/Guided, focus on the distinct content)
1. From Home, open the Gas module.
2. Show hazard-zone recognition, PPE selection (SCBA vs. sunglasses), and the buddy-system attendant marker in AR.
3. Complete the assessment → show pass/fail.

## Admin dashboard — ~1 min
1. Log in as `ADMIN001` / `Admin@12345`.
2. **Overview** — point out total workers, compliance rate.
3. **Certificates** — find the certificate just issued → **Open** → shows the same public verification page a QR scan would land on.
4. Optionally scan the phone's certificate QR with a second phone/browser to land on `/verify/<certId>` directly.

## Offline demo — ~1 min
1. Put the phone in Airplane Mode.
2. Open a module, complete Guided/Independent Practice and the Assessment fully offline — show the **Offline** status bar and the local **Result** screen still working.
3. Re-enable connectivity — show the sync status bar switch to **Online** and the pending-sync count drop to zero within ~15 seconds.
4. Refresh the admin dashboard's Assessment Results page — the offline attempt now appears, tagged "Offline sync".

## Closing line
"This is a training simulation prototype for SIH Problem Statement 26041 — not a substitute for official industrial safety certification."
