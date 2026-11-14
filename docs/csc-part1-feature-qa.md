# CSC Part 1 — feature-first market readiness review

## Scope and release gate
Do not ingest, generate, or package CSC questions until the Android app's features and UI have passed review. QIS ingestion is a later, separate milestone. Keep main unchanged. Review the existing Android Compose implementation, not a redesigned substitute.

## Feature-by-feature QA matrix
| Feature | Verification required | Current assessment |
| --- | --- | --- |
| Startup/navigation | cold launch, back stack, bottom/top nav, rotation, small screens | Not tested |
| Dashboard | CSC-only branding, no CISSP metrics or cloud claims, empty states | Existing defaults reference CISSP; needs correction |
| Exam hub | modes, time limits, empty bank behavior, question navigation | Empty-bank guard implemented; full test pending |
| Exam session | timer, pause/resume, answer changes, flags, strikes, restart recovery | Restart recovery unverified |
| Scoring/results | exact score, per-domain results, pass criteria, history | Unit/device tests pending |
| Flashcards | no CISSP sample content, navigation, spaced repetition, local persistence | Existing defaults reference CISSP; needs correction |
| Sources/audio | offline availability and correct exam scope, speech engine | Pending |
| AI tutor | cannot claim offline AI if it requires network; hide or replace with truly local feature | Pending |
| Accounts/profile | remove sign-in, SSO, subscriptions and misleading cloud statuses | Pending |
| Settings/web portal | no backend settings, sync controls or web portal in offline flavor | Pending |
| Data storage | Room history, bookmarks, progress, migrations, restart and reinstall behavior | Pending |
| Visual QA | typography, spacing, contrast, accessibility, landscape, device sizes | Pending |
| Build/security | release APK, no network permission or cloud SDK initialization, clean manifest, signed install | Pending |

## Verified code observations
- `ExamRepository` initially populated CSC with an embedded loader but had no CSC asset; this would fail during repository initialization. Feature-review mode now loads an empty bank without substituting unrelated questions.
- `ExamViewModel.startSimulation` previously proceeded into a zero-question session. It now blocks empty sessions with a clear status message.
- `ExamRepository` initializes sources, flashcards, readiness and study plan from CISSP defaults; these require CSC-specific empty states before release.
- `ExamViewModel` and `MainActivity` still expose SSO, cloud sync, backend settings, AI tutor and web portal pathways.
- Build compilation, automated tests, screenshots and physical-device testing have **not** been run in this review.

## Definition of done
No feature is marked PASS without evidence (test output, screenshot review or device observation). A market-ready claim requires complete QA, offline runtime proof, no misleading UI, and release-build validation. Only then start QIS question export and bank integration.
