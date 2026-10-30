# CertMaster Web — Navigation, Information Architecture & Usability Audit

**Review date:** 2026-10-30  
**Scope:** Source-code and previously supplied preview screenshot review of `apps/web/`, with high-level comparison against the native Android navigation in `apps/android/app/`. This is a **static audit, not a completed browser usability test or an accessibility certification**. No code, website, Firebase project, or production data was changed as part of this audit.

## Executive decision

**The current web navigation should be restructured, not cosmetically relabeled.** It exposes five disconnected technical features rather than the normal student journey: choose a certification → prepare a plan → study → practice → take a mock exam → understand results → continue improving. A user also lacks a reliable certification-specific context, an obvious place to manage enrolled programs, and direct-link navigation. The styling can be retained; information architecture and task flows should be improved as a coordinated project alongside backend integration.

**Important:** Retain all existing substantive features. Moving a function to a more logical place is not permission to delete it. Do not merely create attractive placeholder pages for missing features.

## Observed findings and priority

| Priority | Finding | Verified source / evidence | Required response |
|---|---|---|---|
| P0 | The primary menu is feature-/implementation-centric: `Dashboard`, `112 Exam Catalog`, `Behavioral Calibration`, `Exam Simulator`, `NotebookLM & Audio`. No `My Certifications`, `Study Plan`, or `Progress & Results` destination. | `apps/web/src/components/layout/Header.tsx` | Replace with learner-centered primary taxonomy; map every old feature to an accessible new destination. |
| P0 | The catalog **starts non-CISSP exams using remapped CISSP questions**, which misrepresents the selected exam. | `apps/web/src/components/catalog/SubjectCatalog.tsx` (`handleExamClick`, `adaptedQuestions`) | Never launch or label a bank as exam-ready without bank-specific verified content; show `Content not yet available` or a valid preview until real content exists. Audit the promised questions counts and 112 entries. |
| P0 | Payment entry presents a simulated card form and creates a `purchaseExam` action after a timer. This is misleading in a commercial UI and is separately a security problem. | `apps/web/src/components/catalog/CheckoutModal.tsx` (`handlePay`, `Simulated Stripe Elements`) and `apps/web/src/context/CertMasterContext.tsx` | Do not show a real-purchase success or unlock from a simulated form; separate explicitly marked demo mode from production verified checkout; prohibit client-granted entitlements. |
| P0 | Home and global header claim live Android/cloud synchronization regardless of the verified connection. UI also displays prepopulated example attempt/profile records. | `apps/web/src/components/dashboard/PerformanceDashboard.tsx`, `apps/web/src/components/layout/Header.tsx`, `apps/web/src/context/CertMasterContext.tsx` (`INITIAL_HISTORICAL_ATTEMPTS`, `INITIAL_PROFILE`) | Show only verified states (`Connected`, `Syncing`, `Offline`, `Pending`, `Error`, `Not configured`) and real account data. Separate sample fixtures from production UI. |
| P1 | The app switches sections through React `activeTab` state rather than addressable routes; a student cannot reliably bookmark/share a subject page or use normal browser history. | `apps/web/src/App.tsx`; `apps/web/src/context/CertMasterContext.tsx` | Add a proper browser route system, back/forward support, refresh persistence, accessible active-nav indication, and deep links. |
| P1 | The desktop navigation may be crowded; on mobile the main navigation becomes a horizontally scrollable row with no clearly visible overflow/discovery control. | `apps/web/src/components/layout/Header.tsx` (`md:hidden`, `overflow-x-auto`) | Use visible responsive navigation: a clear menu/drawer or bottom nav with a well-labeled `More`; test multiple widths and keyboard navigation. |
| P1 | The default dashboard prioritizes dense analyst jargon and a hardcoded CISSP simulation rather than the student's next action; it appears certification-specific while claiming 112-subject coverage. | `apps/web/src/components/dashboard/PerformanceDashboard.tsx` | Home should prioritize `Continue studying`, selected certification, next study-plan task, upcoming practice, last result, and an honest readiness summary; advanced analytics belongs under Progress. |
| P1 | Selecting a certification does not establish a durable application-wide learning context; the simulator's standalone start screen is CISSP-specific. | `apps/web/src/components/catalog/SubjectCatalog.tsx`, `apps/web/src/components/simulator/ExamSimulator.tsx`, `apps/web/src/components/study/StudyNotebookHub.tsx` | Introduce a selected/enrolled certification context used consistently by Study, Practice, Analytics, and dashboards. Respect the existing backend data contract. |
| P1 | Profile, subscriptions and backend/REST endpoints share a technical `Central SSO` modal, mixing student account needs with developer tools. | `apps/web/src/components/auth/CentralSSOModal.tsx` | Put Profile, Account Security, Billing/Subscriptions, and Settings in normal accessible account pages/menu. Expose developer diagnostics only under a gated admin/developer surface. |
| P1 | `Study Plan` is present in React context but not surfaced as an obvious primary learning flow; Android has an AI Tutor and a different navigation model. | `apps/web/src/context/CertMasterContext.tsx`; `apps/android/app/src/main/java/com/example/ui/components/CommonComponents.kt` | Surface Study Plan/Resume Learning; assess parity with Android features; preserve platform-specific navigation style but standardize concepts/labels. |
| P2 | `NotebookLM & Audio` is a technology-brand/feature label, not an intuitive task label; actual web playback currently uses browser speech synthesis. | `apps/web/src/components/layout/Header.tsx`, `apps/web/src/components/study/StudyNotebookHub.tsx` | Rename destination `Study`, with `Study Guides`, `Audio Lessons`, `Flashcards`, `AI Tutor` as appropriate; avoid implying a third-party integration unless it exists. |
| P2 | Study flashcard flip is a clickable `div` without obvious keyboard semantics; multiple modals need keyboard focus/dialog audits. | `apps/web/src/components/study/StudyNotebookHub.tsx`; `apps/web/src/components/auth/CentralSSOModal.tsx` | Enable keyboard access, visible focus, semantic controls, modal focus trap/return, Escape behavior, meaningful accessible names. |
| P2 | Catalog filters use internal terms `Active Entitlements` and `Locked Banks` and the navigation hardcodes `112` as an unverified universal quantity. | `apps/web/src/components/catalog/SubjectCatalog.tsx`, `apps/web/src/components/layout/Header.tsx` | Use familiar labels `My Certifications`, `Available`, `All Certifications`; derive counts from validated actual data. |

