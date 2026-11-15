# CertMaster Unified Ecosystem — Development Progress Log

**Last Updated**: 2026-11-06  
**Firebase Project ID**: `gen-lang-client-0788513176`  
**Named Firestore Database ID**: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`  
**Canonical Schema Version**: `2`  
**GitHub Repository**: [https://github.com/GnMohareb/CertMaster](https://github.com/GnMohareb/CertMaster) (Default branch: `main`)

---

## 1. Phase Execution Summary

| Phase | Scope | Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Canonical v2 Data Contract, Exam ID Normalization, Authoritative Formulas & Migrations | **COMPLETED** | Web `npm test` (Tests 1–7) + Android `CrossPlatformSyncIntegrationTest.kt` |
| **Phase 2** | Shared Firebase Auth, Named Firestore Database, Security Rules & Entitlement Gate | **COMPLETED** | Web `npm test` (Test 8) + Android `SharedAuthManager.kt` / `CertMasterFirebaseSyncClient.kt` |
| **Phase 3** | Express Backend API (`server.ts`), Sync Queues, Idempotent Session Ingestion | **COMPLETED** | Web `npm test` (Tests 10 & 11) + Android `CrossPlatformSyncIntegrationTest.kt` |
| **Phase 4** | Web Navigation Restructuring (7 Top-Level Sections), Hash Routing & Truthful Content | **COMPLETED** | Playwright headless Chromium QA across 5 viewports |
| **Phase 5** | Cross-Platform Feature Parity (AI Tutor, Notes, Study Plan, Multi-Mode Practice) | **COMPLETED** | Web `npm test` + Android `CrossPlatformSyncIntegrationTest.kt` |
| **Phase 6** | Ecosystem Baseline Verification & Audit Remediation | **COMPLETED** | Git baseline commit `8b11faa` |
| **Phase 7** | Production Readiness, Evidence-Based Classification, Cryptographic Entitlement Security | **COMPLETED** | `11/11` test suites + `14/14` Firestore rules + Playwright audit |
| **Phase 8** | **Physical Galaxy A05 Deployment, QIS Live Ingestion, Dedicated Single-Exam Apps, 50-Q Free Funnel, Omnichannel Universal Entitlements & Web Mobile Bridge** | **COMPLETED & VERIFIED** | **Live Physical Device:** Samsung Galaxy A05 (`R92X91KHRKV`, PID `23455`). **Live Web Server:** `http://localhost:3000`. **Tests:** `12/12` suites passing. **Git:** Commits `8704a71`, `877c42e`, `faf9d76`, `a12e855`. |

---

## 2. Phase 8 Key Deliverables & Code Changes

### A. Physical Device Deployment & Usability Remediation
- **Target Device:** Samsung Galaxy A05 (`SM-A055M`, Android 15, Serial `R92X91KHRKV`, 360×800 dp viewport).
- **Back Navigation Fix:** Implemented Compose `BackHandler` in [`MainActivity.kt`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/MainActivity.kt) to safely pop sub-screens without terminating the app.
- **Top App Bar Optimization:** Decluttered [`CommonComponents.kt`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/ui/components/CommonComponents.kt). Retained 3 primary touch targets (`Sync`, `Switch`, `Profile`) and moved secondary options into a 3-dot overflow menu (`⋮`).
- **Jargon Elimination:** Removed developer scaffolding labels (`"Room SQLite History"`, `"Multi-Tenant & Replication Engine"`, and raw Kotlin snippets) from user-facing screens.

