# CertMaster Shared Integration Contract (`v2.0`)

## 1. Architecture Overview

The CertMaster ecosystem consists of:
1. **CertMaster Web Platform** (React 19 + TypeScript + Vite + Express + Firebase Web SDK)
2. **CertMaster Native Android Application** (Kotlin + Jetpack Compose + Firebase Android BoM)
3. **Centralized Firebase Authentication** (`gen-lang-client-0788513176`)
4. **Centralized Cloud Firestore Database** (`ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`)
5. **Express REST API Companion Layer** (`/api/*`)

---

## 2. Firebase Configuration Requirements

### 2.1 Shared Identifiers
- **Firebase Project ID**: `gen-lang-client-0788513176`
- **Firestore Database ID**: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`
- **OAuth 2.0 Web Client ID**: `814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com`
- **Schema Version**: `2`

### 2.2 Android `build.gradle.kts` Dependencies
```kotlin
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
}
```

---

## 3. Authentication Flow Specification

1. **Identity Provider**: Google Sign-In (`google.com` provider).
2. **Email Verification Requirement**: Firestore Security Rules strictly enforce `request.auth.token.email_verified == true` for all write operations. Google Sign-In accounts automatically satisfy `email_verified == true`.
3. **Canonical User ID (`userId`)**: Both Web and Android MUST use `firebaseAuth.currentUser.uid` as the document key `{userId}` under `/users/{userId}` and in the `userId` field of every document.
4. **First-Login Bootstrap Sequence**:
   - Check if `/users/{uid}` exists via `get()`.
   - If it does not exist, execute a Firestore `WriteBatch` that atomically:
     1. Creates `/users/{uid}` (`UserProfile`) with `createdAt: serverTimestamp()`, `updatedAt: serverTimestamp()`, `schemaVersion: 2`, and `lastActivePlatform: "ANDROID"` (or `"WEB"`).
     2. Creates `/users/{uid}/private/pii` (`UserPrivatePII`) with `email: currentUser.email`.
     3. Seeds initial entitlements under `/users/{uid}/subscriptions/{examId}` and initial CISSP readiness under `/users/{uid}/readiness/cissp`.

---

## 4. Database Collection Hierarchy & Document Schemas

### 4.1 `/users/{userId}` (`UserProfile`)
Stores cross-platform user profile, learning preferences, and behavioral telemetry summary.
- **Required Fields**:
  - `userId` (`string`, `1..128` chars, `^[a-zA-Z0-9_\-]+$`, must match `request.auth.uid`)
  - `displayName` (`string`, `1..120` chars)
  - `subscriptionTier` (`string`, enum: `"Universal Multi-Pass" | "Single-Exam Pass" | "Free Trial"`)
  - `assessmentScorePercent` (`number`, `0..100`)
  - `cognitiveStressBaseline` (`number`, `0..100`)
  - `archetypeName` (`string`, `1..100` chars)
  - `preferredTheme` (`string`, enum: `"dark" | "light"`)
  - `targetExamId` (`string`, `1..64` chars, e.g. `"cissp"`)
  - `lastActivePlatform` (`string`, enum: `"WEB" | "ANDROID"`)
  - `schemaVersion` (`number`, `1..10`, set to `2`)
  - `createdAt` (`timestamp`, must equal `request.time` on create, immutable on update)
  - `updatedAt` (`timestamp`, must equal `request.time` on create & update)
- **Optional Fields**:
  - `avatarUrl` (`string`, `<= 500` chars)
  - `archetypeDescription` (`string`, `<= 600` chars)
  - `avgDwellSeconds` (`number`, `0..3600`)
  - `switchRatePercent` (`number`, `0..100`)
  - `distractorEliminationRate` (`number`, `0..100`)
  - `confidenceIndex` (`number`, `0..100`)
  - `recommendedStrategy` (`string`, `<= 600` chars)
  - `dailyStudyGoalMinutes` (`number`, `5..720`)
  - `androidDeviceId` (`string`, `<= 128` chars)

### 4.2 `/users/{userId}/private/{docId}` (`UserPrivatePII`)
Strictly isolated PII collection (use `docId = "pii"`).
- **Required Fields**:
  - `userId` (`string`, matches `request.auth.uid`)
  - `email` (`string`, `3..254` chars)
  - `createdAt` (`timestamp`)
  - `updatedAt` (`timestamp`)

### 4.3 `/users/{userId}/subscriptions/{examId}` (`SubscriptionEntitlementDoc`)
Synchronizes single-exam unlocks and Universal Multi-Pass entitlements across Web and Android.
- **Required Fields**:
  - `userId` (`string`, matches `request.auth.uid`)
  - `examId` (`string`, `1..64` chars, matches `{examId}` path parameter, normalized via `normalizeExamId`, e.g. `"cissp"`, `"aws-saa"`, `"sec-plus"`)
  - `status` (`string`, enum: `"ACTIVE" | "EXPIRED" | "TRIAL" | "LOCKED"`)
  - `platform` (`string`, enum: `"WEB" | "ANDROID"`)
  - `expiresAt` (`string`, ISO-8601 timestamp, `<= 64` chars)
  - `createdAt` (`timestamp`)
  - `updatedAt` (`timestamp`)

### 4.4 `/users/{userId}/attempts/{attemptId}` (`ExamAttemptRecord`)
Immutable historical exam simulation and diagnostic assessment records. When Android writes a new attempt here, the Web Platform's Multi-Domain Bézier Line Chart and Readiness Dashboard update immediately.
- **Required Fields**:
  - `attemptId` (`string`, `1..128` chars, matches `{attemptId}`)
  - `userId` (`string`, matches `request.auth.uid`)
  - `examId` (`string`, `1..64` chars, e.g. `"cissp"`, `"assessment"`)
  - `attemptType` (`string`, enum: `"SIMULATION" | "DIAGNOSTIC" | "PRACTICE"`)
  - `platform` (`string`, enum: `"WEB" | "ANDROID"`)
  - `scorePercent` (`number`, `0..100`)
  - `totalQuestions` (`number`, `1..500`)
  - `correctAnswers` (`number`, `0..totalQuestions`)
  - `timeSpentMinutes` (`number`, `0..600`)
  - `averageDwellSec` (`number`, `0..3600`)
  - `stressScore` (`number`, `0..100`)
  - `dateString` (`string`, `YYYY-MM-DD`, `8..32` chars)
  - `domainScores` (`map<string, number>`, max 20 domain keys)
  - `createdAt` (`timestamp`)

### 4.5 `/users/{userId}/flashcards/{cardId}` (`FlashcardProgress`)
Synchronizes spaced-repetition active recall states (`unstudied`, `known`, `needs_review`).
- **Required Fields**:
  - `userId` (`string`)
  - `cardId` (`string`, `1..64` chars, e.g. `"fc-1"`)
  - `examId` (`string`, `1..64` chars, e.g. `"cissp"`)
  - `domain` (`string`, `1..120` chars)
  - `state` (`string`, enum: `"unstudied" | "known" | "needs_review"`)
  - `reviewCount` (`number`, `0..10000`)
  - `platform` (`string`, enum: `"WEB" | "ANDROID"`)
  - `createdAt` (`timestamp`)
  - `updatedAt` (`timestamp`)

### 4.6 `/users/{userId}/studyPlans/{planId}` (`StudyPlan`)
Synchronizes user study schedules and focus domains.
- **Required Fields**:
  - `planId`, `userId`, `examId`, `targetDate` (`YYYY-MM-DD`), `weeklyHours` (`1..168`), `focusDomains` (`list<string>`, max 10 items), `status` (`"ACTIVE" | "PAUSED" | "COMPLETED"`), `createdAt`, `updatedAt`.

### 4.7 `/users/{userId}/readiness/{examId}` (`ExamReadiness`)
Synchronizes per-exam readiness percentage and pass probability.
- **Required Fields**:
  - `userId`, `examId`, `readinessScore` (`0..100`), `passProbability` (`0..100`), `simulationsCompleted` (`0..10000`), `weakestDomain` (`1..120` chars), `createdAt`, `updatedAt`.

### 4.8 `/users/{userId}/syncEvents/{eventId}` (`SyncEventDoc`)
Immutable audit log tracking bi-directional Web <-> Android sync operations.
- **Required Fields**:
  - `eventId`, `userId`, `direction` (`"WEB_TO_ANDROID" | "ANDROID_TO_WEB"`), `action` (`1..120` chars), `status` (`"SUCCESS" | "SYNCING" | "PENDING"`), `payloadSummary` (`1..500` chars), `createdAt`.

---

## 5. Security & Authorization Rules Summary

All writes are guarded by `firestore.rules`:
1. **Parent Gate**: Subcollections cannot be written unless `/users/{userId}` already exists.
2. **Strict Key Allowlists**: Any extra/unrecognized JSON field causes `PERMISSION_DENIED`.
3. **Immutable Keys on Update**: `userId`, `createdAt`, and primary IDs (`examId`, `cardId`, `planId`) must match `resource.data` during `update`.
4. **Server Timestamps Required**: Always pass `FieldValue.serverTimestamp()` (Android) or `serverTimestamp()` (Web) for `createdAt` on creation and `updatedAt` on updates.

---

## 6. Companion REST API Endpoints (`server.ts`)

In addition to direct Firestore SDK synchronization, the Web Platform exposes REST endpoints for health checks, catalog metadata, and webhook-style telemetry:
- `GET /api/health` — Returns backend status, Firebase Project ID, and Firestore Database ID.
- `GET /api/catalog/manifest` — Returns the canonical list of 112 certification banks, vendor counts, and CISSP domains.
- `POST /api/profile/sync` — Validates a `UserCentralProfile` payload against volumetric rules and returns canonical sync confirmation.
- `GET /api/subscriptions/verify?userId={uid}` — Returns subscription verification metadata and cross-platform entitlement requirements.
- `POST /api/scores/telemetry` — Computes behavioral archetype (`Analytical Hesitator`, `Fast Guesser`, `Methodical Eliminator`, `Confident Master`) and cognitive stress index from raw dwell time and option-switch telemetry.

---

## 7. Offline Synchronization & Conflict Resolution

1. **Offline Persistence**:
   - Android: Enabled by default in `FirebaseFirestoreSettings.Builder().setLocalCacheSettings(PersistentCacheSettings.newBuilder().build())`.
   - Web: Firestore SDK caches active snapshots and queues mutations while offline.
2. **Conflict Resolution**:
   - **Exam Attempts (`attempts/{attemptId}`)**: Append-only immutable documents keyed by unique `attemptId`. Zero overwrite conflicts between offline Web and Android sessions.
   - **Subscriptions (`subscriptions/{examId}`)**: Keyed by deterministic `{examId}`. Last-write-wins with `ACTIVE` status taking precedence until `expiresAt`.
   - **User Preferences & Flashcards**: Last-write-wins governed by server-assigned `updatedAt` (`request.time`).
