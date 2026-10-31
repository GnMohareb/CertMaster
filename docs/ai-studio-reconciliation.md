# CertMaster — Google AI Studio & Local Repository Reconciliation Guide

**Date**: 2026-10-30  
**Scope**: Synchronizing local workspace (`C:\CertMaster`) with Google AI Studio Projects (`CertMaster Web Platform` and `CertMaster Android`)

---

## 1. Authoritative Source-of-Truth Architecture

The CertMaster ecosystem consists of two exports originally created in Google AI Studio and unified in the local repository `C:\CertMaster`:

| Application | Local Authoritative Directory | Google AI Studio Export Role | Legacy / Non-Authoritative Directories |
| --- | --- | --- | --- |
| **CertMaster Web Platform** | `C:\CertMaster\apps\web` | Authoritative React 19 + TypeScript + Vite + Express + Firebase Web App | None |
| **CertMaster Native Android** | `C:\CertMaster\apps\android\app` | Authoritative Kotlin + Jetpack Compose + Room + Retrofit + Firebase Android App | `C:\CertMaster\apps\android\src` (React/Vite preview bundled by AI Studio Android export — **not** the production Web app and **not** the native Android app) |

---

## 2. How to Synchronize Changes Back to Google AI Studio (If Continuing in AI Studio)

### A. Updating the Google AI Studio Web Project (`apps/web/`)
Copy the following modified and newly created files from `C:\CertMaster\apps\web` into the Google AI Studio Web Platform workspace:
1. `server.ts` — Authenticated Express backend (`requireBearerAuth`, `verifyUidOwnership`, cryptographic HMAC-SHA256 `POST /api/subscriptions/verify` + Sandbox mode, live `@google/genai` + `LOCAL_GROUNDED_FALLBACK` AI Tutor, and cross-platform sync endpoints).
2. `firestore.rules` & `firestore.rules.test.ts` — Hardened v2 Firestore Security Rules and 14 Dirty Dozen & Entitlement Escalation verification tests.
3. `src/types/certmaster.ts` — Canonical `schemaVersion: 2` data models and `EvidenceBasedContentStatus`.
4. `src/lib/canonicalContract.ts` & `src/lib/canonicalContract.test.ts` — Shared normalization, 60/25/15 readiness, behavioral archetypes, Leitner conflict resolution, evidence-based content audit (`ACTUAL_BUNDLED_CONTENT_COUNTS`), and 11 automated test suites.
5. `src/data/examBanks.ts` & `src/data/multiExamQuestions.ts` — All 112 exam banks with exact bundled question counts (`8, 5, 5, 3, 3, 3` and `0` for the 106 catalog previews).
6. `src/context/CertMasterContext.tsx`, `src/App.tsx`, `src/components/layout/Header.tsx`, `src/components/dashboard/PerformanceDashboard.tsx`, `src/components/catalog/SubjectCatalog.tsx`, `src/components/simulator/ExamSimulator.tsx`, `src/components/study/StudyNotebookHub.tsx`.

### B. Updating the Google AI Studio Android Project (`apps/android/`)
Copy the following modified files from `C:\CertMaster\apps\android` into the Google AI Studio Android workspace:
1. `app/src/main/res/values/sso_config.xml` & `.env.example` — Aligned to Web OAuth Client ID `814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com` and Firebase Project `gen-lang-client-0788513176`.
2. `app/src/main/java/com/example/auth/SharedAuthManager.kt` — Programmatic `FirebaseOptions` initialization and shared OAuth client ID.
3. `app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt` — Named Firestore database (`ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`) and truthful offline queue delivery.
4. `app/src/main/java/com/example/network/ApiClient.kt` & `app/src/main/java/com/example/network/ExamApiService.kt` — Automatic HMAC-signed Bearer token header injection and normalized API paths.
5. `app/src/main/java/com/example/data/DefaultQuestions.kt` & `app/src/main/java/com/example/data/ExamCatalog.kt` — Exact 27 verified sample questions across the 6 active tracks (`8, 5, 5, 3, 3, 3`), 112 catalog count, and `SAMPLE_CONTENT_AVAILABLE` vs `CATALOG_PREVIEW` classification.
6. `app/src/main/java/com/example/data/ExamRepository.kt`, `app/src/main/java/com/example/model/CentralProfile.kt`, `app/src/main/java/com/example/ui/screens/ExamSelectorScreen.kt`, `app/src/main/java/com/example/ui/screens/ExamsHubScreen.kt`, `app/src/main/java/com/example/ui/screens/AITutorScreen.kt`.
7. `firestore.rules` & `app/src/test/java/com/example/CrossPlatformSyncIntegrationTest.kt`.

---

## 3. Recommended Source-of-Truth Going Forward

- **Recommended Primary Repository**: Maintain the local Git repository (`C:\CertMaster`) pushed to a unified GitHub/GitLab monorepo as the **single authoritative source of truth** for both `apps/web/` and `apps/android/app/`.
- **Preventing Drift**:
  - Never edit `apps/android/src/` (the legacy AI Studio React preview) expecting changes to appear in the production Web app (`apps/web/`) or native Android app (`apps/android/app/`).
  - Run `cd apps/web && npm test` and `cd apps/android && ./gradlew testDebugUnitTest` in CI on every commit to enforce schema v2 parity and byte-for-byte `firestore.rules` equivalence.
