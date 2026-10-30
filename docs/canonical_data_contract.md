# CertMaster Canonical Data Contract (`schemaVersion: 2`)

## 1. Purpose & Scope
This document defines the single authoritative, versioned data contract (`schemaVersion: 2`) shared by:
1. **CertMaster Web Platform** (`apps/web/`) — React 19 / Vite / Express / Firebase JS SDK
2. **CertMaster Native Android Application** (`apps/android/app/`) — Kotlin / Jetpack Compose / Room SQLite / Firebase Android SDK

Both applications operate as unified interfaces over the same Firebase project and named Firestore database:
- **Firebase Project ID**: `gen-lang-client-0788513176`
- **Firestore Database ID**: `ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`
- **Google OAuth 2.0 Web Client ID**: `814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com`

---

## 2. Standardized Certification Identifiers

All certification exam identifiers are normalized to lowercase kebab-case strings via `normalizeExamId(rawId)` on both Web and Android.

### Canonical Alias Mapping Table

| Canonical `examId` | Recognized Legacy Aliases | Short Code | Title | Vendor |
| :--- | :--- | :--- | :--- | :--- |
| `cissp` | `cissp`, `isc2-cissp` | `CISSP` | Certified Information Systems Security Professional | `(ISC)²` |
| `aws-saa` | `aws_csa`, `aws-csa`, `aws-saa`, `saa-c03`, `aws_saa` | `AWS SAA-C03` | AWS Certified Solutions Architect – Associate | `AWS` |
| `sec-plus` | `sec_plus`, `sec-plus`, `sy0-701`, `security-plus`, `security_plus` | `SY0-701` | CompTIA Security+ (SY0-701) | `CompTIA` |
| `cism` | `cism`, `isaca-cism` | `CISM` | Certified Information Security Manager | `ISACA` |
| `ceh` | `ceh`, `ceh-v12`, `ceh_v12` | `CEH v12` | Certified Ethical Hacker | `EC-Council` |
| `pmp` | `pmp`, `pmi-pmp` | `PMP` | Project Management Professional | `PMI` |
| `ccsp` | `ccsp`, `isc2-ccsp` | `CCSP` | Certified Cloud Security Professional | `(ISC)²` |
| `cisa` | `cisa`, `isaca-cisa` | `CISA` | Certified Information Systems Auditor | `ISACA` |
| `n10-009` | `n10-009`, `n10-008`, `net-plus`, `net_plus`, `network-plus` | `N10-009` | CompTIA Network+ | `CompTIA` |
| `cy0-003` | `cy0-003`, `cs0-003`, `cysa-plus`, `cysa_plus` | `CS0-003` | CompTIA CySA+ (Cybersecurity Analyst) | `CompTIA` |
| `pt0-002` | `pt0-002`, `pt0-003`, `pentest-plus`, `pentest_plus` | `PT0-002` | CompTIA PenTest+ | `CompTIA` |
| `cas-004` | `cas-004`, `cas-005`, `casp-plus`, `casp_plus` | `CAS-004` | CompTIA CASP+ (SecurityX) | `CompTIA` |
| `rhcsa-ex200` | `rhcsa-ex200`, `rhcsa`, `ex200` | `RHCSA EX200` | Red Hat Certified System Administrator | `Linux & Cloud Native` |
| `rhce-ex294` | `rhce-ex294`, `rhce`, `ex294` | `RHCE EX294` | Red Hat Certified Engineer (Ansible) | `Linux & Cloud Native` |

**General Normalization Rule**:
1. Trim whitespace and convert to lowercase.
2. Replace all underscores (`_`) with hyphens (`-`).
3. Map through the canonical alias dictionary above; if no alias entry exists, return the lowercase hyphenated identifier.

### Content Availability Classification (`contentStatus`)
Every certification in the 112-exam catalog carries an explicit `contentStatus`:
- `'FULL_PREP'` (`cissp`): Complete verified question bank, behavioral diagnostic items, grounded study guides, 2-host audio briefings, and spaced-repetition flashcards.
- `'CATALOG_PREVIEW'` (the remaining 111 exams unless a dedicated question bank is loaded from the backend): Displays authentic domain blueprints, weights, and exam specifications, and clearly labels practice/study actions as blueprint preview rather than silently substituting CISSP questions.

