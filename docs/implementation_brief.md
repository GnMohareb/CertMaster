# Task for a coding agent with access to the complete CertMaster unified workspace

You have TWO original AI Studio exports in one workspace: `apps/web` (the intended CertMaster Web Platform) and `apps/android` (native Kotlin app under `app/`, plus a separate demo React preview under `src/`). Read `README.md` and `docs/integration_audit.md` before changing anything.

**Mission:** Deliver ONE commercial CertMaster platform with TWO fully supported clients — native Android and web — sharing a single backend, authenticated identities, authoritative exam content, study progress and scores, subscriptions, and analytics. Preserve existing brand styling and useful features, but explicitly **correct the web navigation, menu hierarchy and learner usability** as described in `docs/web_ux_navigation_audit.md`. Do not remove features while reorganizing them. Do not rewrite from scratch, invent cloud success, remove existing features or modify production data without a migration plan.

## Execution order

**Phase 1 — Actual inventory and contract**

- Inventory every screen, route, integration, persistent entity, catalog/exam/question identifier and API in both source packages. Make a feature parity matrix with columns Native Android, Web, Shared backend, Completion/evidence.
- Identify the React preview in `apps/android/src` as a distinct, legacy/demo interface. The active web source of truth is `apps/web/src`; keep the extra preview archived but do not let it define shared APIs.
- Design and document the canonical v3 Firestore schema, field names/types, indexes, exam ID mappings, role/authorization model, server-only entitlement writes, and migration adapters for all existing local data. Do not merge incompatible historical records blindly. Maintain schema versioning and timestamps.
- Verify with the owner that the Firebase project from `apps/web/firebase-applet-config.json` is accessible and suitable for long-term production. Use the existing named DB as the baseline only after validation; do NOT provision a second independent database or silently use `(default)`.

**Phase 2 — Security and real cloud backend**

- Implement/verify Firebase Auth across web and Android with the **same Firebase project**. Register the Android app's real package ID/signing SHA fingerprints and obtain authentic `google-services.json` securely. Never fabricate OAuth client IDs, tokens, service-account files or successful sessions. Derive UID from verified Firebase credentials only; fail explicitly while unconfigured.
- Refactor all Firestore callers to a shared canonical schema. Android Firestore must explicitly use the named database ID; the web must use the same named database. Data and listeners must prove actual read/write synchronization in both directions.
- Write one canonical set of restrictive Firestore rules for the chosen DB. Disable client-created/upgraded subscription entitlements; process payment confirmations with a verified provider webhook via trusted backend/Admin SDK; verify authenticated JWTs for protected APIs. Prevent users from escalating `subscriptionTier` or claiming paid access. Test cross-user data isolation and invalid writes.
- Remove false API success responses and artificial delays. Make `/api/profile/sync`, `/api/subscriptions/verify`, `/api/scores/telemetry` either real authenticated, persisted and verified endpoints, or remove them in favor of direct Firestore and document that choice. Never present a 'synchronized' badge without backend acknowledgement.

**Phase 3 — Real feature parity and migration**

- Share exam catalog IDs, question bank versions, learning objectives, attempts, flashcard states, study plans, analytics and readiness. Preserve learning data; define precise on-device Room migration and web localStorage import for authenticated users, with duplicate prevention and idempotency. Keep sample data only in explicit nonproduction fixtures.
- Keep API secrets on the trusted backend; avoid paid question-bank leakage and avoid granting certification or pass guarantees based solely on practice results.
- Implement offline-first Android sync with clear unsynced state, safe retry, conflict resolution and explicit failure logs. Attach and dispose listeners appropriately. Show authenticated account/device state accurately.
- Align exam scoring and readiness calculation (shared documented formulas and golden test vectors). Preserve platform-specific visual styling; improve the web IA and usability using `docs/web_ux_navigation_audit.md` without forcing one client to mimic the other.

**Phase 4 — Learner-centered web navigation and usability**

- Implement the IA and priority recommendations in `docs/web_ux_navigation_audit.md`, retaining existing functional screens, brand styling, and capabilities. Add proper routes, per-certification context, discoverable mobile nav, relevant student tasks and genuine live-state displays; remove false content availability.
- Deliver the final sitemap, navigation mapping, feature parity and user-journey verification. Web and Android should use compatible product terminology and data identifiers, not necessarily identical layouts.
- Correct UX accessibility issues and validate with actual browser/keyboard/responsive testing.

**Phase 5 — Tests, evidence, acceptance**

- Build and run web typecheck/build and Android Gradle unit and compilation tests; fix failures with complete files.
- Run Firebase Emulator Suite security rules tests for owner/nonowner access, entitlement escalation, wrong schema, overlarge writes, missing tokens, and payment webhook authorization.
- Run true multi-client integration tests: Web signs in as student A, Android signs in as the same Firebase UID, Android submits attempt, Web dashboard reflects it; Web updates study plan/flashcard, Android reflects it; account B cannot see account A; Android offline queue syncs correctly; failed payment never unlocks, verified payment unlocks both.
- Publish test logs and evidence; mark as BLOCKED rather than PASS if actual Firebase/Google sign-in configuration or device/emulator test is unavailable.

**Output:** Preserve code in `apps/web` and `apps/android`; commit coherent changes; include schema documentation, migration scripts, API contracts, index/rules deployment configuration, runbook, parity matrix, genuine test logs, remaining blockers and deployment status. No release-ready claim without passing actual integration and authorization tests.
