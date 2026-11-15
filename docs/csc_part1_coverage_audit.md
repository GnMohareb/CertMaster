# CSC Part 1 Question Bank & Adaptive Coverage Audit

**Date**: 2026-11-15  
**Target Flavor**: `cscPart1` (`BuildConfig.TARGET_EXAM_ID = "csc-part-1"`)  
**Scope**: Offline standalone Android build (`apps/android/`)

---

## 1. Current Verified Asset State

- **Asset File (`apps/android/app/src/cscPart1/assets/exams/csc-part-1.json`)**: **Absent** (0 bundled questions).
  - By design, no QIS question bank or AI-generated question bank was imported into this build.
  - `EmbeddedExamBank.loadWithMetadata(context, "csc-part-1")` fails closed cleanly with `IllegalStateException`, and `ExamRepository` exposes an empty list rather than substituting CISSP or other certification questions.
- **Catalog Metadata (`ExamCatalog.CSC_PART_1`)**:
  - `id`: `"csc-part-1"`
  - `shortCode`: `"CSC Part 1"`
  - `passingScorePercent`: `60`
  - `durationMinutes`: `120`
  - `domains`: `emptyList()` (domains are derived dynamically from installed questions via `ExamCatalog.deriveDomainsFromQuestions` or supplied in the JSON bank).
- **Missing Authoritative Curriculum Mappings (Do Not Invent)**:
  - Official CSI CSC Volume 1 **domain IDs and domain titles**: Absent in `ExamCatalog.CSC_PART_1`.
  - Official CSI CSC Volume 1 **topic IDs and topic titles**: Absent until supplied in `csc-part-1.json`.
  - Official CSI CSC Volume 1 **learning objective IDs (`objectiveId`) and statements (`learningObjective`)**: Absent until supplied in `csc-part-1.json`.
  - Official CSI CSC Volume 1 **syllabus weights (`syllabusWeights`)** and **syllabus edition (`syllabusEdition`)**: Absent until verified and supplied in `csc-part-1.json`.
  - Until verified `syllabusWeights` are included in `csc-part-1.json`, Initial Assessment explicitly uses balanced round-robin domain/topic sampling and labels coverage as *"Balanced equally across N available domain(s) (no official syllabus weights bundled)"*.

---

## 2. Diagnostic Summary from `EmbeddedExamBank.auditBank`

When no question bank is installed:
- `totalQuestions`: `0`
- `practiceEligibleCount`: `0`
- `assessmentEligibleCount`: `0`
- `reservedFullExamCount`: `0`
- `domainsCount`: `0`
- `topicsCount`: `0`
- `coverageDescription`: `"No practice questions installed yet."`

When a question bank is installed, `EmbeddedExamBank.auditBank` surfaces exact counts for:
1. **`unmappedTopicQuestionCount`**: Questions lacking both `topicId` and `topicName`. The engine maps these to explicit `unmapped:<domainId>` buckets (`hasExplicitTopicMapping = false`) instead of guessing topics.
2. **`missingObjectiveCount`**: Questions lacking both `objectiveId` and `learningObjective`.
3. **`missingOptionAnalysisCount`**: Questions lacking per-option distractor explanations (`optionAnalysis`).
4. **`missingExplicitDifficultyCount`**: Questions omitting an explicit `difficulty` value (which receive neutral `1.0` scaling during mastery updates).
5. **`usesSyllabusWeights`**: `true` only when `syllabusWeights` contains positive weights matching installed domains.

---

## 3. Supply Checklist for Content Team / Perplexity

To reach full adaptive readiness once content is imported into `apps/android/app/src/cscPart1/assets/exams/csc-part-1.json`:
1. Supply verified `syllabusEdition`, `bankVersion`, and (if officially verified) `syllabusWeights` keyed by `domainId`.
2. Supply verified CSC Volume 1 `domainId`, `domainName`, `topicId`, and `topicName` on every question (`unmappedTopicQuestionCount == 0`).
3. Supply verified `objectiveId`, `learningObjective`, `questionType` (`MULTIPLE_CHOICE` / `SCENARIO_MCQ` / `CALCULATION_MCQ`), and complete `optionAnalysis` (covering both the correct choice and every distractor).
4. Supply at least 3–5 distinct `PRACTICE`/`GENERAL` questions per `topicId` (with `nearDuplicateGroupId` populated for stem variants) so:
   - Topics can graduate from `INSUFFICIENT_EVIDENCE` to `ESTABLISHED` confidence.
   - Wrong answers can immediately surface a **different** follow-up question on the same topic/objective without repeating near-duplicates.
5. Tag mock-only questions as `questionPool = "FULL_EXAM_RESERVED"` so Initial Assessment and Adaptive Practice never leak reserved mock-exam items.
