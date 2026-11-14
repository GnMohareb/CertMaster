# CSC standalone Android — phased release contract

## Product decision (2026-11-13)
The first commercial release consists of **two separate Android apps** based on the existing native Kotlin/Jetpack Compose CertMaster app:
- **CSC Part 1** — application ID `com.certmaster.cscpart1`, exam ID `csc-part-1`, bundled Part 1 question bank only.
- **CSC Part 2** — application ID `com.certmaster.cscpart2`, exam ID `csc-part-2`, bundled Part 2 question bank only.

**Version 1:** Fully offline at runtime: no sign-in, Firebase, QIS, backend, or network requirement for exam/practice/flashcards/progress. Package licensed question content with each app. Preserve the existing Android UX and exam capabilities where possible. Use Room for attempts, bookmarks, scores and progress. Build-time validation must reject absent, empty, mismatched or malformed banks. Never fill missing CSC questions with unrelated certifications or invented content.

**Version 2:** Optional integration with CertMaster backend for account sync, updated question banks and entitlements. Keep offline study available. Isolate content source behind an interface now (bundled source in v1, optional remote source in v2); preserve stable question IDs and local progress. Define conflict resolution, migrations and authentication only for v2. Do not include dormant network permissions or credentials in v1.

## Engineering acceptance gate for v1
1. CSC Part 1 and Part 2 have unique application IDs, labels, icons and versioned assets.
2. Only matching exam questions appear in each build; verify distribution rights, answer keys and explanations.
3. Fresh install in airplane mode completes practice and timed exam, scoring, review, flashcards and progress.
4. Resume incomplete attempts and retain history after app/device restart.
5. No internet permission, Firebase initialization, backend calls, QIS calls or misleading subscription verification in either standalone release.
6. Automated tests for bank validation, scoring, local persistence and flavor isolation pass.
7. Both release variants build, install and run on a physical Android device; verify signing and Play requirements.
8. Main branch and integrated CertMaster product remain unchanged.

## Current implementation state
Existing `feature/standalone-android-offline-exams` branch contains a strict embedded JSON bank reader, but it is not yet wired to the exam engine. Current Gradle flavors still target CISSP/PMP/AWS, and Firebase dependencies remain. No CSC bank assets, completed standalone APKs or verified device tests have been established. This document is a specification, **not a claim of release completion**.

## Execution order
1. Identify current exam-engine, repository, UI and persistence entry points.
2. Add two CSC flavors and matching offline-only source sets and assets.
3. Wire the embedded loader through a repository interface into existing exam workflows.
4. Implement local persistence and remove standalone cloud dependencies.
5. Add licensed CSC Part 1/2 content, validation, tests and device verification.
6. Release v1; add backend integration only in v2.
