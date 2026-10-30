# CertMaster — operating instructions for Google Antigravity agents

## Mission
Integrate the *existing* native Android and web applications into one functional CertMaster product, using the current code rather than rebuilding either product. **The existing web navigation and learner UX are explicitly in scope for correction:** review `docs/web_ux_navigation_audit.md` and restructure the web information architecture while retaining the existing CertMaster visual identity and functional features. Complete real backend integration, secure entitlements, and cross-platform tests. Make implementation changes, not just documents. Do not claim a passing end-to-end test unless it actually executes.

## Source-of-truth directories
- `apps/web/`: **real web platform**, React/Vite/Express/Firebase. Preserve its visual identity and working features; **improve its navigation, information architecture and user journeys** as specified in `docs/web_ux_navigation_audit.md`.
- `apps/android/app/`: **native Android application**, Kotlin/Jetpack Compose. Preserve existing native screens and workflow.
- `apps/android/src/`: separate React/Vite preview included with the Android export. This is *not* the web production app and is *not* the native Android app; do not mistakenly use it as the web source of truth.
- `docs/integration_audit.md`: verified static integration gaps and precise file references.
- `docs/implementation_brief.md`: implementation context.
- `docs/web_ux_navigation_audit.md`: **required** source-based web navigation/usability findings, prioritized fixes, recommended learner sitemap, journey tests, and UX acceptance criteria.

## Essential backend requirements
- The current web export references Firebase Project ID `gen-lang-client-0788513176` and *named* Firestore database `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`. Verify this configuration exists and is accessible before making live changes. Do not create a second Firebase project/database without explicit user approval.
- Native Android code currently uses default Firestore (`FirebaseFirestore.getInstance()`), which is wrong for a named Firestore database. Use the appropriate named-database Firebase SDK API after verifying compatibility.
- Choose **one canonical versioned data contract** for users, exam catalogs, questions, attempts, progress, flashcards, analytics, study plans, and entitlements. Make both clients conform; preserve production data, use safe migrations where necessary.
- Users must have the same Firebase Auth UID on both clients. Never use hardcoded demo accounts or fallback demonstration identity for production synchronization.
- Remove misleading mock success paths: `apps/web/server.ts` profile sync and subscription verification; `apps/android/src/services/apiSyncService.ts`; native Android Firebase sync/repository error handling. Distinguish `local-only`, `sync pending`, `sync success`, and `sync failed` states.
- Never let client writes create paid subscriptions or set `subscriptionTier`/entitlements to ACTIVE; only an authenticated server-side payment verification process may grant paid access. Implement and test restrictive Firestore rules. Do not deploy permissive existing rules.
- Do not seed fake historical exam attempts, active subscription access, or mock user data into real production accounts.
- Keep secrets out of code, commits, and logs. Firebase public client config is not authorization; protect all data with auth and rules.

## Working approach
1. Inventory both codebases and existing package scripts/build tooling; read audit and implementation brief.
2. Establish a clean baseline (git commit if appropriate), run available tests and builds, document initial outcomes in `docs/progress.md`. **Audit the current web menu and preserve every working feature before moving it.**
3. Present a concise architecture decision, canonical data schema **and revised web navigation sitemap**, with precise code changes planned; then IMPLEMENT the changes by feature and verify them. Do not stop after planning unless a hard external dependency blocks progress.
4. Implement shared authentication and secure database access; confirm the correct named database in both clients.
5. Implement real read/write flows and explicit errors for profiles, exam catalog/attempts, progress, plans and analytics. Do not equate same React mock with native Android integration.
6. Close entitlement/payment bypasses and validate Firestore rules using Firebase Emulator Suite or other executable security test tooling.
7. Run web build/lint/tests, Android Gradle compile/tests where feasible, Firebase emulator rules tests, and cross-client synchronization tests where permitted. Preserve logs/evidence in `docs/test-results.md`.
8. Implement the web UX/navigation changes in `docs/web_ux_navigation_audit.md`: learner-centered menus, My Certifications, certification context, route/back support, accessible mobile navigation, dashboard prioritization, truthful content availability and sync states. Ensure the Android navigation and web navigation use consistent concepts without forcing identical layouts. Validate using actual browser tests.
9. Update `docs/progress.md` with changed files, verified behaviors, unverified behaviors, external blockers, and next concrete steps. Never label untested production sync as done.

## Safety and scope
- Keep the existing CertMaster colors, branding and design language, and do not remove working features. **The web menu, navigation hierarchy, labels, dashboard task order, route structure and usability may and should be improved.** Do not preserve unusable navigation for the sake of visual similarity.
- No destructive Firebase migrations or deployments without user approval and a backup/rollback plan.
- Do not embed service account JSON, OAuth secrets, payment secrets, or unverified subscription data.
- Ask for user intervention only when a login/permission, secret, deployment approval, or genuine human decision is required, and state the exact blocker. Otherwise proceed autonomously.
- Prefer functional and security correctness over superficial demo success.
