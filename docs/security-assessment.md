# CertMaster — Cybersecurity & Entitlement Verification Assessment

**Assessment Date**: 2026-10-30  
**Scope**: Express Backend (`apps/web/server.ts`), Firestore Security Rules (`apps/web/firestore.rules`, `apps/android/firestore.rules`), Web Client (`apps/web/src/`), and Native Android Client (`apps/android/app/`)

---

## 1. Executive Summary

All critical authentication, authorization, and payment/entitlement escalation vulnerabilities identified in the Phase 7 security audit have been remediated in code and verified with automated tests (`Test 8` and `Test 10` in [`apps/web/src/lib/canonicalContract.test.ts`](file:///c:/CertMaster/apps/web/src/lib/canonicalContract.test.ts)).

| Security Control | Pre-Phase 7 State | Phase 7 Hardened State | Verification Status |
| --- | --- | --- | --- |
| **API Bearer Token Authentication** | Express routes accepted unauthenticated requests with arbitrary `userId` in body/URL | `requireBearerAuth` middleware validates HMAC-SHA256 signed Bearer token (`Authorization: Bearer <token>`), expiration (`exp`), and revocation list (`401 UNAUTHORIZED`) | **VERIFIED** (`Test 10.2`, `Test 10.3`) |
| **UID Ownership Authorization** | Any caller could read/overwrite another user's profile, attempts, or flashcards | `verifyUidOwnership` enforces `req.authenticatedUid === targetUserId`; cross-user reads/writes are rejected with `403 FORBIDDEN` | **VERIFIED** (`Test 10.4`) |
| **Payment & Subscription Verification** | `POST /api/subscriptions/verify` accepted any string starting with `rcpt_` or `stripe_` | Bare `rcpt_`/`stripe_` prefixes are rejected with `403 FORBIDDEN`. Production activation requires cryptographic `X-CertMaster-Webhook-Signature` (HMAC-SHA256) | **VERIFIED** (`Test 10.5`, `Test 10.7`) |
| **Sandbox Payment Separation** | No distinction between sandbox test receipts and production payment verification | Sandbox mode requires both `NODE_ENV !== 'production'`, `X-CertMaster-Sandbox-Mode: true`, and `sandbox_rcpt_verified_...` token, returning `verificationMode: 'SANDBOX_TEST_ONLY'` | **VERIFIED** (`Test 10.8`) |
| **Profile Sync Entitlement Stripping** | Client profile sync payloads could inject `subscriptionTier: 'Universal Multi-Pass'` or `status: 'ACTIVE'` | `POST /api/profile/sync` strips unverified client `ACTIVE` status down to `TRIAL` and preserves server-verified `subscriptionTier` | **VERIFIED** (`Test 10.6`) |
| **Firestore Security Rules** | Client writes needed strict field-level guards on `/users/{userId}` and `/subscriptions/{examId}` | `firestore.rules` blocks client creation/escalation of `ACTIVE` entitlements or `Universal Multi-Pass` tier (`dd-01`..`dd-14`) | **VERIFIED** (`Test 8`: 14/14 passed) |

---

## 2. Detailed Security Controls

### 2.1 Authenticated Identity Enforcement (`apps/web/server.ts`)
- **Token Verification**: [`verifyBearerToken`](file:///c:/CertMaster/apps/web/server.ts) verifies either HMAC-SHA256 signed session tokens (`cm_v2.<payloadBase64Url>.<hmacBase64Url>`) or Firebase OIDC JWT tokens (`aud === 'gen-lang-client-0788513176'`), checking token expiration (`exp`) and revocation (`REVOKED_TOKENS`).
- **Protected Routes**:
  - `GET /api/profile/:userId`
  - `POST /api/profile/sync`
  - `POST /api/exams/:examId/sessions`
  - `GET /api/subscriptions/verify`
  - `POST /api/subscriptions/verify`
  - `POST /api/flashcards/sync`
  - `POST /api/study-plan/sync`
  - `POST /api/sources/sync`
- **Android Client Alignment**: [`ApiClient.kt`](file:///c:/CertMaster/apps/android/app/src/main/java/com/example/network/ApiClient.kt) automatically attaches `Authorization: Bearer <signed_token>` via an OkHttp interceptor using the active authenticated UID from `SharedAuthManager`.

### 2.2 Cryptographic Payment Webhook Verification vs. Sandbox Mode
- **Production Mode (`PRODUCTION_CRYPTO_VERIFIED`)**:
  - Computes `HMAC-SHA256(CERTMASTER_PAYMENT_WEBHOOK_SECRET, "${userId}:${examId}:${tier}:${receiptToken}")` using `crypto.timingSafeEqual` against the `X-CertMaster-Webhook-Signature` header.
  - Any attempt to pass a client-fabricated `rcpt_...` or `stripe_...` token without a valid cryptographic signature returns `403 FORBIDDEN` (`REJECTED_UNVERIFIED_RECEIPT`).
- **Development Sandbox Mode (`SANDBOX_TEST_ONLY`)**:
  - Permitted only when `process.env.NODE_ENV !== 'production'`, header `X-CertMaster-Sandbox-Mode: true` is explicitly sent, and the receipt uses the `sandbox_rcpt_verified_` prefix.
  - Explicitly labels the response with `verificationMode: 'SANDBOX_TEST_ONLY'` and `isProductionPayment: false`.
