# CertMaster Ecosystem Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Master Identity Ownership Invariant**: Every document inside `/users/{userId}` and its subcollections (`private`, `subscriptions`, `attempts`, `flashcards`, `studyPlans`, `readiness`, `syncEvents`) must have `userId == request.auth.uid` and `userId == path variable {userId}`.
2. **Master Gate Relational Sync Invariant**: Subcollections under `/users/{userId}/...` can only be created or modified if the parent `/users/{userId}` document exists (`exists(/databases/$(database)/documents/users/$(userId))`) and is owned by `request.auth.uid`.
3. **Verified Email Invariant**: All write operations (`create`, `update`, `delete`) require `request.auth != null && request.auth.token.email_verified == true`.
4. **PII Split-Collection Isolation Invariant**: User email addresses are strictly isolated inside `/users/{userId}/private/{docId}` and never exposed to non-owners or blanket signed-in reads.
5. **Temporal Integrity Invariant**: All `createdAt` fields on `create` and `updatedAt` fields on `update` must strictly equal `request.time`. On `update`, `createdAt` and `userId` are strictly immutable (`incoming().createdAt == existing().createdAt && incoming().userId == existing().userId`).
6. **Strict Schema & Anti-Update-Gap Invariant**: Every `create` and `update` block wraps its logic with `isValid[Entity](incoming())`, enforcing `.hasAll()` and `.hasOnly()` key allowlists, string `.size()` ceilings, numeric boundaries (`0 <= scorePercent <= 100`), and regex ID guards (`^[a-zA-Z0-9_\-]+$`).
7. **Immutable Exam Attempt Invariant**: Once an `ExamAttemptRecord` (`/users/{userId}/attempts/{attemptId}`) or `SyncEventDoc` (`/users/{userId}/syncEvents/{eventId}`) is created, it represents an immutable historical telemetry record and cannot be arbitrarily overwritten or deleted by another user.
8. **Secure List Query Enforcer Invariant**: Every `allow list` rule explicitly verifies `resource.data.userId == request.auth.uid && request.auth.uid == userId` without calling `get()` or `exists()` inside `list`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Identity Spoofing (`userId` Mismatch)**:
   Authenticated as `usr_attacker_99`, attempting to create `/users/usr_victim_01` with `{"userId": "usr_victim_01", "displayName": "Spoofed"}`.
2. **Payload 2 — Unverified Email Write**:
   Authenticated with `request.auth.token.email_verified == false`, attempting to write to `/users/{uid}`.
3. **Payload 3 — Shadow Field Injection on Profile Create**:
   Attempting to create `/users/{uid}` with an unauthorized field `{"isAdmin": true, "role": "SUPERUSER"}`.
4. **Payload 4 — Action-Based Update Gap (Unauthorized Key Mutation)**:
   Attempting to update `createdAt` or `userId` on `/users/{uid}` during a profile preference update.
5. **Payload 5 — String Denial-of-Wallet Overflow**:
   Attempting to create a `UserProfile` with a `displayName` of 5,000 characters (`maxLength: 120`).
6. **Payload 6 — ID Poisoning Attack**:
   Attempting to create `/users/{uid}/subscriptions/{maliciousId}` where `maliciousId` contains spaces or script characters (`"cissp; DROP TABLE"`).
7. **Payload 7 — Client Timestamp Spoofing**:
   Attempting to create `/users/{uid}/attempts/{attemptId}` with a hardcoded past or future `createdAt` timestamp instead of `request.time`.
8. **Payload 8 — Out-of-Bounds Score Injection**:
   Attempting to write an `ExamAttemptRecord` with `scorePercent: 999` or `scorePercent: -25` (violating `0 <= scorePercent <= 100`).
9. **Payload 9 — Cross-User PII Read Leak**:
   Authenticated as `usr_attacker_99`, attempting `get` or `list` on `/users/usr_victim_01/private/pii`.
10. **Payload 10 — Orphaned Subcollection Write (Missing Parent Gate)**:
    Attempting to create `/users/{uid}/subscriptions/cissp` before `/users/{uid}` exists in Firestore.
11. **Payload 11 — Unbounded Array Poisoning on StudyPlan**:
    Attempting to create `/users/{uid}/studyPlans/plan_1` with `focusDomains` containing 50 elements (`size() <= 10` limit).
12. **Payload 12 — Terminal State Mutation on Completed StudyPlan**:
    Attempting to update a `StudyPlan` whose existing `status` is already `'COMPLETED'`.

---

## 3. Security Rules Test Specification (`firestore.rules.test.ts`)

See `/firestore.rules.test.ts` for the complete test suite validating that all 12 adversarial payloads return `PERMISSION_DENIED` while legitimate Web and Android client operations succeed.
