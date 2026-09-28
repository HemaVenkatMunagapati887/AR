# Setup Guide

## 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # creates the two modules + an admin + a demo worker account
npm start        # or: npm run dev (nodemon)
```

Requires a MongoDB instance reachable at `MONGODB_URI` (defaults to `mongodb://127.0.0.1:27017/ar-safety`). For a quick local run:

```bash
mongod --dbpath ./backend/.mongo-data --port 27017
```

For production, point `MONGODB_URI` at a MongoDB Atlas connection string instead.

Seeded accounts (from `.env.example`, override before a real deployment):
- Admin: `ADMIN001` / `Admin@12345`
- Demo worker: `WORKER001` / `Worker@123`

## 2. Admin dashboard

```bash
cd admin-dashboard
cp .env.example .env    # VITE_API_BASE_URL should point at the backend
npm install
npm run dev              # http://localhost:5173
```

The public certificate verification page is `http://localhost:5173/verify/<certificateId>` — this is the URL a QR code encodes (`VERIFY_BASE_URL` in `backend/.env`).

## 3. Mobile AR app (Unity)

1. Install **Unity Hub** and **Unity 6000.0 LTS** with the **Android Build Support** module (including the Android SDK & NDK Tools sub-module) via Unity Hub.
2. Open `mobile-ar/` as a Unity project.
3. Unity will resolve packages from `Packages/manifest.json` (AR Foundation, ARCore XR Plugin, TextMeshPro, Newtonsoft Json).
4. Run **AR Safety → Build Main Scene** from the Unity menu once (regenerates `Assets/Scenes/Main.unity` from `Assets/Editor/SceneBuilder.cs` — see that file's header comment for the equivalent batchmode command).
5. In `Assets/Scripts/Core/ApiClient.cs`, set `baseUrl` for your target device:
   - Android Emulator → host machine: `http://10.0.2.2:5000/api`
   - Physical device on the same Wi-Fi as your dev machine: `http://<your-machine-LAN-IP>:5000/api`
6. **File → Build Settings → Android → Switch Platform**, then **AR Safety → Build Android APK** (or use the menu item, which also applies the Android 10+ / API 29 player settings).
7. Install the resulting APK (`mobile-ar/Builds/Android/ARSafetyTrainer.apk`) on an ARCore-supported Android 10+ device.

### Known manual step: Hindi/Santali glyph rendering

TextMeshPro's default font does not include Devanagari glyphs. Before the Hindi UI is demo-ready:
1. Import a Unicode font such as **Noto Sans Devanagari** (SIL Open Font License).
2. Window → TextMeshPro → Font Asset Creator → generate a TMP Font Asset from it.
3. Add it as a fallback under **Project Settings → TextMeshPro → Settings → Fallback Font Assets** so every existing `TMP_Text` picks it up automatically.

Santali strings in this MVP are stored in **romanized Latin script** specifically to avoid this same problem for a fourth script (Ol Chiki) under hackathon time constraints — see `docs/localization-review.md`.

## 4. Environment variables summary

| File | Key | Purpose |
|---|---|---|
| `backend/.env` | `MONGODB_URI` | Database connection |
| `backend/.env` | `JWT_SECRET` | Token signing secret — change for any real deployment |
| `backend/.env` | `VERIFY_BASE_URL` | Must match wherever the admin dashboard's `/verify` page is hosted |
| `admin-dashboard/.env` | `VITE_API_BASE_URL` | Backend URL the dashboard calls |
