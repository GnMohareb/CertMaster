# CertMaster Unified Ecosystem — Cross-Platform Integration Status

**Last Updated**: 2026-10-30  
**Canonical Schema Version**: `2`

---

## 1. End-to-End Integration Matrix

| Domain / Subsystem | Web Platform (`apps/web/`) | Native Android (`apps/android/app/`) | Shared Backend & Firestore | Status |
| --- | --- | --- | --- | --- |
| **Firebase Project & Named Firestore DB** | `gen-lang-client-0788513176` / `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` | `FirebaseFirestore.getInstance(app, FIRESTORE_DATABASE_ID)` | Verified via `/api/health` & unit tests | **INTEGRATED & VERIFIED** |
| **Authentication & User Identity** | Firebase Google SSO + Demo Mode isolation | `SharedAuthManager` + `FirebaseAuth` UID | Isolated PII at `/users/{uid}/private/pii` | **INTEGRATED & VERIFIED** |
| **Certification Identifier Mapping** | `normalizeExamId()` in `canonicalContract.ts` | `CanonicalDataContract.normalizeExamId()` | Canonical IDs (`cissp`, `aws-saa`, `sec-plus`, `pmp`, `cism`, `ceh`) | **INTEGRATED & VERIFIED** |
| **Certification Content Integrity (112 Banks)** | `multiExamQuestions.ts` + `examBanks.ts` (`6 FULL_PREP`, `106 CATALOG_PREVIEW`) | `DefaultQuestions.kt` (`6 FULL_PREP`, `0` fake CISSP clones) | `/api/catalog/manifest` & `/api/exams/:examId/questions` | **INTEGRATED & VERIFIED** |
| **Exam Attempts & Telemetry** | `submitExamSession()` writes v2 attempt & posts to `/api/sessions` | `recordSimulationScore()` queues & syncs v2 attempt | Idempotent deduplication by `attemptId`/`sessionId` | **INTEGRATED & VERIFIED** |
| **Authoritative Readiness (60/25/15) & 5-Stage Plan** | `calculateReadinessAndStudyPlan()` | `AuthoritativeMetricsEngine.evaluateReadinessAndStudyPlan()` | `/users/{uid}/readiness/{examId}` & `/studyPlans/{planId}` | **INTEGRATED & VERIFIED** |
| **Spaced-Repetition Flashcards (Leitner Box 1–5)** | `updateFlashcardState()` with Box 1–5 & `/api/flashcards/sync` | `updateFlashcardBox()` with Leitner Box 1–5 | Deterministic conflict resolution (`resolveFlashcardConflict`) | **INTEGRATED & VERIFIED** |
| **Custom Study Notes & Grounded AI Tutor** | `StudyNotebookHub.tsx` (`Personal Notes` & `AI Exam Tutor` tabs) | `StudyVaultScreen` & `AITutorScreen` | `/api/sources/sync` & `/api/ai/tutor` | **INTEGRATED & VERIFIED** |
| **Entitlements & Subscription Security** | `purchaseExam()` verifies via `POST /api/subscriptions/verify` | `verifySubscriptionEntitlement()` API | Hardened `firestore.rules` (blocks client `ACTIVE` self-grants) | **INTEGRATED & VERIFIED** |
| **Offline Queue & Truthful Sync Status** | `syncState`: `LOCAL_ONLY`, `SYNC_PENDING`, `SYNCHRONIZED`, `SYNC_FAILED` | Room `PendingSyncOperationEntity` retained on error (`retryCount++`) | Audit logs in `/users/{uid}/syncEvents` | **INTEGRATED & VERIFIED** |
