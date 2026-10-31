# CertMaster — Native Android Build, Unit Test & Emulator QA Report

**Execution Date**: 2026-10-30  
**Application Directory**: `C:\CertMaster\apps\android\app`  
**Application ID**: `com.aistudio.examprep.kmwqxr`  
**Overall Status**: **BUILD SUCCESSFUL · 21/21 UNIT TESTS PASSED · APK INSTALLED & VERIFIED ON ANDROID 15 (API 35) EMULATOR**

---

## 1. Native Android Build & APK Packaging (`assembleDebug`)

- **Gradle Command**:
  ```powershell
  gradle.bat testDebugUnitTest assembleDebug --console=plain "-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"
  ```
- **Build Outcome**: `BUILD SUCCESSFUL in 2m 8s` (`49 actionable tasks`)
- **Generated APK Artifact**:
  - **Path**: `C:\CertMaster\apps\android\app\build\outputs\apk\debug\app-debug.apk`
  - **Size**: `29,263,479` bytes (`29.26 MB`)
  - **Signing Keystore**: `C:\CertMaster\apps\android\debug.keystore` (`alias = androiddebugkey`, `SHA-1 = 16:CE:BD:B7:A9:96:10:2D:B4:B0:F4:8C:AA:29:98:15:DC:57:F9:16`)

---

## 2. Live Android Emulator Installation, Launch & Orientation QA (`API 35`)

- **AVD Tested**: `FleetNex_Compact_API_35` (`sdk_gphone64_x86_64`, Android 15 / API 35, WHPX hardware acceleration `10.0.26300`)
- **Execution Log**:
  1. **Boot Verification**: `sys.boot_completed = 1`
  2. **APK Streamed Installation**:
     ```text
     adb install -r "c:\CertMaster\apps\android\app\build\outputs\apk\debug\app-debug.apk"
     Performing Streamed Install
     Success
     ```
  3. **Foreground Activity Launch (`MainActivity`)**:
     ```text
     Starting: Intent { cmp=com.aistudio.examprep.kmwqxr/com.example.MainActivity }
     ResumedActivity: ActivityRecord{474eb52 u0 com.aistudio.examprep.kmwqxr/com.example.MainActivity t8}
     VisibleActivityProcess:[ ProcessRecord{1832f76 2031:com.aistudio.examprep.kmwqxr/u0a209}]
     ```
  4. **Portrait (`480x800`) to Landscape (`800x480`, `ROTATION_90`) Orientation Verification**:
     ```text
     Physical size: 480x800
     init=480x800 240dpi mMinSizeOfResizeableTaskDp=220 cur=800x480 app=800x480 rng=480x480-800x800
     mCurrentRotation=ROTATION_90
     ```
     - Activity survived orientation rotation from Portrait (`ROTATION_0`) to Landscape (`ROTATION_90`) and back without crash or ANR.

---

## 3. Native Android Unit & Robolectric Integration Tests (`testDebugUnitTest`)

| Test Suite / Method | Status | Verified Behavior |
| --- | --- | --- |
| `CrossPlatformSyncIntegrationTest.authoritativeCalculations_matchWebPlatformFormulasBitForBit` | **PASSED** | Exact parity for `Confident Master`, `Deliberate Strategist`, `Fast Guesser`, `Analytical Hesitator`, `Methodical Verifier`, and simulation behavioral stress |
| `CrossPlatformSyncIntegrationTest.crossPlatformProfileAndEntitlements_syncBidirectionallyBetweenWebAndAndroid` | **PASSED** | Bidirectional JSON profile & entitlement ingestion/export between Web and Android (`ceh`, `aws-saa`, `sec-plus`) |
| `CrossPlatformSyncIntegrationTest.crossPlatformSimulationAttempt_ingestsFromWebAndUpdatesReadinessAndStudyPlan` | **PASSED** | Ingests Web simulation attempt into Room SQLite and recomputes 60/25/15 Readiness (`63%`) & 5-Stage Study Plan |
| `CrossPlatformSyncIntegrationTest.offlineModeQueuesMutationsAndFlushesOnReconnectWithConflictResolution` | **PASSED** | Queues offline entitlement, flashcard, and exam attempt mutations in Room `pending_sync_queue` and flushes to `0` on reconnect |
| `CrossPlatformSyncIntegrationTest.flashcardConflictResolution_prefersMostRecentReviewAndHigherBoxOnTie` | **PASSED** | Deterministic timestamp + Leitner box tie-breaker resolution |
| `CrossPlatformSyncIntegrationTest.examCatalog_normalizesCrossPlatformExamIdsConsistently` | **PASSED** | Normalizes `aws_csa` -> `aws-saa`, `sec_plus`/`sy0-701` -> `sec-plus`, verifies `SAMPLE_CONTENT_AVAILABLE` vs `CATALOG_PREVIEW`, and confirms `112` catalog count |
| `CrossPlatformSyncIntegrationTest.offlineQueue_retainsPendingOperationsWhenDeliveryFailsAndNeverReportsFalseSuccess` | **PASSED** | Retains queued operations when remote transport fails (`retryCount >= 1`, `status = "FAILED"`, returns `false`) and recovers on retry |
| `CrossPlatformSyncIntegrationTest.duplicateSimulationAttemptSync_isIdempotentAndDoesNotDuplicateResults` | **PASSED** | Idempotent ingestion of duplicate `attemptId` (`count == 1`) |
| `CrossPlatformSyncIntegrationTest.certificationContentIntegrity_neverSubstitutesCisspQuestionsForOtherExams` | **PASSED** | Verifies exact question counts (`cissp`: 8, `aws-saa`: 5, `sec-plus`: 5, `pmp`: 3, `cism`: 3, `ceh`: 3) and `0` questions for `CATALOG_PREVIEW` exams |
| `CrossPlatformSyncIntegrationTest.sharedFirebaseConfiguration_matchesWebPlatformNamedDatabase` | **PASSED** | Confirms Project ID `gen-lang-client-0788513176`, Named Firestore DB `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`, and `CANONICAL_SCHEMA_VERSION == 2` |