## Recommended learner-centered sitemap (proposed, not already implemented)

```text
CERTMASTER WEB — AUTHENTICATED STUDENT AREA
│
├── Dashboard                         /dashboard
│   ├── Continue learning (chosen certification)
│   ├── Today's / this week's study plan
│   ├── Next practice activity
│   ├── Recent results and readiness snapshot
│   └── Account & sync notices (only when relevant)
│
├── My Certifications                 /my-certifications
│   ├── Enrolled programs
│   └── Certification workspace       /my-certifications/:certId
│       ├── Overview
│       ├── Study Plan
│       ├── Study Guides
│       ├── Audio Lessons
│       ├── Flashcards
│       ├── AI Tutor (only if actually implemented)
│       ├── Practice Questions
│       ├── Mock Exams
│       └── Results & Readiness
│
├── Study                             /study (uses active certification)
│   ├── Study Plan
│   ├── Study Guides
│   ├── Audio Lessons
│   ├── Flashcards
│   └── AI Tutor, where supported
│
├── Practice & Exams                  /practice
│   ├── Diagnostic Assessment (behavioral calibration is an optional component)
│   ├── Domain Practice / Quizzes (only if genuine feature exists)
│   ├── Timed Mock Exams
│   ├── In-progress Exam / Resume
│   └── Exam History / Review Answers
│
├── Progress & Results                /progress
│   ├── Scores and attempt history
│   ├── Domain strengths / gaps
│   ├── Study progress
│   ├── Readiness estimates (transparent methodology)
│   └── Advanced analytical views (optional)
│
├── Certification Catalog             /certifications
│   ├── Search and filter by field, provider, level, cost
│   └── Certification detail / enrollment or purchase
│
└── Account (utility menu)             /account
    ├── Profile & Preferences
    ├── Sign In / Account Security
    ├── Billing & Subscriptions
    ├── Sync Status / Devices (only verified state)
    └── Help

ADMIN / DEVELOPER-ONLY (NOT STUDENT MAIN MENU)
└── Integration Diagnostics, Firebase coordinates, API tests
```

**Visual structure:** Keep the existing CertMaster branding, colors, typography, card styling, chart components, and overall polished feel. Desktop: prefer a persistent, scannable sidebar for six student sections, or an equally obvious noncrowded header. Use a compact header for current certification, search, account. Mobile: use a clearly operable drawer or bottom navigation with a discoverable `More` entry; do not rely on invisible sideways-scroll navigation. Apply clear selected states and a breadcrumb or contextual page title inside certification workspaces.

**Terms:** Rename `Behavioral Calibration` to a user-facing **Diagnostic Assessment** under Practice/Onboarding, with an explanation of what it measures. Rename `Exam Simulator` to **Mock Exams** (inside Practice). Rename `NotebookLM & Audio` to **Study**, with the technology-specific capabilities inside. Do not promise “official certification”, guaranteed pass, or direct NotebookLM integration without evidence.

## Core user journeys that must become easy