---

## 3. Canonical Firestore Collection Hierarchy & Schemas (`schemaVersion: 2`)

### 3.1 Student Profile: `/users/{userId}`
Stores non-PII profile attributes, behavioral calibration metrics, and cross-platform journey state.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | Yes | Matches `request.auth.uid` |
| `displayName` | `string` | Yes | Student display name (1..100 chars) |
| `photoURL` | `string` | No | Avatar URL (`avatarUrl` accepted as legacy alias on read) |
| `subscriptionTier` | `'Free Trial' \| 'Single-Exam Pass' \| 'Universal Multi-Pass'` | Yes | Server-controlled tier; client create must be `'Free Trial'`, immutable on client update |
| `preferredTheme` | `'dark' \| 'light'` | Yes | UI theme polarity |
| `targetExamId` | `string` | Yes | Canonical active `examId` (normalized via `normalizeExamId`) |
| `lastActivePlatform` | `'WEB' \| 'ANDROID'` | Yes | Last platform that wrote to this profile |
| `assessmentCompleted` | `boolean` | Yes | Whether diagnostic calibration has been completed |
| `assessmentScorePercent` | `number` | Yes | Diagnostic baseline score (0..100) |
| `stressIndex` | `number` | Yes | Authoritative cognitive stress baseline (0..100; mirrored to `cognitiveStressBaseline`) |
| `cognitiveStressBaseline` | `number` | No | Mirror of `stressIndex` for Android v1 backward compatibility |
| `archetypeName` | `string` | Yes | `'Confident Master' \| 'Deliberate Strategist' \| 'Fast Guesser' \| 'Analytical Hesitator' \| 'Methodical Verifier'` (mirrored to `behavioralArchetype`) |
| `behavioralArchetype` | `string` | No | Mirror of `archetypeName` for Android v1 backward compatibility |
| `archetypeDescription` | `string` | Yes | Diagnostic hesitation analysis notes (mirrored to `hesitationNotes`) |
| `hesitationNotes` | `string` | No | Mirror of `archetypeDescription` for Android v1 backward compatibility |
| `averageDwellTimeSec` | `number` | Yes | Average response latency in seconds (0..3600) |
| `distractorEliminationRate` | `number` | Yes | Ratio of struck distractors (0.0..1.0) |
| `optionSwitchCountAvg` | `number` | Yes | Average option switches per question (0.0..100.0) |
| `currentJourneyStage` | `number` | Yes | Active stage in the 5-Stage Mastery Study Plan (1..5) |
| `completedSimulationsCount` | `number` | Yes | Count of completed simulations |
| `highestSimulationScore` | `number` | Yes | Highest overall simulation score percentage (0..100) |
| `examTargetDate` | `string` | No | Target exam completion date string |
| `deviceSyncedCount` | `number` | No | Number of synced client devices |
| `schemaVersion` | `number` | Yes | Version integer (`2`) |
| `createdAt` | `Timestamp` | Yes | Document creation timestamp |
| `updatedAt` | `Timestamp` | Yes | Server timestamp (`request.time`) |

### 3.2 Private PII: `/users/{userId}/private/pii`
Isolates personally identifiable information (`email`) from the main profile document.
- `email`: `string` (1..254 chars)
- `updatedAt`: `Timestamp` (`request.time`)

