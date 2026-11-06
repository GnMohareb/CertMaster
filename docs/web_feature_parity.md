# CertMaster — Web Platform vs. Native Android Feature Parity Matrix

**Document Version:** 2.0.0  
**Updated:** 2026-11-06  
**Scope:** Functional and conceptual parity between `apps/web/` (React/Vite/Express) and `apps/android/app/` (Kotlin/Jetpack Compose/Room SQLite).

---

## 1. Architectural Roles

| Dimension | Web Platform (`apps/web`) | Dedicated Android Apps (`apps/android/app`) |
| :--- | :--- | :--- |
| **Primary Role** | Central Learning Portal & Desktop Simulator | Mobile Companion & On-the-Go Practice |
| **Catalog Scope** | All 112 Exam Banks & Registries | Single Dedicated Exam per App (e.g. CertMaster CISSP) |
| **Primary Tech Stack** | React 19, TypeScript, Tailwind CSS, Express, Firebase Web SDK | Kotlin, Jetpack Compose, Room SQLite, Firebase Android SDK |
| **Free Tier Experience** | 50-Question Free Benchmark / Sample Tracks | 50-Question Free Diagnostic Assessment |
| **Offline Capability** | LocalStorage state persistence & online fetch | Full offline Room SQLite caching with background sync queue |
| **Continuous QIS Streaming** | Dynamic ingestion API (`/api/qis/ingest`) | Synced downstream from CertMaster Cloud |

---

## 2. Feature-by-Feature Parity Table

| Feature / Domain | Web Platform Implementation | Native Android Implementation | Parity Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Firebase Auth (Google SSO) & Signed Bearer Token | Firebase Auth (Google Sign-In Credential Manager) | **100% Shared UID** | Both platforms authenticate against `gen-lang-client-0788513176`. |
| **Database Coordination** | Named Firestore: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001` | Named Firestore SDK Instance (`FirebaseFirestore.getInstance(namedDb)`) | **100% Synced** | Both read/write from the identical named database with Schema v2. |
| **Diagnostic Assessment** | 50-Question Benchmark (`/#/practice/diagnostic`) | 50-Question Assessment (`ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT`) | **100% Parity** | Both calculate identical readiness percentage and domain stress. |
| **Timed Mock Exams** | Full Exam Simulator with timer, strikethrough, and flag tools | Compose Exam Simulation with timer, strikethrough, and flag tools | **100% Parity** | Both support pause/resume and full review mode. |
| **Study Guides** | Markdown / Card Domain Summaries (`/#/study/guides`) | Notebook Sources Screen (`NotebookSourcesScreen.kt`) | **100% Parity** | Domain frameworks and citations matched per track. |
| **Audio Lessons** | Browser Speech Synthesis Multi-Speaker Audio (`/#/study/audio`) | Android TTS Multi-Speaker Audio (`AudioOverviewScreen.kt`) | **100% Parity** | Multi-turn audio briefings for Maya and Liam. |
| **Flashcards** | 5-Box Leitner Spaced Repetition (`/#/study/flashcards`) | 5-Box Leitner Spaced Repetition (`FlashcardsScreen.kt`) | **100% Parity** | Shared conflict resolution; Box 1–5 progression synced. |
| **Readiness Scoring** | Authoritative 60/25/15 Formula (`calculateAuthoritativeReadiness`) | Authoritative 60/25/15 Formula (`AuthoritativeMetricsEngine.kt`) | **100% Parity** | 60% simulations + 25% calibration + 15% flashcards. |
| **Omnichannel Entitlements** | Server-verified Stripe checkout (`/subscriptions/verify`) | Google Play Billing verified via backend webhook | **100% Shared** | Purchase on either channel activates `universalAccess: true` everywhere. |
| **Back Navigation** | Browser Hash History (`popstate`, back/forward support) | Jetpack Compose `BackHandler` with internal screen stack | **100% Native Feel** | Natural back gestures work without exiting app unexpectedly. |

---

## 3. Evidence-Based Content Status Across Tracks

| Exam Code | Track Title | Verified Scenario Questions | Study Guides | Audio Lessons | Flashcards | Content Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CISSP** | Certified Information Systems Security Professional | 150+ (QIS streaming) | 8 Domains | 8 Briefings | 24 Cards | **Full Prep Available** |
| **PMP** | Project Management Professional | 50+ | 3 Domains | 3 Briefings | 12 Cards | **Sample Content Available** |
| **AWS-SAA** | AWS Solutions Architect Associate | 50+ | 4 Domains | 4 Briefings | 12 Cards | **Sample Content Available** |
| **Sec+** | CompTIA Security+ (SY0-701) | 50+ | 5 Domains | 5 Briefings | 15 Cards | **Sample Content Available** |
| **CISM** | Certified Information Security Manager | 40+ | 4 Domains | 4 Briefings | 10 Cards | **Sample Content Available** |
| **CEH** | Certified Ethical Hacker | 40+ | 5 Domains | 5 Briefings | 10 Cards | **Sample Content Available** |
| **106 Other Banks** | Enterprise Catalog (Cisco, Microsoft, etc.) | 0 (Blueprints) | 0 | 0 | 0 | **Catalog Blueprint Preview** |
