# CertMaster Unified Ecosystem: Android & Web Platform Integration Documentation

## 1. Executive Architecture Overview

The **CertMaster** native Android application (`app/`) and the **CertMaster Web Platform** (`src/`) operate as a single unified product ecosystem backed by:
- **Shared Firebase Project & Firestore Database**: Defined by `firebase-blueprint.json`, `firestore.rules`, and `firebase.json`.
- **Shared Authentication & Authorization Model**: Google Identity Services (OIDC) via Jetpack `CredentialManager` (`GetSignInWithGoogleOption` / `GetGoogleIdOption`) + `FirebaseAuth` (`GoogleAuthProvider`) on Android, paired with the same OIDC Client ID (`certmaster-sso-production.apps.googleusercontent.com`) and canonical subject ID (`usr_gnmohareb_cissp_001`) on the Web Platform.
- **Authoritative Calculation Engine**: `AuthoritativeMetricsEngine.kt` on Android implements the exact same mathematical formulas as `src/screens/AssessmentScreen.tsx`, `src/screens/SimulatorScreen.tsx`, `src/screens/UserAreaScreen.tsx`, and `src/services/apiSyncService.ts` on the Web Platform.

---

## 2. Manual Firebase Configuration & Prevention of Duplicate Provisioning (Requirement 5)

Per Requirement 5 (*"If Google AI Studio's automated Firebase integration attempts to provision a different database, do not proceed with that provisioning. Identify the required manual configuration instead"*):
- Google AI Studio's automated `ProvisionFirebase` tool creates a standalone, isolated GCP/Firebase project for the container, which would result in a separate database disconnected from an external production Web Firebase project.
- Therefore, automated provisioning of a separate database was **not** executed. Instead, the Android app is configured with graceful runtime detection (`SharedAuthManager.isFirebaseInitialized()` and `CertMasterFirebaseSyncClient.isFirestoreAvailable()`) and connects to the shared Firebase project as soon as the Web Platform's Firebase configuration is supplied.

### Required Manual Configuration to Bind to an External Production Firebase Project:
1. In the **Firebase Console** for the existing CertMaster Web Platform project:
   - Add an Android app with package name: `com.aistudio.examprep.kmwqxr`.
   - Register the Android signing certificate **SHA-1** and **SHA-256** fingerprints (from `debug.keystore` for development and your release upload keystore for production).
2. Download `google-services.json` from the Firebase Console and place it at:
   - `app/google-services.json` (or provide the values in `app/src/main/res/values/firebase_applet_config.xml`).
3. Ensure `default_web_client_id` in `app/src/main/res/values/strings.xml` (or `CERTMASTER_WEB_CLIENT_ID` in AI Studio Secrets) matches the Web OAuth 2.0 Client ID from the Google Cloud Console (`certmaster-sso-production.apps.googleusercontent.com`).
4. Deploy the shared Firestore rules at `/firestore.rules` to the Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 3. Synchronized Domains (All 11 Functional Areas)

| # | Domain | Firestore Path / REST Endpoint | Android Implementation | Web Implementation |
|---|---|---|---|---|
| 1 | **Student Profiles** | `/users/{userId}` & `POST /api/profile/sync` | `UserCentralProfile`, `UserProfileEntity` | `UserCentralProfile` (`src/types/index.ts`) |
| 2 | **Certification Catalog** | `/catalog/{examId}` & `GET /catalog` | `ExamCatalog.kt` (with canonical ID normalization `aws_csa` ↔ `aws-saa`, `sec_plus` ↔ `sec-plus`) | `CATALOG_112_EXAMS` (`src/data/catalog112.ts`) |
| 3 | **Question Banks** | `/exams/{examId}/questions/{questionId}` | `DefaultQuestions.kt`, `Question.kt` (with `optionAnalysis` & `SourceCitation`) | `CISSP_EXAM_QUESTIONS` (`src/data/cisspBank.ts`) |
| 4 | **Exam Attempts & Scores** | `/users/{userId}/attempts/{sessionId}` | `SimulationScoreEntity.kt`, `ExamSession.kt` | `SimulationResult` (`src/screens/SimulatorScreen.tsx`) |
| 5 | **Study Plans (5-Stage Journey)** | `/users/{userId}/studyPlans/{examId}` | `JourneyMilestone`, `StudyPlanEntity`, `AuthoritativeMetricsEngine.buildFiveStageStudyPlan()` | `UserAreaScreen.tsx` (Stages 1–5 Roadmap) |
| 6 | **Progress Tracking** | `/users/{userId}` | `completedSimulationsCount`, `highestSimulationScore`, `currentJourneyStage` | `UserCentralProfile` progress counters |
| 7 | **AI-Generated Learning Content** | `/users/{userId}/sources/{sourceId}` & `/exams/{examId}/audioOverviews/{audioId}` | `StudySourceEntity.kt`, `SourceDoc`, `AudioOverview` | `StudyMaterialsScreen.tsx` |
| 8 | **Flashcards** | `/users/{userId}/flashcards/{cardId}` | `FlashcardEntity.kt` (`boxLevel` 1–5 & `FlashcardStatus`: `UNREVIEWED`, `KNOWN`, `NEEDS_REVIEW`) | `Flashcard` (`src/types/index.ts`) |
| 9 | **Performance Analytics** | `/users/{userId}/analytics/{pointId}` | `DomainPerformancePoint`, `DomainStressMetrics` | `DashboardScreen.tsx` |
| 10 | **Exam Readiness** | `/users/{userId}/studyPlans/{examId}` | `ExamReadinessReport`, `AuthoritativeMetricsEngine.calculateAuthoritativeReadiness()` | `UserAreaScreen.tsx`, `ReadinessCertificateModal.tsx` |
| 11 | **Subscription Entitlements** | `/users/{userId}/entitlements/{examId}` | `ExamSubscription`, `SharedAuthManager.isAuthorizedForExam()` | `ApiSyncService.verifyOrSubscribeExam()` |

