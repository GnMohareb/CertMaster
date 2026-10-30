# CertMaster two-export integration audit

Static comparison of the uploaded `certmaster-web-platform.zip` and `certmaster.zip` on 2026-10-30. This is **not** a production security audit or live integration certification.

## Executive result

Both exports are present and readable. The web export contains a React/Vite/Express/Firebase platform. The Android export contains a Kotlin/Jetpack Compose Android application **plus a second React/Vite web mock/preview**. Their Firebase setup and Firestore model are inconsistent. **They do not currently constitute one synchronized product.**

## Critical blockers (with source locations)

1. **Different Firebase projects/configuration.** `apps/web/firebase-applet-config.json` points to project `gen-lang-client-0788513176`, named Firestore DB `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`; `apps/web/src/lib/firebase.ts` initializes that named DB. `apps/android/app/src/main/res/values/sso_config.xml` instead contains placeholder project `certmaster-unified-prod` and placeholder OAuth ID. `apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt` calls no-argument `FirebaseFirestore.getInstance()`, which uses the default database. The Android export does not contain `google-services.json`, so genuine native Firebase configuration and sign-in cannot be verified from this export.

2. **Incompatible data schema.** The web blueprint `apps/web/firebase-blueprint.json` and rules require `/users/{uid}/subscriptions/{examId}` with `userId, examId, status, platform, expiresAt, createdAt, updatedAt`; Android writes to `/users/{uid}/entitlements/{examId}` with a different field set. Web attempts require `attemptId, attemptType, platform, correctAnswers, timeSpentMinutes, createdAt...`; Android writes `sessionId, timestamp, correctCount, timeSpentSeconds, domainScoresJson`. The Android profile writer also omits the web-required `createdAt`, `updatedAt`, `schemaVersion`, `preferredTheme`, `targetExamId`, etc. There are two different Firestore rules files for incompatible schemas. Android writes cannot be assumed to satisfy the web project's rules.

3. **Mock synchronization claiming success.** `apps/web/server.ts` POST `/api/profile/sync` constructs a response without authenticating the request or writing to Firestore, and GET `/api/subscriptions/verify` returns a `VERIFIED` status without verifying purchase entitlements. `apps/android/src/services/apiSyncService.ts` waits artificially, writes localStorage and returns success; its `BroadcastChannel` only exchanges events within browser contexts, not native Android/cloud. `apps/android/app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt` returns success when Firebase is absent, and `apps/android/app/src/main/java/com/example/data/ExamRepository.kt` may report success even after backend exceptions.

4. **Authentication mismatch and demo identity.** `apps/web/src/context/CertMasterContext.tsx` uses Firebase Auth and Google popup. The Android export's separate preview uses simulated SSO from `apps/android/src/context/AuthContext.tsx`; `apps/android/app/src/main/java/com/example/auth/SharedAuthManager.kt` falls back to a hardcoded demonstration user ID when Firebase is not ready. A common Firebase UID and sign-in configuration is not guaranteed.

5. **Subscription and payment bypass.** Web rules in `apps/web/firestore.rules` permit users to create ACTIVE subscription entitlements and update `subscriptionTier`, and `apps/web/src/context/CertMasterContext.tsx` directly creates ACTIVE subscription documents through `purchaseExam()` without a verified payment in the backend. Android rules in `apps/android/firestore.rules` similarly permit owner-created ACTIVE entitlements. Both are unacceptable for paid access. Only a trusted server/payment-provider verification process should grant or revoke paid entitlements.

6. **Seeded data instead of real account state.** The web context bootstraps sample subscription entitlements and sample historical attempts into each newly created user's Firestore records. Both the Android preview and Android native models contain fixed demonstration identity, historical scores, and universal access defaults. Demo fixtures must remain isolated from production accounts, without seeding paid access or fake exam history.

7. **No proof of end-to-end parity.** `apps/android/tests/crossPlatformIntegration.test.mjs` includes four tests that check source files, rule strings and locally replicated formula behavior. All four pass locally under Node, but do not connect a web browser and an Android device to the same backend. The web `apps/web/firestore.rules.test.ts` is an array of test scenarios, not an executed emulator security suite. No verified Firebase Emulator Suite cross-client test or on-device end-to-end test is included. Native Android Gradle compilation was not run from these exports.

8. **Two separate web implementations.** In addition to `apps/web/src`, the Android ZIP has `apps/android/src`, a separate React/Vite interface based on localStorage. Do not deploy or develop this as a substitute for the real web platform unless explicitly intended as a separate app.

## Correct target

One Firebase Auth identity; one chosen Firebase project; one named Firestore database (or deliberately migrated replacement); one versioned canonical data contract; server-controlled commercial entitlements; real authenticated writes and listeners; Android Room offline cache with explicit errors/conflict handling; one actual cross-platform test suite. Preserve both production UIs.

## Validation limit

The conclusions above are based on local static code inspection and four locally executed Node tests (`npm test` inside the Android export). No Firebase Console, credentials, deployment, Android emulator or live user account was accessed. Results labelled `SYNCHRONIZED` in application source are not evidence of operational synchronization.
