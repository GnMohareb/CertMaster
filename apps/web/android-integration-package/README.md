# CertMaster Native Android Integration Package

**Target Application**: CertMaster Native Android Application (`3cc96170-31c4-46dd-822d-0ed45a0ac3fe`)  
**Companion Hub**: CertMaster Web Platform (`ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`)  
**Schema Version**: `v2.0` (`CERTMASTER_SCHEMA_VERSION = 2`)

---

## 1. Shared Cloud Infrastructure Coordinates

Both the **CertMaster Native Android Application** and the **CertMaster Web Platform** connect to the exact same Firebase project and named Cloud Firestore database instance:

| Configuration Parameter | Authoritative Value |
| :--- | :--- |
| **Firebase Project ID** | `gen-lang-client-0788513176` |
| **Firestore Database ID** | `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` |
| **Firebase Auth Domain** | `gen-lang-client-0788513176.firebaseapp.com` |
| **Storage Bucket** | `gen-lang-client-0788513176.firebasestorage.app` |
| **Messaging Sender ID** | `814967786900` |
| **Google OAuth Web Client ID** | `814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com` |

> **CRITICAL ANDROID REQUIREMENT**: Do **NOT** use the `(default)` Firestore database instance. You **MUST** initialize Firestore on Android with the named database ID:
> ```kotlin
> val db = FirebaseFirestore.getInstance(
>     FirebaseApp.getInstance(),
>     "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001"
> )
> ```

---

## 2. Package Contents

1. **`README.md`** (this file): Quick-start setup guide and infrastructure coordinates.
2. **`SHARED_INTEGRATION_CONTRACT.md`**: Complete technical specification covering:
   - Firebase configuration & Gradle dependencies
   - Google Sign-In & Firebase Auth token exchange
   - Firestore collection hierarchy & document schemas
   - Strict security rules & volumetric validation constraints
   - Server REST API endpoints (`/api/profile/sync`, `/api/subscriptions/verify`, `/api/scores/telemetry`, `/api/catalog/manifest`)
   - Offline persistence & conflict resolution rules
3. **`CertMasterAndroidSync.kt`**: Production-ready Kotlin data classes (`UserProfileDoc`, `SubscriptionEntitlementDoc`, `ExamAttemptRecord`, `FlashcardProgressDoc`, `StudyPlanDoc`, `ExamReadinessDoc`, `SyncEventDoc`) and `CertMasterFirestoreRepository` with real-time `SnapshotListener` bindings.

---

## 3. Step-by-Step Implementation Checklist for the Android Agent

1. **Provision Android App in Project `gen-lang-client-0788513176`**:
   - When running `ProvisionFirebase` in the Android Studio / AI Studio project (`3cc96170-31c4-46dd-822d-0ed45a0ac3fe`), pass:
     - `platform: "android"`
     - `project_id: "gen-lang-client-0788513176"`
     - `database_id: "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001"`
2. **Configure Google Sign-In (`CredentialManager`)**:
   - Use `GetGoogleIdOption.Builder().setServerClientId("814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com")` and exchange the Google ID token via `GoogleAuthProvider.getCredential(idToken, null)` with `FirebaseAuth.getInstance().signInWithCredential(credential)`.
3. **Drop in `CertMasterAndroidSync.kt`**:
   - Copy `CertMasterAndroidSync.kt` into `app/src/main/java/com/certmaster/app/data/sync/CertMasterAndroidSync.kt`.
4. **Bind Real-Time Listeners**:
   - Attach `observeUserProfile()`, `observeSubscriptions()`, `observeExamAttempts()`, and `observeFlashcards()` to your Android `ViewModel` `StateFlow`s.
5. **Enforce `FieldValue.serverTimestamp()`**:
   - Every Firestore `create` must set `createdAt = FieldValue.serverTimestamp()` and `updatedAt = FieldValue.serverTimestamp()`.
   - Every Firestore `update` must set `updatedAt = FieldValue.serverTimestamp()` and preserve `createdAt` and `userId` unchanged.