1. **New student:** land/sign in → search/select certification → view details and actual content availability → enroll (or a safe, verified checkout) → optional diagnostic → generated or existing plan → begin first study activity.
2. **Returning student:** land on Dashboard → identify active certification → select `Continue studying` → complete a real study activity → see progress update with genuine sync state.
3. **Multi-certification student:** switch from CISSP to PMP (or another supported program) → Study, Practice and Progress all reflect the selected program; no CISSP questions shown as PMP.
4. **Exam candidate:** start correct program's practice/mock exam → pause/resume if supported → complete → review answers and mistakes → return to targeted study → see the result on Android under the same account after actual synchronization.
5. **Mobile web user:** reach Catalog, Study Guides, Flashcards, Mock Exams, Results, and Account at a narrow screen width without guessing that hidden tabs scroll horizontally.
6. **Subscription/account user:** locate subscription and sign-in details easily; never encounter a pretend payment success; distinguish cloud-offline from synced.

## Implementation sequence for Antigravity

**UX-0: Baseline preservation.** Inventory all existing web screens, click targets, modals, study resources and data operations, and Android feature equivalents; capture desktop/mobile screenshots if browser tooling is available. Write a feature-to-destination map before moving UI. Set a baseline git commit, where appropriate.

**UX-1: Navigation & routing.** Create a single navigation configuration; replace flat feature tabs with the student taxonomy; implement browser routes, active state, deep link and history support, a clear mobile menu, and consistent page headings. Keep existing functional components mounted/accessible through the new destinations. Do not wipe exam session state on route change; ensure deliberate leave/resume behavior.

**UX-2: Certification workspace.** Introduce selected certification context, `My Certifications`, program detail, and clear content availability. Remove the fake practice-exam substitution for non-CISSP banks. Existing contextual screens may be reused rather than replaced.

**UX-3: Dashboard and terminology.** Reframe dashboard around real student next steps; move detailed cognitive charts to Progress; surface existing Study Plan; replace technical jargon and fake sync/billing states. Ensure data provenance and subscription claims are truthful.

**UX-4: Responsive and accessible operation.** Verify keyboard-only navigation, focus styling, dialogs, quiz options, flashcards, tooltip information, touch targets, responsive typography, 200% and 400% zoom, and screen-reader semantics. Target WCAG 2.2 Level AA, but do not assert compliance without an audit.

**UX-5: Function and parity tests.** Run unit and component tests for routes/menu/selection, browser navigation tests across widths, Android conceptual parity and real backend synchronization tests. UI changes must not bypass authentication or permissions. Maintain results in `docs/ux_test_results.md`.

### Acceptance checklist

- [ ] All five existing top-level sections and their meaningful functionality remain accessible from the new IA.
- [ ] A new user can choose a certification and discover what to do next without reading technical documentation.
- [ ] A returning user can continue the correct study plan from the dashboard.
- [ ] My Certifications lists only actual enrolled/accessible programs, not assumed entitlements.
- [ ] Every eligible certification has its own context; unsupported content is explicitly unavailable, never replaced by CISSP under another name.
- [ ] Study guides, flashcards, audio, assessment, mock exams, exam results, analytics and account/billing are findable via clear navigation.
- [ ] Desktop and mobile navigation are visible or obviously discoverable; no hidden essential action behind horizontal scrolling.
- [ ] Refresh, Back/Forward, copied URL and deep-link navigation work for key pages.
- [ ] Starting/pausing/resuming a mock exam preserves or intentionally confirms state changes.
- [ ] The interface never shows hardcoded sync success, payment success, or credible-looking fabricated test data as live account information.
- [ ] All interactive controls work with a keyboard; route changes announce a meaningful heading and maintain sensible focus.
- [ ] Student and developer functions are separated; students do not see implementation details such as Firebase/REST coordinates.
- [ ] Web and Android use compatible certification identifiers, user identity, progress semantics and UX terminology.
- [ ] Testing includes responsive widths ~320, 375, 768, 1024, 1440 CSS px and an automated accessibility check; failures are recorded rather than ignored.

## Agent output requirements

- `docs/web_information_architecture.md` — final sitemap, labels, old→new destination/route mapping and decision rationale.
- `docs/web_feature_parity.md` — Web vs native Android feature-by-feature status, including true/unimplemented content.
- `docs/ux_test_results.md` — browser checks, keyboard/accessibility checks, screenshots or evidence, actual successes/failures.
- `docs/progress.md` — completed code changes, pending blockers, and next work items.
- Updated web code, tests, and documentation. **Implement, do not stop at another specification.**

## External usability standards (reference only)

- Nielsen Norman Group (2024), *Menu-Design Checklist*: clear, predictable labels; visible desktop nav; current location and local navigation. https://www.nngroup.com/articles/menu-design/
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: keyboard access, consistent navigation, focus, target sizes. https://www.w3.org/TR/WCAG22/
- YaleSites, *Basic Principles of Information Architecture*: audience goals, content organization, navigation and search design. https://yalesites.yale.edu/explore-resources/basic-principles-of-information-architecture
