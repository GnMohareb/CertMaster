# CertMaster — UX, Usability & Cross-Platform Test Results

**Date of Verification:** 2026-11-06  
**Execution Environment:** Windows Shell, Samsung Galaxy A05 (SM-A055M, Android 15, Serial `R92X91KHRKV`), Chromium Dev Server (`http://localhost:3000`).

---

## 1. Physical Device Verification (Samsung Galaxy A05)

| Test Item | Device Viewport | Verified Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Back Navigation & Gestures** | 360 × 800 dp (720 × 1600 px) | Swiping back or pressing Android back navigation pops the Compose screen stack through sub-screens (Flashcards → Dashboard) safely without closing the app. | **PASS** |
| **Top App Bar Layout** | 360 dp width | Exam title ("CISSP • PASS 70% • Tap to switch") is completely readable without clipping. 3 primary buttons (Sync, Switch, Profile) + 3-dot overflow menu fit cleanly. | **PASS** |
| **Overflow Menu Operation** | 360 dp width | Tapping `⋮` opens popup menu with "CertMaster Web Hub" and "Backend Settings & Sync" without horizontal scroll or layout breaks. | **PASS** |
| **Hero Practice Card** | 360 dp width | "Free 50-Question Assessment" appears immediately on launch with prominent "Free 50-Q Test" button. | **PASS** |
| **50-Q Free Assessment Gate** | 360 dp width | Free tier users are capped at 50 questions with 75-minute timer (1.5 min/Q). | **PASS** |
| **Upgrade Conversion Flow** | 360 dp width | Completing or reviewing the 50-question test displays the "Upgrade to Complete Exam Pass" card. | **PASS** |

---

## 2. Web Responsive Viewport Audit

| Viewport Width | Tested Surface | Observed Behavior | Status |
| :--- | :--- | :--- | :--- |
| **320 px (Compact Mobile)** | Header & Navigation | Navigation collapses into a toggleable accessible Drawer (`X` close, Escape key support). No horizontal scroll overflow. | **PASS** |
| **375 px (Standard Mobile)** | My Certifications & Workspace | Enrolled certification cards stack vertically; "Get Mobile Companion App" card wraps cleanly. | **PASS** |
| **768 px (Tablet Portrait)** | Practice Simulator | Exam question split-pane adjusts; question navigation palette renders below question prompt. | **PASS** |
| **1024 px (Tablet Landscape)** | Dashboard | 2-column analytics view with score trajectory chart and readiness gauge side-by-side. | **PASS** |
| **1440 px (Desktop)** | Full Portal | Max container width constrained to `max-w-7xl` (1280px); persistent header with active certification badge. | **PASS** |

---

## 3. Keyboard & Accessibility Verification (WCAG 2.2 Level AA Targets)

* **Route Change & History:** Browser hash changes (`/#/dashboard`, `/#/study`, `/#/practice`) update `document.title` and breadcrumbs contextually.
* **Flashcard Flip:** Flashcards support both mouse click and keyboard activation (Enter / Space) to flip and advance.
* **Simulator Shortcuts:** In Exam Simulator, options can be selected with number keys (`1`, `2`, `3`, `4`) or letter keys (`A`, `B`, `C`, `D`), flagged with `F`, and struck through with `S`.
* **Modal Dialog Focus:** Modals (`CentralSSOModal`, `CheckoutModal`, `CrossPlatformSyncModal`) listen for `Escape` key events to dismiss safely and prevent focus trapping.
* **Truthful Sandbox Labeling:** The checkout modal is explicitly labeled with a `TEST / SANDBOX GATE` badge to eliminate misleading payment impressions.

---

## 4. Automated Integration & Contract Test Suite

Ran node native test runner against `apps/web/src/lib/canonicalContract.test.ts`:

```text
✔ 1. Canonical Schema Version & Shared Firebase Identifiers (1.56ms)
✔ 2. Cross-Platform Exam Identifier Normalization & Alias Matching (0.70ms)
✔ 3. Behavioral Archetype & Stress Classification Parity with Android AuthoritativeMetricsEngine (0.28ms)
✔ 4. Simulation Stress & Domain Stress Formula Parity with Android (0.20ms)
✔ 5. Authoritative Readiness (60/25/15) & 5-Stage Mastery Plan Calculation (2.59ms)
✔ 6. Flashcard Leitner Box Mapping & Conflict Resolution (0.45ms)
✔ 7. Non-Destructive Legacy v1 -> v2 Data Migrations (Android & Web Payloads) (1.21ms)
✔ 8. Firestore Security Rules Parity & Adversarial Entitlement Protection (2.71ms)
✔ 9. Evidence-Based Certification Content Integrity Across All 112 Exam Banks (0.65ms)
✔ 10. Backend Security Verification: Bearer Auth, UID Ownership, Cryptographic Webhook & Sandbox Payment Gate (235.96ms)
✔ 11. End-to-End Cross-Platform Synchronization Suite (Scenarios A, B, C, and D) (192.45ms)
✔ 12. Firebase ID token verification is cryptographic; no unauthenticated token issuer; secrets fail closed (160.28ms)

All 12 Test Suites Passed (100% Green, 0 Failures).
```
