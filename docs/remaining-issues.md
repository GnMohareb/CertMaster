# CertMaster Unified Ecosystem — Remaining Issues & External Dependencies

**Last Updated**: 2026-10-30

---

## 1. Resolved Critical Issues (Closed in Phases 1–5)

1. **[RESOLVED] Native Android Default Firestore Database Bug**:
   - *Previous Issue*: Android called `FirebaseFirestore.getInstance()`, targeting `(default)` instead of the named Firestore database `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`.
   - *Resolution*: Updated [CertMasterFirebaseSyncClient.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt) to pass `FIRESTORE_DATABASE_ID` to `FirebaseFirestore.getInstance(FirebaseApp.getInstance(), FIRESTORE_DATABASE_ID)`.

2. **[RESOLVED] Client-Side Subscription & Entitlement Self-Activation Vulnerability**:
   - *Previous Issue*: Clients could write `status: 'ACTIVE'` and `subscriptionTier: 'Universal Multi-Pass'` directly to Firestore, and new accounts were seeded with paid entitlements and fake historical exam attempts.
   - *Resolution*: Hardened [apps/web/firestore.rules](file:///c:/CertMaster/apps/web/firestore.rules) and [apps/android/firestore.rules](file:///c:/CertMaster/apps/android/firestore.rules), restricted new account initialization to `Free Trial` with `0` fake attempts, and implemented server-side receipt verification at `POST /api/subscriptions/verify`.

3. **[RESOLVED] Android Offline Queue Deletion Before Delivery & False Sync Success**:
   - *Previous Issue*: `ExamRepository.syncCentralProfileWithCloud()` deleted queued Room operations before transmitting them, and `syncWithBackend()` returned `true` on network exceptions.
   - *Resolution*: Implemented `CertMasterFirebaseSyncClient.deliverQueuedOperation()` and updated [ExamRepository.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/ExamRepository.kt) to delete queued items only after confirmed delivery and increment `retryCount` (`status = "FAILED"`) on error.

4. **[RESOLVED] CISSP Question Cloning Across Non-CISSP Certifications**:
   - *Previous Issue*: Selecting non-CISSP certifications on Web or Android cloned CISSP questions under the other certification's title.
   - *Resolution*: Added genuine domain-specific question banks, flashcards, study guides, and audio briefings for all 6 `FULL_PREP` certifications (`cissp`, `aws-saa`, `sec-plus`, `pmp`, `cism`, `ceh`) on both Web ([multiExamQuestions.ts](file:///c:/CertMaster/apps/web/src/data/multiExamQuestions.ts)) and Android ([DefaultQuestions.kt](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/data/DefaultQuestions.kt)), and labeled the remaining 106 catalog items as `CATALOG_PREVIEW` (Blueprint Only).

5. **[RESOLVED] Web Navigation, URL Routing & Cross-Platform Feature Parity Gaps**:
   - *Previous Issue*: Web used 5 internal-jargon tabs without URL routing, browser Back/Forward support, mobile navigation drawer, Post-Exam Review, Personal Study Notes, or AI Exam Tutor.
   - *Resolution*: Implemented the 7-section learner-centered architecture with URL hash routing (`window.location.hash`), accessible mobile drawer, active certification context switcher, Post-Exam Question-by-Question Review, Personal Notes, 5-Stage Study Plan editor, and Grounded AI Exam Tutor.

---

## 2. External Production Dependencies (Requiring User / Operator Action)

1. **Production Firebase Security Rules Deployment**:
   - The hardened v2 `firestore.rules` have been verified locally against all 14 security scenarios. Deploying them to the live Firebase project (`gen-lang-client-0788513176`) requires operator authorization and an authenticated `firebase deploy --only firestore:rules` session.
2. **Live Payment Processor Credentials (Stripe / Google Play Billing)**:
   - `POST /api/subscriptions/verify` enforces server-side receipt token validation. For commercial production launch, configure `STRIPE_WEBHOOK_SECRET` and Google Play Developer API credentials in the server environment variables.
3. **Content Authoring for Remaining 106 Blueprint-Preview Certifications**:
   - 6 flagship certifications (`CISSP`, `AWS SAA-C03`, `CompTIA Security+ SY0-701`, `PMP`, `CISM`, `CEH v12`) have full question banks, flashcards, study guides, and audio briefings. The remaining 106 catalog entries are truthfully badged as `Catalog Preview · Blueprint Only` until their question banks are authored.