### 3.3 Subscriptions / Entitlements: `/users/{userId}/subscriptions/{examId}`
Authoritative collection for per-subject and universal entitlements.
- **Security**: Read-only for authenticated owner (`allow get, list: if isOwner(userId); allow create, update, delete: if false;`). Only trusted server-side payment verification (Admin SDK) may write `ACTIVE` entitlements.
- **Fields**:
  - `userId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `examTitle`: `string`
  - `shortCode`: `string`
  - `vendor`: `string`
  - `status`: `'ACTIVE' | 'TRIAL' | 'LOCKED' | 'EXPIRED'` (Legacy Android `'TRIAL_ACTIVE'` is normalized to `'TRIAL'`)
  - `platform`: `'WEB' | 'ANDROID' | 'UNIVERSAL_SYNC'` (mirrored to `subscribedPlatform`)
  - `expiresAt`: `string` (mirrored to `validUntilDate`)
  - `priceFormatted`: `string`
  - `universalAccess`: `boolean`
  - `activeSessionsCount`: `number`
  - `schemaVersion`: `number` (`2`)
  - `createdAt`: `Timestamp`
  - `updatedAt`: `Timestamp`

### 3.4 Exam & Diagnostic Attempts: `/users/{userId}/attempts/{attemptId}`
Immutable record of a completed simulation, domain drill, or behavioral diagnostic.
- **Fields**:
  - `attemptId`: `string` (mirrored to `sessionId`)
  - `sessionId`: `string`
  - `userId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `examTitle`: `string`
  - `attemptType`: `'FULL_SIMULATION' | 'DOMAIN_PRACTICE' | 'DIAGNOSTIC'`
  - `platform`: `'WEB' | 'ANDROID'`
  - `scorePercent`: `number` (0..100)
  - `passed`: `boolean`
  - `totalQuestions`: `number` (1..500)
  - `correctAnswers`: `number` (0..500; mirrored to `correctCount`)
  - `correctCount`: `number`
  - `timeSpentSeconds`: `number` (0..86400)
  - `timeSpentMinutes`: `number` (0..1440)
  - `averageDwellSec`: `number` (0..3600)
  - `stressScore`: `number` (0..100)
  - `eliminatedDistractorsCount`: `number`
  - `dateString`: `string` (`YYYY-MM-DD`)
  - `timestampMillis`: `number` (epoch ms)
  - `domainScores`: `map<string, number | DomainBreakdown>` (Supports both numeric percentage map `{ "Security & Risk Management": 80 }` and structured breakdown `{ "d1": { "domainId": "d1", "domainName": "Security & Risk Management", "correctCount": 8, "totalCount": 10, "scorePercent": 80 } }`, plus `domainScoresJson` string for Android Room compatibility)
  - `schemaVersion`: `number` (`2`)
  - `createdAt`: `Timestamp`

### 3.5 Flashcard Progress: `/users/{userId}/flashcards/{cardId}`
Tracks Leitner spaced-repetition box level and recall state.
- **Fields**:
  - `cardId`: `string` (mirrored to `id`)
  - `id`: `string`
  - `userId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `domainId`: `string`
  - `domain`: `string` (domain display name or ID)
  - `boxLevel`: `number` (`1`..`5`)
  - `state`: `'unstudied' | 'needs_review' | 'known'` (Deterministic mapping from `boxLevel`: Box 1 -> `'unstudied'`, Box 2 -> `'needs_review'`, Box 3..5 -> `'known'`)
  - `status`: `'UNREVIEWED' | 'NEEDS_REVIEW' | 'KNOWN'` (Uppercase mirror of `state`)
  - `reviewCount`: `number`
  - `lastReviewedEpoch`: `number` (epoch ms)
  - `platform`: `'WEB' | 'ANDROID'`
  - `schemaVersion`: `number` (`2`)
  - `createdAt`: `Timestamp`
  - `updatedAt`: `Timestamp`

### 3.6 Study Plans: `/users/{userId}/studyPlans/{examId}`
Synchronizes the 5-Stage Mastery Study Plan and weekly study schedule per certification.
- **Fields**:
  - `planId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `userId`: `string`
  - `targetDate`: `string`
  - `weeklyHours`: `number` (1..168)
  - `focusDomains`: `string[]`
  - `status`: `'ACTIVE' | 'COMPLETED' | 'PAUSED'`
  - `currentStage`: `number` (1..5)
  - `readinessPercent`: `number` (0..100)
  - `passProbabilityPercent`: `number` (0..100)
  - `passGuaranteeQualified`: `boolean`
  - `milestones`: `StudyPlanMilestone[]`
  - `milestonesJson`: `string` (serialized JSON array of `milestones` for Android Room compatibility)
  - `updatedAtMillis`: `number`
  - `schemaVersion`: `number` (`2`)
  - `createdAt`: `Timestamp`
  - `updatedAt`: `Timestamp`

