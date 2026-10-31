# CertMaster — Shared Firebase & Google SSO Configuration Guide

**Last Updated**: 2026-10-30  
**Firebase Project ID**: `gen-lang-client-0788513176`  
**Named Firestore Database ID**: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`  
**Canonical Data Contract**: `schemaVersion: 2`

---

## 1. Authoritative Ecosystem Identifiers

Both the CertMaster Web Platform (`apps/web/`) and CertMaster Native Android (`apps/android/app/`) are configured to target the exact same Firebase project and named Firestore database:

| Configuration Parameter | Value | Web Location | Android Location |
| --- | --- | --- | --- |
| **Firebase Project ID** | `gen-lang-client-0788513176` | `apps/web/firebase-applet-config.json`, `apps/web/src/lib/firebase.ts` | `SharedAuthManager.kt`, `CertMasterFirebaseSyncClient.kt`, `apps/android/.env.example` |
| **Named Firestore Database ID** | `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` | `apps/web/src/lib/firebase.ts` (`getFirestore(app, FIRESTORE_DATABASE_ID)`) | `CertMasterFirebaseSyncClient.kt` (`FirebaseFirestore.getInstance(app, FIRESTORE_DATABASE_ID)`) |
| **Web OAuth 2.0 Client ID** | `814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com` | `apps/web/src/lib/firebase.ts` | `apps/android/app/src/main/res/values/sso_config.xml`, `CentralProfile.kt` |
| **Android Package Name** | `com.aistudio.examprep.kmwqxr` | N/A | `apps/android/app/build.gradle.kts` |
| **Android Debug Keystore SHA-1** | `16:CE:BD:B7:A9:96:10:2D:B4:B0:F4:8C:AA:29:98:15:DC:57:F9:16` | N/A | `apps/android/debug.keystore` |
| **Android Debug Keystore SHA-256** | `F9:7A:2F:5A:91:61:7B:FC:85:75:44:97:1E:B0:15:53:79:D0:7E:14:F0:E2:A5:0A:9C:78:AF:93:71:A6:FA:41` | N/A | `apps/android/debug.keystore` |

---

## 2. Programmatic Android Firebase Initialization & `google-services.json`

To ensure that the native Android application can connect to `gen-lang-client-0788513176` and the named database `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` even when `apps/android/app/google-services.json` is not bundled in the repository:
- [`SharedAuthManager.ensureFirebaseAppInitialized(context)`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/auth/SharedAuthManager.kt) programmatically constructs `FirebaseOptions` with `projectId = "gen-lang-client-0788513176"`, `applicationId = "1:814967786900:web:800232a0bc3a2cb90cd381"`, `apiKey`, and `storageBucket`, and calls `FirebaseApp.initializeApp(context, options)`.
- [`CertMasterFirebaseSyncClient.getNamedFirestoreInstance()`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt) calls `FirebaseFirestore.getInstance(FirebaseApp.getInstance(), "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001")`.

### External Operator Action Required for Native Android Google Credential Manager Sign-In
To enable live Google Sign-In via Jetpack Credential Manager (`GetSignInWithGoogleOption` / `GetGoogleIdOption`) on physical Android devices and emulators:
1. Open the [Firebase Console](https://console.firebase.google.com/) for project **`gen-lang-client-0788513176`**.
2. Register an Android App with package name **`com.aistudio.examprep.kmwqxr`**.
3. Add the debug keystore fingerprints:
   - **SHA-1**: `16:CE:BD:B7:A9:96:10:2D:B4:B0:F4:8C:AA:29:98:15:DC:57:F9:16`
   - **SHA-256**: `F9:7A:2F:5A:91:61:7B:FC:85:75:44:97:1E:B0:15:53:79:D0:7E:14:F0:E2:A5:0A:9C:78:AF:93:71:A6:FA:41`
4. Download the generated `google-services.json` and place it at `C:\CertMaster\apps\android\app\google-services.json`.

---

## 3. Firestore Collections & Security Rules Deployment

### Canonical Firestore Document Paths (`schemaVersion: 2`)
- `/users/{userId}` — `UserCentralProfile`
- `/users/{userId}/subscriptions/{examId}` & `/users/{userId}/entitlements/{examId}` — `SubscriptionEntitlement`
- `/users/{userId}/attempts/{attemptId}` — `HistoricalExamAttempt`
- `/users/{userId}/flashcards/{cardId}` — `FlashcardProgress`
- `/users/{userId}/studyPlans/{examId}` — `StudyPlan`
- `/users/{userId}/readiness/{examId}` — `ExamReadiness`
- `/users/{userId}/sources/{sourceId}` — `StudySource`

### Deploying Hardened Firestore Rules (Operator Authorization Required)
Both [`apps/web/firestore.rules`](file:///c:/CertMaster/apps/web/firestore.rules) and [`apps/android/firestore.rules`](file:///c:/CertMaster/apps/android/firestore.rules) are byte-for-byte identical and verified against all 14 Dirty Dozen & Entitlement Escalation security tests (`apps/web/firestore.rules.test.ts`). To deploy to the named production database after operator sign-off:
```bash
firebase deploy --only firestore:rules --project gen-lang-client-0788513176
```
