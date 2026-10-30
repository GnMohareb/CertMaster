# CertMaster Unified Ecosystem — Development Progress Log

**Last Updated**: 2026-10-30
**Current Phase**: Phase 1 Completed (Ready for Phase 2)
**Firebase Project ID**: `gen-lang-client-0788513176`
**Named Firestore Database**: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`
**Canonical Schema Version**: `2`

---

## 1. Baseline Inventory & Tooling Audit

### 1.1 Source-of-Truth Directories Verified
- **`apps/web/`**: Authoritative CertMaster Web Platform (React 19 + TypeScript + Vite 8 + Express + Firebase Web SDK v13).
- **`apps/android/app/`**: Authoritative Native Android Application (Kotlin + Jetpack Compose Material 3 + Room SQLite + Retrofit + Firebase Android BoM).
- **`apps/android/src/`**: Legacy React/Vite preview bundled with the Android export. **Excluded from Web source of truth** per `AGENTS.md`.

### 1.2 Baseline Build & Test Outcomes (Before Phase 1 Changes)
1. **Git Repository**: Initialized clean repository at `c:\CertMaster` and committed unmodified baseline snapshot (`commit 215be24`).
2. **Web Platform (`apps/web/`)**:
   - **Dependency Issue Identified**: `apps/web/package.json` specified `esbuild: "^0.25.0"` alongside `vite: "^8.3.0"`, causing `npm install` peer dependency conflict (`ERESOLVE`) unless `--legacy-peer-deps` is passed.
   - **Baseline Typecheck (`npm run lint`)**: `tsc --noEmit` passed (0 errors).
   - **Baseline Production Build (`npm run build`)**: `vite build` succeeded (`dist/assets/index.js` built in 1.97s).
   - **Baseline Automated Tests**: No `npm test` script was configured in `apps/web/package.json`.
3. **Android Application (`apps/android/app/`)**:
   - **Build Environment Issue Identified**: `gradlew.bat` was absent from `apps/android/` and default system `PATH` pointed to Java 1.8. Resolved by using local JDK 17 (`C:\Users\gadly\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2`) and Gradle 9.3.1 (`C:\Users\gadly\.gradle\wrapper\dists\gradle-9.3.1-bin\...\gradle.bat`) with `-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT`.
   - **Baseline Kotlin Compilation (`compileDebugKotlin`, `compileDebugUnitTestKotlin`)**: Passed cleanly.
   - **Baseline Unit & Robolectric Tests (`testDebugUnitTest`)**:
     - `ExampleUnitTest` (5 pure JVM tests): **PASSED**.
     - `CrossPlatformSyncIntegrationTest`, `RoomCacheRobolectricTest`, `ExampleRobolectricTest` (14 Robolectric tests): **FAILED at baseline** with `java.lang.UnsupportedOperationException: Failed to create a Robolectric sandbox: Android SDK 36 requires Java 21 (have Java 17)` because `@Config(sdk = [36])` was hardcoded in all 3 test classes.
   - **Baseline Node Integration Suite (`cd apps/android && npm test`)**: 4/4 tests in `tests/crossPlatformIntegration.test.mjs` **PASSED**.

### 1.3 Baseline Data Contract & Integration Bugs Identified
1. **Internal Web Exam Identifier Mismatch (`sy0-701` vs `sec-plus`)**:
   - `apps/web/src/data/examBanks.ts` defined CompTIA Security+ with `id: 'sy0-701'`, whereas `INITIAL_PROFILE.subscriptions` in `apps/web/src/context/CertMasterContext.tsx` used `'sec-plus'` in some views and `'sy0-701'` in others, and Android (`ExamCatalog.kt` / `CentralProfile.kt`) used `'sec_plus'`.
2. **Cross-Platform Exam Identifier Divergence (`aws_csa` vs `aws-saa`)**:
   - Android `CentralProfile.kt` used `examId = "aws_csa"` and `examId = "sec_plus"`, while Web `examBanks.ts` used `id = "aws-saa"`.
3. **Android Room `SubStatus.TRIAL` Deserialization Bug**:
   - `apps/android/app/src/main/java/com/example/data/local/UserProfileEntity.kt` line 114 called `SubStatus.valueOf(obj.optString("status", "LOCKED"))`. When receiving `"TRIAL"` from Web (where Android's enum constant is `TRIAL_ACTIVE`), `SubStatus.valueOf("TRIAL")` threw `IllegalArgumentException` and silently downgraded the user's trial subscription to `LOCKED`.
4. **Formula Divergence Between Web (`CertMasterContext.tsx` / `server.ts`) and Android (`AuthoritativeMetricsEngine.kt`)**:
   - Web `CertMasterContext.tsx` and `server.ts` used ad-hoc inline formulas for behavioral stress (`50 + avgDwellSec * 0.4 + totalSwitches * 3`), archetype classification, and readiness (`scorePct + 6`), whereas Android `AuthoritativeMetricsEngine.kt` used the canonical 5-archetype classifier, simulation stress formula (`min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))`), and 60/25/15 weighted readiness formula.

---

## 2. Phase 1 Implementation Summary (Completed)

### 2.1 Canonical Versioned Data Contract (`schemaVersion: 2`)
- Authored [docs/canonical_data_contract.md](file:///c:/CertMaster/docs/canonical_data_contract.md) and updated [SHARED_INTEGRATION_CONTRACT.md](file:///c:/CertMaster/apps/web/android-integration-package/SHARED_INTEGRATION_CONTRACT.md) and [apps/android/firebase-blueprint.json](file:///c:/CertMaster/apps/android/firebase-blueprint.json).
- Created [apps/web/src/lib/canonicalContract.ts](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.ts) and unified [apps/web/src/types/certmaster.ts](file:///c:/CertMaster/apps/web/src/types/certmaster.ts) to establish `CANONICAL_SCHEMA_VERSION = 2`.
- Standardized exam identifiers across both platforms via `normalizeExamId` and `matchesExamId` in both [canonicalContract.ts](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.ts) and [ExamCatalog.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/ExamCatalog.kt):
  - `aws_csa`, `aws-saa`, `saa-c03` -> `aws-saa`
  - `sec_plus`, `sy0-701`, `security_plus`, `sec-plus` -> `sec-plus`
  - `n10-008`, `net_plus`, `net-plus` -> `net-plus`
  - `cysa-003`, `cy0-003`, `cysa-plus` -> `cysa-plus`
  - `pt0-002`, `pentest-plus` -> `pentest-plus`
  - `cas-004`, `casp-plus` -> `casp-plus`
  - `rhcsa-ex200`, `rhcsa` -> `rhcsa`
  - `rhce-ex294`, `rhce` -> `rhce`
- Updated CompTIA Security+ in [apps/web/src/data/examBanks.ts](file:///c:/CertMaster/apps/web/src/data/examBanks.ts#L442) and [apps/web/src/context/CertMasterContext.tsx](file:///c:/CertMaster/apps/web/src/context/CertMasterContext.tsx#L167) to canonical ID `'sec-plus'`.

### 2.2 Unified Cross-Platform Formulas & Models
- Aligned [CertMasterContext.tsx](file:///c:/CertMaster/apps/web/src/context/CertMasterContext.tsx) and [server.ts](file:///c:/CertMaster/apps/web/server.ts) with Android [AuthoritativeMetricsEngine.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/domain/AuthoritativeMetricsEngine.kt) so both platforms execute identical formulas for:
  1. **Behavioral Archetype Classification & Baseline Stress** (`Confident Master`, `Deliberate Strategist`, `Fast Guesser`, `Analytical Hesitator`, `Methodical Verifier`).
  2. **Simulation Behavioral Stress** (`min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))`).
  3. **Domain Cognitive Stress Score & Level** (`CRITICAL_STRESS`, `HIGH_ATTENTION`, `MODERATE_PRACTICE`, `ON_TRACK`, `MASTERED`).
  4. **Exam Readiness (60% Simulation Avg + 25% Diagnostic Baseline + 15% Flashcard Mastery)**, Pass Probability, Pass Guarantee Qualification, and 5-Stage Mastery Study Plan milestones.
  5. **Spaced-Repetition Flashcards**: Bidirectional mapping between Leitner `boxLevel` (`1..5`) and `state` (`unstudied`, `needs_review`, `known`).
- Updated Android [CentralProfile.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/model/CentralProfile.kt), [UserProfileEntity.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/local/UserProfileEntity.kt), [ExamConfig.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/model/ExamConfig.kt), and [CertMasterFirebaseSyncClient.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt) to support `schemaVersion: 2`, `preferredTheme`, `targetExamId`, `lastActivePlatform`, `contentStatus`, and `SubStatus.fromWebStatusString("TRIAL")`.

### 2.3 Non-Destructive Legacy Data Migration Strategy
- Implemented non-destructive in-memory and on-read migrators in [canonicalContract.ts](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.ts) (`migrateLegacyProfile`, `migrateLegacyAttempt`, `migrateLegacyFlashcard`, `migrateLegacyStudyPlan`, `migrateLegacyStudySource`) and in Android [CertMasterFirebaseSyncClient.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt).
- No production Firebase data was deleted or destructively modified.

---

## 3. Next Steps — Phase 2 (Firebase Authentication, Shared Database Integration, and Security)
1. Fix Android named Firestore database initialization (`FirebaseFirestore.getInstance(app, "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001")`) in `CertMasterFirebaseSyncClient.kt`.
2. Replace hardcoded demo identity fallbacks (`usr_gnmohareb_cissp_001`) with real Firebase Authentication UID binding across both clients while preserving explicit `LOCAL_ONLY`, `SYNC_PENDING`, `SYNCHRONIZED`, and `SYNC_FAILED` sync states.
3. Harden entitlement security so client writes cannot self-grant paid `ACTIVE` subscriptions without server-side verification, and validate `firestore.rules`.