---

## 4. Shared Authoritative Calculations

Both platforms execute the exact same formulas:

1. **Behavioral Archetype Classification & Stress Baseline**:
   - **Confident Master**: `scorePct >= 85 && avgLatencySec < 40 && totalSwitches <= 2` → Stress = `35`
   - **Deliberate Strategist**: `totalEliminations >= 6 && scorePct >= 70` → Stress = `54`
   - **Fast Guesser**: `avgLatencySec < 22 && scorePct < 70` → Stress = `72`
   - **Analytical Hesitator**: `avgLatencySec >= 45 || totalSwitches >= 4` → Stress = `68`
   - **Methodical Verifier**: otherwise → Stress = `50`
2. **Simulation Behavioral Stress Formula**:
   - `stressScore = min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))`
3. **Distractor Elimination Rate & Option Switch Average**:
   - `distractorEliminationRate = min(1.0, round((totalEliminations / (totalQuestions * 3.0)) * 100) / 100)`
   - `optionSwitchCountAvg = round((totalSwitches / totalQuestions) * 10) / 10`
4. **Authoritative Exam Readiness Percentage**:
   - `readinessPercent = round(avgSimScore * 0.60 + assessmentScorePercent * 0.25 + flashcardMasteryPct * 0.15)`

---

## 5. Offline Caching, Retry Handling, and Conflict Resolution

- **Offline Caching**: Powered by Android Room SQLite (`CertDatabase` v3) storing `cached_user_profiles`, `cached_study_plans`, `simulation_scores`, `cached_flashcards`, `study_sources`, and `pending_sync_queue`.
- **Offline Queue & Retry Handling**: Mutations performed while offline are written immediately to Room and enqueued in `pending_sync_queue` (`SyncQueueEntity`). Upon reconnection, `CertMasterFirebaseSyncClient.executeWithRetry()` flushes all queued operations using exponential backoff (`100ms`, `200ms`, `400ms`).
- **Deterministic Conflict Resolution (`AuthoritativeMetricsEngine`)**:
  - **Subscription Entitlements**: Union-merged by normalized `examId` (`ACTIVE` > `TRIAL_ACTIVE` > `EXPIRED` > `LOCKED`). Unlocking an exam on either Web or Android guarantees it stays unlocked across both platforms even if the other device was offline.
  - **Progress Counters**: Preserves `max(completedSimulationsCount)` and `max(highestSimulationScore)`.
  - **Behavioral Calibration & Profile Metadata**: Last-Write-Wins using `lastSyncTimestampMillis`.
  - **Flashcards**: Most recent `lastReviewedEpoch` wins; on timestamp tie, higher `boxLevel` wins.

---

## 6. Interface Differences Between Android and Web

| Capability | CertMaster Android App | CertMaster Web Platform |
|---|---|---|
| **Offline Persistence** | Full SQLite Room database (`CertDatabase`) + `pending_sync_queue` | Browser `localStorage` + `BroadcastChannel` |
| **Audio Briefings** | Native Android `TextToSpeech` (`SpeechManager`) with dual-voice pitch/rate synthesis | Interactive web audio player & transcript reader |
| **Keyboard Shortcuts** | Touch-first Material 3 cards, bottom navigation, and hardware back handling | Desktop keyboard shortcuts (`1-4`/`A-D` options, `F` flag, Arrow keys) |
| **Marketing Landing Page** | Direct launch into authenticated Student Dashboard | Full SaaS marketing landing page + Student Journey Portal |
