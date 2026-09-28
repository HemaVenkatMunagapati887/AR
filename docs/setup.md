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

## 3. Mobile AR app (React Native)

Stack: React Native 0.86 (TypeScript, new architecture/Fabric enabled) + `@reactvision/react-viro` for AR Foundation-equivalent plane detection and object placement over ARCore.

### One-time environment setup

1. **Java** — any JDK the Android Gradle Plugin supports (17+; JDK 23 has been verified working with the bundled Gradle wrapper here).
2. **Android SDK** — install via Android Studio, or command-line only:
   ```bash
   # Download commandline-tools from https://developer.android.com/studio#command-tools
   # into %LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest, then:
   sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.22.1"
   ```
   `ndk` and `cmake` are required because `@reactvision/react-viro` ships native code.
3. Create `mobile-app/android/local.properties`:
   ```
   sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
   ```

### Install and run

```bash
cd mobile-app
npm install
```

Set the backend URL the app should call, in `src/api/client.ts` (`DEFAULT_BASE_URL`) or at runtime via `setBaseUrl()`:
- Android Emulator → host machine: `http://10.0.2.2:5000/api` (the default)
- Physical device on the same Wi-Fi as your dev machine: `http://<your-machine-LAN-IP>:5000/api`

Build and install a debug APK onto a connected device/emulator:

```bash
cd android
./gradlew assembleDebug
# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

Or, with a device/emulator running and Metro available:

```bash
npm run android
```

### Known manual step: Hindi/Santali glyph rendering

React Native's default system font on most Android devices already includes Devanagari glyphs (Noto Sans is commonly bundled), so Hindi typically renders correctly out of the box — verify on your target test device. If it doesn't, bundle a Devanagari-covering font (e.g. Noto Sans Devanagari) via `react-native.config.js`'s asset linking and reference it in the relevant `Text` style.

Santali strings in this MVP are stored in **romanized Latin script** specifically to avoid needing a fourth script (Ol Chiki) under hackathon time constraints — see `docs/localization-review.md`.

### AR device requirements

`isARSupportedOnDevice()` (called in `ArExperienceScreen.tsx`) checks ARCore support at runtime and shows a graceful fallback message if unsupported — most AVD (emulator) images do **not** support ARCore; test the AR flow on a real ARCore-certified Android 10+ device.

## 4. Environment variables summary

| File | Key | Purpose |
|---|---|---|
| `backend/.env` | `MONGODB_URI` | Database connection |
| `backend/.env` | `JWT_SECRET` | Token signing secret — change for any real deployment |
| `backend/.env` | `VERIFY_BASE_URL` | Must match wherever the admin dashboard's `/verify` page is hosted |
| `admin-dashboard/.env` | `VITE_API_BASE_URL` | Backend URL the dashboard calls |
| `mobile-app/src/api/client.ts` | `DEFAULT_BASE_URL` | Backend URL the mobile app calls (no `.env` — RN needs extra tooling for that; a constant is simpler for this MVP) |
