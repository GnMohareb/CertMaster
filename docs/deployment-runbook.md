# CertMaster — Production Deployment & Operations Runbook

**Last Updated**: 2026-10-30  
**Target Ecosystem**: CertMaster Web Platform (`apps/web/`) + CertMaster Native Android (`apps/android/app/`)

---

## 1. Prerequisites & Environment Variables

### 1.1 Web Platform & Express Backend (`apps/web/.env`)
Configure the following environment variables in your production hosting environment (e.g., Google Cloud Run, Firebase App Hosting, or Node.js container):

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes (`production`) | Disables Sandbox payment receipts (`X-CertMaster-Sandbox-Mode`) and serves compiled static assets from `dist/` |
| `PORT` | Optional (`3000`) | HTTP port for the Express server (`server.ts`) |
| `CERTMASTER_AUTH_SECRET` | Yes (Production) | High-entropy 256-bit secret used by `server.ts` to sign and verify HMAC-SHA256 Bearer session tokens |
| `CERTMASTER_PAYMENT_WEBHOOK_SECRET` | Yes (Production) | High-entropy secret shared with Stripe / Google Play Billing webhook relay to sign `X-CertMaster-Webhook-Signature` |
| `GEMINI_API_KEY` | Optional (Recommended) | Enables live `@google/genai` (`gemini-2.5-flash`) responses in `POST /api/ai/tutor` (`provider: 'GEMINI_LIVE'`). When unset, the server transparently falls back to deterministic citation-grounded answers (`provider: 'LOCAL_GROUNDED_FALLBACK'`) |

### 1.2 Native Android Application (`apps/android/.env`)
Copy `apps/android/.env.example` to `apps/android/.env` and configure:
- `GEMINI_API_KEY` (if direct on-device/cloud AI calls are enabled)
- Place the Firebase Console `google-services.json` for package `com.aistudio.examprep.kmwqxr` into `apps/android/app/google-services.json`.

---

## 2. Step-by-Step Build & Verification Procedure

### Step 1: Verify & Build the Web Platform
```bash
cd C:\CertMaster\apps\web
npm run lint
npm test
npx tsx firestore.rules.test.ts
npm run build
```
- **Expected Output**: Zero TypeScript errors, `11/11` test suites passing, `14/14` Firestore security rule scenarios passing, and production bundle generated in `apps/web/dist/`.

### Step 2: Verify & Build the Native Android APK
```powershell
$env:JAVA_HOME="C:\Users\gadly\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2"
$env:ANDROID_HOME="C:\Users\gadly\AppData\Local\Android\Sdk"
cd C:\CertMaster\apps\android
.\gradlew.bat testDebugUnitTest assembleDebug --console=plain
```
- **Expected Output**: All JUnit/Robolectric unit tests pass (`BUILD SUCCESSFUL`) and signed debug APK generated at `apps/android/app/build/outputs/apk/debug/app-debug.apk`.

### Step 3: Deploy Firestore Security Rules (Requires Operator Approval)
```bash
firebase deploy --only firestore:rules --project gen-lang-client-0788513176
```

### Step 4: Start Production Web & API Server
```bash
cd C:\CertMaster\apps\web
NODE_ENV=production npm start
```

---

## 3. Rollback Plan

1. **Firestore Security Rules Rollback**: In the Firebase Console (`gen-lang-client-0788513176` -> Firestore Database -> `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` -> Rules), select the previous timestamped release and click **Restore**.
2. **Application Rollback**: All schema v2 migrations (`migrateLegacyProfile`, `migrateLegacyAttempt`, `migrateLegacyFlashcard`, `migrateLegacyStudyPlan`) are **non-destructive** and retain legacy v1 fields alongside v2 fields. Reverting to an earlier container image or APK does not corrupt existing user documents.
