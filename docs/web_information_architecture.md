# CertMaster Web — Information Architecture & Usability Specification

**Authoritative Architecture Document**  
**Version:** 2.0.0  
**Updated:** 2026-11-06  
**Context:** Full restructuring of `apps/web` based on `docs/web_ux_navigation_audit.md` and user requirements for unified Web Portal (all 112 exams) + dedicated single-exam mobile apps with cross-channel entitlements.

---

## 1. Executive Summary & Strategy

The CertMaster ecosystem operates on a **hub-and-spoke omnichannel architecture**:
* **Web Platform (`apps/web`):** The comprehensive central learning portal housing **all 112 certification tracks**. Students can browse the full vendor registry (ISC2, CompTIA, AWS, PMI, ISACA, Cisco), manage multiple enrolled certifications, take full mock exams, study notebook guides, and download or bridge to the companion mobile app for their specific exam.
* **Mobile Companion Apps (`apps/android`):** Dedicated standalone apps on Google Play (e.g. *CertMaster CISSP*, *CertMaster PMP*, *CertMaster AWS-SAA*) powered by Gradle product flavors. Each mobile app provides a focused, clutter-free single-exam experience with a **50-Question Free Diagnostic Assessment** and a direct upgrade path to the Complete Exam Pass.
* **Universal Omnichannel Entitlements:** Paying on any channel (Web via Stripe or Mobile via Google Play IAP) cryptographically provisions an `ACTIVE` entitlement with `universalAccess: true` in the shared named Firestore database (`ai-studio-certmasterwebpla-...`), unlocking complete access across both devices for the same Google SSO account.

---

## 2. Final Web Sitemap & Route Structure

The web application utilizes hash-based addressable routing (`/#/section/subtab?exam=certId`) ensuring browser history, bookmarking, and deep links work reliably without full-page reloads.

```text
CERTMaster WEB PLATFORM (All 112 Exams Portal)
│
├── Dashboard                             /#/dashboard
│   ├── Active Certification Overview & Hero Practice Actions
│   ├── Today's Study Target & Readiness Score Gauge (0–100%)
│   ├── Quick Mock Exam Launch (Single Click)
│   ├── Recent Simulation History & Attempt Records
│   └── Android Companion Sync Status Indicator
│
├── My Certifications                     /#/my-certifications
│   ├── Enrolled & Full-Prep Track Switcher (CISSP, AWS-SAA, Sec+, PMP, CISM, CEH)
│   └── Active Certification Workspace    /#/my-certifications/:certId
│       ├── Domain Framework Overview
│       ├── Study Guides & Citations
│       ├── Audio Lesson Briefings
│       ├── Leitner Box Spaced Repetition Flashcards
│       ├── Dedicated Mobile App Bridge (Get Android Companion App for :certId)
│       └── Domain Readiness & Pass Probability Snapshot
│
├── Study Hub                             /#/study
│   ├── Study Guides & Official Citations /#/study/guides
│   ├── Multi-Speaker Audio Briefings     /#/study/audio
│   └── Spaced Repetition Flashcards      /#/study/flashcards
│
├── Practice & Exams                      /#/practice
│   ├── Diagnostic Benchmark Assessment   /#/practice/diagnostic
│   └── Full-Length Timed Exam Simulator  /#/practice/mock
│       ├── Strikethrough Distractor Mode
│       ├── Flag for Review
│       └── Question Navigator & Timer Controls
│
├── Progress & Results                    /#/progress
│   ├── Readiness Assessment & Pass Gauge /#/progress/readiness
│   ├── Historical Score Trend Chart      /#/progress/trends
│   └── Domain Mastery Breakdown          /#/progress/domains
│
├── Explore Catalog                       /#/catalog
│   ├── Filter by Vendor (AWS, CompTIA, ISC2, PMI, ISACA, Microsoft, Cisco)
│   ├── Search by Code, Title, or Difficulty Level
│   └── Evidence-Based Content Classification:
│       ├── Sample Content Available (Verified questions, guides, cards)
│       └── Catalog Blueprint Preview (Domain blueprint only)
│
└── Account & Sync                        /#/account
    ├── Central Profile & Google SSO Status
    ├── Server-Verified Entitlements & Subscription Tier
    ├── Cross-Platform Android Companion Sync Log
    └── Automated 5-Step Ecosystem Verification Suite
```

---

## 3. Old → New Destination Mapping

Every substantive feature from the original technical layout has been preserved and mapped to an intuitive learner destination:

| Legacy Technical Screen | Legacy URL/Tab | New Learner Destination | New Route | UX Improvement |
| :--- | :--- | :--- | :--- | :--- |
| `Dashboard` (Dense Telemetry) | `dashboard` | **Dashboard** | `/#/dashboard` | Prioritizes student next action, readiness gauge, and quick test launch over analyst jargon. |
| `112 Exam Catalog` | `catalog` | **Explore Certifications** & **My Certifications** | `/#/catalog` & `/#/my-certifications` | Honest content availability tags (`Sample Content` vs `Blueprint Preview`); dedicated workspace for enrolled exams. |
| `Behavioral Calibration` | `behavioral` | **Diagnostic Assessment** | `/#/practice/diagnostic` | Framed as an onboarding 50-question baseline assessment with clear cognitive stress coaching. |
| `Exam Simulator` | `simulator` | **Practice & Exams** | `/#/practice/mock` | Clear mock exam interface, persistent timers, domain filters, and strikethrough distractor tools. |
| `NotebookLM & Audio` | `study` | **Study Hub** | `/#/study/guides`, `/#/study/audio`, `/#/study/flashcards` | Rebranded around learner tasks (Guides, Audio, Flashcards) rather than technology product names. |
| `Central SSO Modal` | Technical Modal | **Account & Sync** | `/#/account` | Clean student account settings separated from developer backend configuration. |

---

## 4. Cross-Platform Bridge (Web → Mobile Companion)

When a student explores or enrolls in an exam on the Web Portal:
1. In `My Certifications` (`/#/my-certifications`), the platform presents a **"CertMaster [Exam Code] Mobile Companion App"** banner.
2. The user is prompted to download the dedicated mobile app on their phone for on-the-go practice with **50 Free Assessment Questions**.
3. Sign-in with the same Google SSO account connects their web study history, flashcard Leitner boxes, and readiness scores across both devices.
4. Upgrading on either channel activates universal access across both platforms.
