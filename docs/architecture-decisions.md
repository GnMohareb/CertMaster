# CertMaster Unified Ecosystem — Architecture Decisions

**Document Version**: 2.0  
**Date**: 2026-10-30

---

## ADR-001: Single Authoritative Firebase Project & Named Firestore Database
- **Decision**: Both the Web Platform (`apps/web/`) and the Native Android App (`apps/android/app/`) connect to the same Firebase Project (`gen-lang-client-0788513176`) and the same **named** Cloud Firestore database (`ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`).
- **Context**: Native Android previously called `FirebaseFirestore.getInstance()` (which connects to `(default)` instead of the named database used by Web).
- **Implementation**: Updated [CertMasterFirebaseSyncClient.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt) to initialize Firestore via `FirebaseFirestore.getInstance(FirebaseApp.getInstance(), FIRESTORE_DATABASE_ID)`.

---

## ADR-002: Canonical Versioned Data Contract (Schema v2) & Exam Identifier Normalization
- **Decision**: Establish `CERTMASTER_SCHEMA_VERSION = 2` across TypeScript ([canonicalContract.ts](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.ts)) and Kotlin ([CanonicalDataContract.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/CanonicalDataContract.kt)) with deterministic alias normalization (`normalizeExamId`).
- **Context**: Android and Web previously used mismatched exam IDs (`aws_csa` vs `aws-saa`, `sy0-701` vs `sec-plus`), causing cross-platform attempts and entitlements to fail to join.
- **Implementation**: Both platforms normalize all incoming and outgoing exam IDs to canonical kebab-case (`cissp`, `aws-saa`, `sec-plus`, `pmp`, `cism`, `ceh`) while non-destructively migrating legacy v1 records on read.

---

## ADR-003: Server-Verified Entitlements & Hardened Firestore Security Rules
- **Decision**: Prohibit client-side writes from setting `status == 'ACTIVE'` in `/users/{userId}/subscriptions/{examId}` or `/users/{userId}/entitlements/{examId}`, and prohibit client-side escalation of `subscriptionTier` in `/users/{userId}`.
- **Context**: Previously, both Web (`purchaseExam`) and `firestore.rules` allowed any authenticated client to write `status: 'ACTIVE'` and `subscriptionTier: 'Universal Multi-Pass'` directly to Firestore without payment verification.
- **Implementation**:
  1. Hardened [apps/web/firestore.rules](file:///c:/CertMaster/apps/web/firestore.rules) and [apps/android/firestore.rules](file:///c:/CertMaster/apps/android/firestore.rules) so clients may only create/update `TRIAL`, `EXPIRED`, or `LOCKED` records and must initialize new profiles with `subscriptionTier == 'Free Trial'`.
  2. Implemented server-side receipt verification in `POST /api/subscriptions/verify` ([apps/web/server.ts](file:///c:/CertMaster/apps/web/server.ts)) and wired both Web and Android clients to verify receipts through the backend.

---

## ADR-004: Truthful Offline Sync Queue Delivery & Idempotent Attempt Ingestion
- **Decision**: Never delete pending offline sync operations until cloud/API delivery succeeds, never report failed syncs as successful, and deduplicate exam attempts by `attemptId`/`sessionId`.
- **Context**: Android's `ExamRepository.syncCentralProfileWithCloud()` previously looped over `dao.getPendingSyncOperations()` and immediately called `dao.deleteSyncOperation(op.id)` without sending the payload, while `syncWithBackend()` returned `true` even on network exceptions.
- **Implementation**: Updated [ExamRepository.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/ExamRepository.kt) to dispatch each queued operation via `CertMasterFirebaseSyncClient.deliverQueuedOperation()`, retain failed operations with incremented `retryCount` and `status = "FAILED"`, and deduplicate incoming attempts in `ingestCloudAttempt()` and `POST /api/sessions`.

---

## ADR-005: Certification Content Integrity (Full-Prep vs Catalog Preview)
- **Decision**: Never substitute CISSP questions for another certification.
- **Context**: Both Web (`SubjectCatalog.tsx`) and Android (`DefaultQuestions.kt`) previously cloned CISSP questions when launching non-CISSP certifications.
- **Implementation**: Created genuine, domain-accurate question banks, flashcards, study guides, and audio briefings for all 6 `FULL_PREP` certifications (`cissp`, `aws-saa`, `sec-plus`, `pmp`, `cism`, `ceh`) in [multiExamQuestions.ts](file:///c:/CertMaster/apps/web/src/data/multiExamQuestions.ts) and [DefaultQuestions.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/DefaultQuestions.kt), and explicitly gated the 106 `CATALOG_PREVIEW` blueprint entries.

---

## ADR-006: Learner-Centered Web Information Architecture & URL Hash Routing
- **Decision**: Restructure the Web Platform navigation into 7 learner-centered sections (`Dashboard`, `My Certifications`, `Study`, `Practice & Exams`, `Progress & Results`, `Explore Certifications`, `Account`) backed by URL hash routing (`window.location.hash`).
- **Context**: As documented in [docs/web_ux_navigation_audit.md](file:///c:/CertMaster/docs/web_ux_navigation_audit.md), the previous 5-tab state-only layout used internal jargon (`Behavioral Calibration`, `NotebookLM & Audio`), lacked browser Back/Forward support, and lacked a mobile navigation drawer.
- **Implementation**: Implemented bidirectional URL hash routing in [CertMasterContext.tsx](file:///c:/CertMaster/apps/web/src/context/CertMasterContext.tsx), an accessible mobile drawer and active certification switcher in [Header.tsx](file:///c:/CertMaster/apps/web/src/components/layout/Header.tsx), and full feature parity across Study, Practice, Progress, and Catalog views.