### B. Monetization & Free Funnel Architecture
- **50-Question Free Diagnostic Assessment:** Free tier users on mobile and web are capped at 50 questions across all domains with a 75-minute timer (1.5 min/Q).
- **Post-Assessment Upgrade Flow:** Upon submitting the 50 questions, learners receive their Readiness Score, Domain Mastery Breakdown, and an **"Upgrade to Complete Exam Pass"** conversion card.
- **Dedicated Single-Exam Mobile Apps:** Added Gradle Product Flavors in [`build.gradle.kts`](file:///c:/CertMaster/apps/android/app/build.gradle.kts) for `cissp`, `pmp`, `awsSaa`, and `full`. In dedicated flavors, the app locks onto that specific certification without multi-exam switcher clutter.

### C. Omnichannel Universal Entitlements
- **Pay on Any Channel, Unlock Everywhere:**
  - Pay on Web (Stripe) -> Server webhook verifies HMAC signature -> Sets `status = 'ACTIVE'`, `universalAccess = true` in Firestore -> Android syncs and unlocks the complete exam.
  - Pay on Mobile (Google Play IAP) -> Server verifies purchase token -> Sets `status = 'ACTIVE'` in Firestore -> Web portal instantly unlocks.
- **Deterministic Conflict Resolution:** [`AuthoritativeMetricsEngine.kt`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/domain/AuthoritativeMetricsEngine.kt) and [`canonicalContract.ts`](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.ts) ensure `ACTIVE` on any channel takes priority over `TRIAL` or `LOCKED`.

### D. Continuous QIS Streaming Engine
- Built `POST /api/qis/ingest` in [`server.ts`](file:///c:/CertMaster/apps/web/server.ts) protected by `QIS_INGESTION_API_KEY`.
- Updated `GET /api/exams/:examId/questions` to dynamically merge generated QIS questions with static question banks.
- Provided standalone publisher CLI `C:\Users\gadly\qis-tools\qis_live_publisher.py`.

### E. Web Platform Single Portal & Mobile Companion Bridge
- Unified Web Portal (`http://localhost:3000`) hosts all 112 certification tracks.
- Added **"Get Mobile Companion App"** bridge in `My Certifications` (`/#/my-certifications`) for enrolled tracks, guiding students to download the dedicated mobile app for their specific exam with 50 free questions.

---

## 3. Active Verification Artifacts

* `docs/web_information_architecture.md` — Authoritative final sitemap, route mappings, and navigation rationale.
* `docs/web_feature_parity.md` — Web Platform vs. Native Android feature comparison and content matrix.
* `docs/ux_test_results.md` — Physical Galaxy A05 test evidence, 5 responsive viewports, and WCAG AA verification.
* `docs/canonical_data_contract.md` — Schema Version 2 specification.


## CSC Part 1 offline Android recovery — 2026-11-14

Recovered the 35 Android source changes from AI Studio export commit 4bf38733a5b092e206278fc75933fe08e9a3c753 and committed equivalent contents as ea5c9dd0b6c0174270ea4ffc939e40f0b1949fcc on feature/standalone-android-offline-exams. Six renames were preserved. apps/web and main were not changed.

Executable CI found and resolved two issues: ExamRepository must retain its constructor context as a private property for embedded-bank loading; offline Robolectric test setup, teardown and coroutine test bodies must execute Room operations on Dispatchers.IO. The workflow now generates the missing standard debug keystore on the runner without committing signing keys.

Verified on commit ce31d0cab14a110efbcd91695aa62495d87219b9:
- :app:testCscPart1DebugUnitTest — PASS (BUILD SUCCESSFUL).
- :app:assembleCscPart1Debug — PASS (BUILD SUCCESSFUL).
- APK upload — PASS, artifact CSC-Part1-Offline-Debug-APK.
- Run: https://github.com/GnMohareb/CertMaster/actions/runs/43632287764
- Download: https://github.com/GnMohareb/CertMaster/actions/runs/43632287764/artifacts/14128328065

Limits: this verifies compilation, JVM/Robolectric unit tests and debug packaging. No physical-device/emulator install or interactive QA was performed in this session. This is a debug build, not a Play Store release. No QIS question bank was imported. AI Studio's source still needs reconciliation with the follow-up GitHub fixes before future exports overwrite this branch.

---

## CSC Part 1 Offline Adaptive Assessment, Practice & Mastery Engine — 2026-11-15

Implemented full offline adaptive assessment, adaptive practice, deterministic topic/domain mastery, retention review, Room v5 persistence/migration, offline UI workflows, acceptance/migration tests, and Perplexity content-handoff documentation strictly inside the standalone CSC Part 1 Android scope (`apps/android/` and `docs/`). `apps/web/` and `main` were untouched, and no QIS/synthetic question bank was added to `assets/`.

### Implemented Components
1. **Models & Schema v2 Parser (`Question.kt`, `ExamSession.kt`, `AdaptiveEngineModels.kt`, `EmbeddedExamBank.kt`)**:
   - Added `QuestionPool` (`GENERAL`, `PRACTICE`, `ASSESSMENT`, `FULL_EXAM_RESERVED`), `topicId`, `topicName`, `learningObjective`, `nearDuplicateGroupId`, `difficultyExplicit`, `EvidenceConfidence`, `TopicMasteryState`, `DomainMasterySummary`, `BankCoverageAudit`, `PracticeRecommendation`, `AdaptiveConfig`.
   - Upgraded `EmbeddedExamBank.parseWithMetadata` to support `schemaVersion` `1..2`, `bankVersion`, `syllabusWeights`, `optionAnalysis` (index or letter keys), and `auditBank()`. Preserves fail-closed behavior and explicit unmapped fallback (`unmapped:<domainId>`).
2. **Room v5 Database & Migration (`CertDatabase.kt`, `AdaptiveMasteryEntities.kt`, `AdaptiveMasteryDao.kt`, `ActiveExamAttemptEntity.kt`, `SimulationScoreEntity.kt`)**:
   - Added `answer_events` (idempotent key `examId::attemptId::questionId`), `topic_mastery`, and `question_exposure` tables plus `MIGRATION_4_5` preserving existing v4 rows and schema integrity.
3. **Deterministic Engine, Repository & ViewModel (`AdaptivePracticeEngine.kt`, `ExamRepository.kt`, `ExamViewModel.kt`)**:
   - Balanced or syllabus-weighted duplicate-free Initial Assessment excluding `FULL_EXAM_RESERVED`, preserving the first completed assessment as a fixed baseline while storing retakes separately.
   - Deterministic mastery scoring with diminishing repeat exposure weight, explicit-difficulty-only scaling, `INSUFFICIENT_EVIDENCE` cap (`74%`), skip/view-only exclusion, and honest `"Not assessed"` state (never labels unassessed topics weak).
   - Adaptive selection (`45%` weak / `25%` insufficient evidence / `20%` due retention review / `10%` maintenance), near-duplicate avoidance, immediate `checkPracticeAnswer` rationale + distractor analysis + different follow-up remediation + delayed revisit queue, and strict separation from `FULL_SIMULATION`.
4. **Offline Student UI (`DashboardScreen.kt`, `ExamsHubScreen.kt`, `ExamSimulationScreen.kt`, `ExamResultScreen.kt`)**:
   - Added Study Plan, Baseline vs Current Mastery, Domain/Topic confidence breakdown, Study Modes (`Initial Assessment`, `Adaptive Practice`, `Retention Review`, `Full Timed Simulation`), `Check Answer` immediate feedback card, and post-attempt Topic Breakdown & Recommendations.
5. **Unit & Migration Tests + Perplexity Handoff Docs**:
   - Added `AdaptiveMasteryEngineTest.kt` and `Migration4To5Test.kt` in `apps/android/app/src/testCscPart1/java/com/example/`.
   - Added `docs/adaptive_mastery_model.md`, `docs/csc_part1_question_schema.json`, `docs/csc_part1_question_schema_for_perplexity.md`, and `docs/csc_part1_coverage_audit.md` (covering `schemaVersion` 1–2, `bankVersion`, `syllabusEdition`, `syllabusWeights`, `topicId`/`topicName`, `objectiveId`/`learningObjective`, `questionType`, `questionPool`, `nearDuplicateGroupId`, `optionAnalysis`, and fail-closed citation/type checks without inventing CSI syllabus IDs or weights).

### Verification & Sync Status (Reconciled with Remote `12d7201e9f739f950d65fb53d70f8be01ca64230`)
- **Upstream GitHub Recovery & Follow-ups Preserved**:
  - Recovered branch commit `e0dd472` plus remote fixes `d76700c` (no destructive DB fallback), `23ed576` (atomic `recordAnswerEvidence` `withTransaction` + `Mutex` + concurrency/rollback tests), `b877657` (matched v4 Room schema in `Migration4To5Test` & `Dispatchers.setMain`), `8a8b54f` (`activeAttemptRevision` / `activeAttemptMutex` + `compareAndSet`), and `12d7201` (offline APK permission/runtime dependency verification + app-owned ID clarification).
- **Executed GitHub Actions CI History (`.github/workflows/csc-part1-android.yml`)**:
  - Run `43632287764` (`ce31d0c`): **PASS** (baseline before adaptive learning merge).
  - Run `43731087024` (`b877657`): **24 tests ran, 23 passed, 1 failed** (`CscPart1OfflineTest.inProgressAttemptCompletedSessionFlashcardsAndNotes_surviveAppRestart`); `Migration4To5Test` and `AdaptiveMasteryEngineTest` (including concurrent/idempotent & rollback tests) passed.
  - Run `43731322396` (`8a8b54f`) & Run `43731397096` (`12d7201`): **FAIL** at Step 7 (`:app:testCscPart1DebugUnitTest`).
- **Post-`12d7201` Concurrency & Lifecycle Fixes Applied Locally**:
  - `ExamRepository.kt`: Added `contentWriteMutex` serializing `addSourceDoc`/`addFlashcard`/`updateFlashcardBox`, `pendingSourceWrites`/`pendingFlashcardWrites`/`pendingSessionWrites` Flow-collector guards so initial Room emissions cannot overwrite optimistic in-flight writes, `startupBindJob` + `launchWrite`/`activeWriteJobs`, `awaitPendingWritesForTesting()`, and `shutdown()`.
  - `ExamViewModel.kt`: Deduplicated `pauseAndExitToDashboard()` DB persistence via `pauseTimer(persistAttempt = false)`, tracked `checkPracticeEvidenceJob`, added `closeForTesting()`, and wired `repository.shutdown()` in `onCleared()`.
  - `CscPart1OfflineTest.kt` & `AdaptiveMasteryEngineTest.kt`: Updated restart and cleanup blocks to call `closeForTesting()` / `awaitPendingWritesForTesting()` + `shutdown()` before restarting VMs or closing Room tables.
- **Unverified / External Blockers**:
  - JDK, Gradle, and ADB are **not** installed in this sandbox, so `:app:testCscPart1DebugUnitTest`, `:app:assembleCscPart1Debug`, and physical-device installation remain **NOT EXECUTED** for the post-`12d7201` fix.
  - Non-interactive `git push` fails in this sandbox due to missing GitHub credentials (`fatal: could not read Username`). Updated transfer artifacts (`exports/csc-part1-transfer.json`, `exports/csc-part1-changes.patch`, `exports/csc-part1-changes.txt`, `exports/csc-part1-offline.bundle`, `exports/csc-part1-android-complete.zip`) are generated against base commit `12d7201e9f739f950d65fb53d70f8be01ca64230` for external push and CI execution.
- **Untouched Guardrails Verified**: `apps/web/` and `main` unmodified; no Firebase, auth, cloud sync, backend, or runtime AI dependencies added to `cscPart1`; no question bank JSON bundled in `apps/android/app/src/cscPart1/assets/`.