### 3.7 Exam Readiness: `/users/{userId}/readiness/{examId}`
Stores authoritative readiness metrics per certification.
- **Fields**:
  - `userId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `readinessScore`: `number` (0..100; mirrored to `readinessPercent`)
  - `readinessPercent`: `number` (0..100)
  - `passProbability`: `number` (0..100; mirrored to `passProbabilityPercent`)
  - `passGuaranteeQualified`: `boolean`
  - `currentJourneyStage`: `number` (1..5)
  - `simulationsCompleted`: `number`
  - `weakestDomainId`: `string`
  - `weakestDomain`: `string`
  - `weakestDomainScore`: `number` (0..100)
  - `schemaVersion`: `number` (`2`)
  - `updatedAt`: `Timestamp`

### 3.8 Custom Study Sources: `/users/{userId}/sources/{sourceId}`
Stores learner-created custom study notes and reference summaries.
- **Fields**:
  - `sourceId`: `string` (mirrored to `id`)
  - `id`: `string`
  - `userId`: `string`
  - `examId`: `string` (normalized canonical exam ID)
  - `domainId`: `string`
  - `domainName`: `string`
  - `title`: `string` (1..200 chars)
  - `authorOrStandard`: `string`
  - `type`: `'OFFICIAL_GUIDE' | 'STANDARD_SPEC' | 'CHEAT_SHEET' | 'SYLLABUS' | 'AUDIO_TRANSCRIPT'`
  - `summary`: `string` (1..2000 chars)
  - `keyTakeaways`: `string[]`
  - `fullContent`: `string` (1..20000 chars)
  - `platform`: `'WEB' | 'ANDROID'`
  - `updatedAtMillis`: `number`
  - `schemaVersion`: `number` (`2`)
  - `createdAt`: `Timestamp`
  - `updatedAt`: `Timestamp`

---

## 4. Authoritative Metric & Readiness Formulas

Both Web (`apps/web/src/lib/canonicalContract.ts`) and Android (`AuthoritativeMetricsEngine.kt`) execute identical formulas:

1. **Behavioral Archetype & Stress Baseline**:
   - Given `scorePct` (0..100), `avgLatencySec` ($\ge 0$), `totalSwitches` ($\ge 0$), `totalEliminations` ($\ge 0$), `totalQuestions` ($\ge 1$):
   - If `scorePct >= 85 && avgLatencySec < 40 && totalSwitches <= 2`:
     - `archetype = 'Confident Master'`, `stress = 35`
   - Else if `totalEliminations >= 6 && scorePct >= 70`:
     - `archetype = 'Deliberate Strategist'`, `stress = 54`
   - Else if `avgLatencySec < 22 && scorePct < 70`:
     - `archetype = 'Fast Guesser'`, `stress = 72`
   - Else if `avgLatencySec >= 45 || totalSwitches >= 4`:
     - `archetype = 'Analytical Hesitator'`, `stress = 68`
   - Else:
     - `archetype = 'Methodical Verifier'`, `stress = 50`
   - `distractorEliminationRate = Math.min(1, Math.round((totalEliminations / (totalQuestions * 3)) * 100) / 100)`
   - `optionSwitchCountAvg = Math.round((totalSwitches / totalQuestions) * 10) / 10`

2. **Simulation Behavioral Stress**:
   - `stressScore = Math.min(100, Math.max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))`

3. **Domain Cognitive Stress Score & Level**:
   - `inaccuracyPenalty = (100 - accuracyPercent) * 0.55`
   - `hesitationPenalty = Math.max(0, avgResponseSeconds - 45) * 0.45`
   - `flagPenalty = flagRatePercent * 0.30`
   - `stressScore = Math.min(99, Math.max(5, Math.round(inaccuracyPenalty + hesitationPenalty + flagPenalty)))`
   - `stressLevel`:
     - `accuracyPercent < 50 || stressScore >= 75` $\rightarrow$ `'CRITICAL_STRESS'`
     - `accuracyPercent < 70 || stressScore >= 55` $\rightarrow$ `'HIGH_ATTENTION'`
     - `accuracyPercent < 85 || stressScore >= 35` $\rightarrow$ `'MODERATE_PRACTICE'`
     - `accuracyPercent < 95` $\rightarrow$ `'ON_TRACK'`
     - Otherwise $\rightarrow$ `'MASTERED'`

4. **Authoritative Exam Readiness & 5-Stage Mastery Study Plan**:
   - `calibrationFactor = clamp(Math.round(assessmentScorePercent * 0.7 + (100 - cognitiveStressBaseline) * 0.3), 0, 100)`
   - `flashcardMasteryPct = flashcards.length > 0 ? clamp(Math.round(((knownCount + needsReviewCount * 0.5) / flashcards.length) * 100), 0, 100) : 50`
   - `readinessPercent`:
     - If `simulationScores.length > 0`: `clamp(Math.round(simAvg * 0.60 + calibrationFactor * 0.25 + flashcardMasteryPct * 0.15), 0, 100)`
     - Else if `assessmentCompleted`: `clamp(Math.round(calibrationFactor * 0.70 + flashcardMasteryPct * 0.30), 0, 100)`
     - Else: `clamp(Math.round(flashcardMasteryPct * 0.40), 10, 100)`
   - `passProbabilityPercent = clamp(readinessPercent + (highestSim >= passingScorePercent ? 6 : -4), 5, 99)`
   - `passGuaranteeQualified = simulationScores.length >= 3 && readinessPercent >= 80 && highestSim >= passingScorePercent`

5. **Deterministic Conflict Resolution**:
   - **Subscriptions**: Union of entitlements across platforms; `'ACTIVE'` always wins over `'TRIAL' | 'LOCKED' | 'EXPIRED'` unless explicitly expired on server.
   - **Attempts**: Append-only union deduplicated by `attemptId` / `sessionId`.
   - **Flashcards**: Most recent `lastReviewedEpoch` wins; on timestamp tie, higher `boxLevel` wins.
   - **Profile**: Most recent `updatedAt` / `lastSyncTimestampMillis` wins for mutable preferences (`targetExamId`, `preferredTheme`), while `highestSimulationScore` and `completedSimulationsCount` take `Math.max(local, remote)`.

---

## 5. Legacy Data Migration & Compatibility Strategy (Non-Destructive)

To ensure zero data loss for existing `schemaVersion: 1` or unversioned documents in production or local caches:
1. **In-Memory Normalization on Read (`migrateLegacyProfile`, `migrateLegacyAttempt`, `migrateLegacyFlashcard`)**:
   - Both Web and Android parsers accept `schemaVersion: 1` (or missing `schemaVersion`) and automatically populate missing v2 fields with safe defaults while normalizing `examId` (`sy0-701` / `sec_plus` $\rightarrow$ `sec-plus`, `aws_csa` $\rightarrow$ `aws-saa`).
   - Legacy Android `/users/{userId}/entitlements/{examId}` and embedded `subscriptions` maps are read as fallbacks if `/users/{userId}/subscriptions/{examId}` is empty.
   - Legacy Web `domainScores` maps of `{ [domainName: string]: number }` and legacy Android `domainScoresJson` strings are both supported and losslessly converted.
2. **No Destructive Production Wipe**:
   - Production Firestore documents are never deleted during migration. Upgraded documents are written with `schemaVersion: 2` and dual-compatible fields (`archetypeName` + `behavioralArchetype`, `stressIndex` + `cognitiveStressBaseline`, `cardId` + `id`, `state` + `status`).
   - Hardcoded demo user `usr_gnmohareb_cissp_001` is restricted strictly to **Local Demo Mode** when unauthenticated; signing in with a real Firebase Auth account creates a clean `Free Trial` profile for new users without overwriting existing production user documents.
