# CSC Part 1 Offline Adaptive & Mastery Model

**Model Version**: `offline-mastery-v1` (`AdaptiveConfig.DEFAULT_MODEL_VERSION`)  
**Engine Implementation**: `apps/android/app/src/main/java/com/example/domain/AdaptivePracticeEngine.kt`  
**Configuration Model**: `apps/android/app/src/main/java/com/example/model/AdaptiveEngineModels.kt`  

---

## 1. Design Principles

1. **Deterministic & 100% Offline**: All topic/domain mastery updates, initial assessment sampling, adaptive selection, and retention scheduling execute deterministically on-device with Room v5 persistence (`answer_events`, `topic_mastery`, `question_exposure`, `active_exam_attempt`, `simulation_scores`).
2. **Honest Evidence**: Mastery is an **observed practice evidence signal** (`0..100`), **not** a psychometric pass-probability guarantee.
3. **Never Fabricate Knowledge or Weakness**:
   - Topics with `0` answered items remain `EvidenceConfidence.UNASSESSED` ("Not assessed") and are **never** labeled weak.
   - Questions without `topicId`/`topicName` map to an explicit `unmapped:<domainId>` bucket with `hasExplicitTopicMapping = false`; the engine never invents missing syllabus mappings.
   - Skipped items (`wasSkipped = true`) and explanation-only views (`viewedExplanationOnly = true`) never mutate mastery or accuracy.
4. **Idempotency**: Every answered question is logged once in `answer_events` keyed deterministically by `"$examId::$attemptId::$questionId"` (`OnConflictStrategy.IGNORE`). Saving, pausing, restarting, resuming, or finishing an attempt cannot double-apply evidence.

---

## 2. Configurable Parameters (`AdaptiveConfig`)

| Parameter | Default | Description |
| :--- | :--- | :--- |
| `initialAssessmentDefaultLength` | `20` | Default target item count for Initial Assessment (capped at `FREE_ASSESSMENT_LIMIT = 50` and available eligible items). |
| `defaultPracticeSessionLength` | `10` | Default item count for an Adaptive Practice / Retention Review session. |
| `weakThresholdPercent` | `65` | Assessed topics below `65%` mastery are prioritized as weak areas. |
| `masteredThresholdPercent` | `80` | Mastery threshold for strong/mastered classification. |
| `priorMasteryPercent` | `50.0` | Neutral Bayesian-like starting prior before applying the first answer event. |
| `correctMasteryStepBase` | `14.0` | Base mastery increment on a correct answer. |
| `incorrectMasteryPenaltyBase` | `16.0` | Base mastery decrement on an incorrect answer. |
| `repeatExposureDecayFactor` | `0.5` | Decay factor applied when answering the same `questionId` again. |
| `minQuestionsForConfidence` | `3` | Minimum total answered items before leaving `INSUFFICIENT_EVIDENCE`. |
| `minUniqueQuestionsForEstablished` | `2` | Minimum distinct question IDs required before leaving `INSUFFICIENT_EVIDENCE`. |
| `maxUnestablishedMasteryPercent` | `74` | Hard ceiling (`< 80%`) while confidence is `UNASSESSED` or `INSUFFICIENT_EVIDENCE`. |
| `remediationInterveningQuestions` | `2` | Number of intervening steps before revisiting a missed question in-session. |
| `weakTopicWeightPercent` | `45` | Target share of Adaptive Practice queue from weak topics. |
| `insufficientEvidenceWeightPercent` | `25` | Target share from unassessed or insufficient-evidence topics. |
| `retentionReviewWeightPercent` | `20` | Target share from topics/items due for spaced retention review. |
| `maintenanceStrongWeightPercent` | `10` | Target share from strong topics for maintenance. |
| `lowMasteryReviewHours` | `12h` | Next review interval after incorrect answers or mastery `< 65%`. |
| `emergingMasteryReviewHours` | `24h` | Next review interval for mastery `65%..79%`. |
| `establishedMasteryReviewHours` | `72h` | Next review interval after correct answers at mastery `>= 80%`. |

---

## 3. Scoring & Confidence Formulas

### Repeat Exposure Discount
For a question answered with `priorExposures` prior attempts:
```text
repeatWeight = 1.0 / (1.0 + priorExposures * repeatExposureDecayFactor)
```
Repeating the exact same question yields progressively smaller mastery gains (`1.0`, `0.67`, `0.50`, `0.40`, ...).

### Difficulty Multiplier
- Applied **only** when `question.difficultyExplicit == true` (when the bank explicitly supplied `difficulty`):
  - `EASY`: `0.85` on correct, `1.15` on incorrect
  - `MEDIUM`: `1.0`
  - `HARD`: `1.20` on correct, `0.85` on incorrect
- When difficulty was defaulted/omitted (`difficultyExplicit == false`), multiplier is strictly `1.0`.

### Evidence Confidence Classification
- `UNASSESSED`: `attemptCount <= 0`
- `INSUFFICIENT_EVIDENCE`: `attemptCount < 3` OR `uniqueQuestionCount < 2` -> **Mastery capped at `74%`**.
- `EMERGING`: `attemptCount < 5` OR `uniqueQuestionCount < 3`
- `ESTABLISHED`: `attemptCount >= 5` AND `uniqueQuestionCount >= 3`

---

## 4. Pool Separation & Mode Behavior

| Mode | Eligible Pools | Immediate Feedback | Adaptive Mutation & Remediation |
| :--- | :--- | :--- | :--- |
| `INITIAL_BEHAVIORAL_ASSESSMENT` | Excludes `FULL_EXAM_RESERVED` | Off (Exam conditions) | Records fixed initial baseline on first completion; retakes add separate historical records. |
| `AI_ADAPTIVE_DRILL` / `DOMAIN_PRACTICE` / `AI_STRESS_STUDY` | `PRACTICE`, `GENERAL` (fallback non-reserved) | On (`Check Answer`) | Immediate explanation + distractor analysis + different follow-up item + delayed revisit queue. |
| `RETENTION_REVIEW` | `PRACTICE`, `GENERAL` | On (`Check Answer`) | Prioritizes items/topics where `nextReviewDueAtMillis <= now`. |
| `FULL_SIMULATION` | Prefers `FULL_EXAM_RESERVED` + others | Off (Strict exam conditions) | Fixed question order; `checkPracticeAnswer` blocked; scores recorded on submission only. |
