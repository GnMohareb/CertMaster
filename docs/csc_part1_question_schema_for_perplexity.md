# CSC Part 1 Question Bank Schema — Perplexity Generation Handoff

**Target Android Asset Path**: `apps/android/app/src/cscPart1/assets/exams/csc-part-1.json`  
**Android Parser**: `com.example.data.EmbeddedExamBank.parseWithMetadata(...)`  
**JSON Schema File**: `docs/csc_part1_question_schema.json`

> **CONTENT AND ID OWNERSHIP**: Perplexity creates and researches the CSC content. The implementation agent owns import compatibility. `domainId`, `topicId` and `objectiveId` are stable application identifiers mapped to verified curriculum headings/objectives; they need not be official CSI-issued codes. Use an existing approved mapping where available, or deliver a proposed mapping explicitly labelled for review. Do not invent official CSI codes, syllabus edition labels or exam weights. Omit unverified `syllabusWeights`. Topic IDs must be unique across the bank.

---

## 1. Required Fields

### Root Object Required Fields
- `schemaVersion` (`integer`, required): Must be `1` or `2` (`2` required for new question banks).
- `examId` (`string`, required): Exact literal `"csc-part-1"`. Loader fails closed on mismatch.
- `questions` (`array<object>`, required): Non-empty array (`minItems: 1`) of question objects.

### Per-Question Required Fields
- `id` (`string`, required): Globally unique, non-empty, immutable identifier within `csc-part-1`. Never reuse or renumber published IDs because Room persists `answer_events` and `question_exposure` keyed by `question.id`.
- `domainId` (`string`, required): Non-empty canonical domain identifier.
- `domainName` (`string`, required): Non-empty human-readable CSC Volume 1 domain title.
- `questionText` (`string`, required): Non-empty question stem.
- `options` (`array<string>`, required): At least 2 non-empty option strings (4 recommended for CSC MCQ parity).
- `correctIndex` (`integer`, required): Zero-based index into `options` (`0 <= correctIndex < options.length`).
- `explanation` (`string`, required): Non-empty primary rationale explaining why the correct answer is right.
- `citation` (`object`, required): Non-empty provenance object with required non-empty strings:
  - `title` (e.g., `"CSC Volume 1"`)
  - `sectionOrPage` (e.g., `"Chapter 2: The Canadian Regulatory Environment"`)
  - `standardOrFramework` (e.g., `"CSC Part 1"`)

---

## 2. Optional Fields

### Root Object Optional Fields
- `bankVersion` (`string`, optional; recommended): Non-empty version string (e.g., `"2026.1"`), persisted on completed sessions and topic mastery records. Defaults to `"1"` if omitted.
- `syllabusEdition` (`string`, optional; recommended): Verified CSI CSC Volume 1 curriculum/edition identifier (e.g., `"2026 CSI CSC Volume 1"`). Defaults to `""` if omitted.
- `syllabusWeights` (`object<string, integer>`, optional): Map of verified `domainId -> integer weight (1..100)`. **Omit** unless sourced from an official CSI exam blueprint; when omitted, Initial Assessment balances equally across available domains and explicitly discloses that no official weights are bundled.

### Per-Question Optional Fields
- `topicId` (`string`, optional; strongly recommended for v2): Canonical topic slug inside `domainId`.
- `topicName` (`string`, optional; strongly recommended for v2): Human-readable topic title.
- `objectiveId` (`string`, optional; strongly recommended for v2): Verified learning objective identifier.
- `learningObjective` (`string`, optional; strongly recommended for v2): Human-readable syllabus learning objective text.
- `questionType` (`string`, optional): One of `MULTIPLE_CHOICE`, `SCENARIO_MCQ`, `CALCULATION_MCQ` (defaults to `"MULTIPLE_CHOICE"`).
- `questionPool` (`string`, optional): One of `GENERAL`, `PRACTICE`, `ASSESSMENT`, `FULL_EXAM_RESERVED` (defaults to `"GENERAL"`).
- `nearDuplicateGroupId` (`string`, optional): Shared group token for items testing variants of the same stem/concept.
- `difficulty` (`string`, optional): `EASY`, `MEDIUM`, or `HARD`. Omit when uncalibrated so `difficultyExplicit = false` and the mastery engine applies neutral `1.0` scaling.
- `optionAnalysis` (`object<string, string>`, optional; strongly recommended for v2): Per-choice explanation map keyed by `"0".."3"` or `"A".."D"`.

---

## 3. Question Types (`questionType`)
`EmbeddedExamBank` accepts single-best-answer items across three normalized formats:
- `MULTIPLE_CHOICE` (default): Standard conceptual or regulatory recall/application MCQ.
- `SCENARIO_MCQ`: Client, compliance, or suitability vignette with single best choice.
- `CALCULATION_MCQ`: Quantitative bond yield, ratio, or return calculation MCQ.
Any unrecognized `questionType` string causes fail-closed rejection during parsing.

---

## 4. Answer Indexing (`correctIndex` and `options`)
- `options` is an ordered JSON array of strings (`size >= 2`).
- `correctIndex` is **zero-based**:
  - `0` -> first option (`A`)
  - `1` -> second option (`B`)
  - `2` -> third option (`C`)
  - `3` -> fourth option (`D`)
- The parser rejects negative indices or `correctIndex >= options.size`.

---

## 5. Domain Identifiers (`domainId`, `domainName`)
- **Unverified in App Today**: `ExamCatalog.CSC_PART_1` has `domains = emptyList()` and derives active domains dynamically from the installed bank (`ExamCatalog.deriveDomainsFromQuestions`).
- **Missing Authoritative Mapping**: Official CSI CSC Part 1 domain IDs, domain names, and exam weight percentages are **not yet verified or bundled**.
- Every question must supply consistent app-owned `domainId` and verified curriculum `domainName` pairs. If `syllabusWeights` is included, its keys must match `domainId` values in `questions`.

---

## 6. Topic Identifiers (`topicId`, `topicName`)
- **Missing Authoritative Mapping**: An approved app-owned chapter/topic mapping is not pre-populated in the app.
- Every question in a v2 bank should include both `topicId` and `topicName`.
- If a question omits both `topicId` and `topicName`, the engine does **not** invent a topic; it isolates the item under `unmapped:<domainId>` with `hasExplicitTopicMapping = false`, and `auditBank()` increments `unmappedTopicQuestionCount`.
- Supply **at least 3–5 distinct questions per `topicId`** so mastery can graduate past `INSUFFICIENT_EVIDENCE` (`>= 3` attempts across `>= 2` distinct items) and wrong answers can immediately select a different same-topic item.

---

## 7. Learning Objective Identifiers (`objectiveId`, `learningObjective`)
- **Missing Authoritative Mapping**: An approved app-owned learning-objective mapping is not pre-populated in the app.
- Supply `objectiveId` (stable app-owned ID mapped to the verified objective) and `learningObjective` (concise objective statement).
- During immediate remediation (`pickImmediateRemediationQuestion`), when same-topic candidates are exhausted or filtered, the engine matches `objectiveId` first (case-insensitive) and then `learningObjective`.
- `auditBank()` increments `missingObjectiveCount` only when both `objectiveId` and `learningObjective` are blank.

---

## 8. Explanation Structure (`explanation`)
- Every question must provide a clear, self-contained `explanation` justifying why `options[correctIndex]` is correct under the cited rule, formula, or principle.
- Displayed both during practice `Check Answer` review and post-attempt full review.

---

## 9. Distractor Analysis (`optionAnalysis`)
- `optionAnalysis` maps option keys (`"0"`, `"1"`, `"2"`, `"3"` **or** `"A"`, `"B"`, `"C"`, `"D"`) to non-empty rationale strings explaining why the selected distractor is wrong (or why the right option is right).
- Displayed immediately in Adaptive Practice and Retention Review after tapping **Check Answer**.
- Blank or out-of-range keys are ignored; `auditBank()` tracks items missing `optionAnalysis` via `missingOptionAnalysisCount`.

---

## 10. Question Pool Allocation (`questionPool`)
Accepted values:
- `GENERAL` (default): Eligible for Initial Assessment, Adaptive Practice, Retention Review, and Full Simulation.
- `PRACTICE`: Eligible for Adaptive Practice, Retention Review, and Remediation; excluded from reserved-only exam pools when dedicated pools exist.
- `ASSESSMENT`: Eligible for Initial Assessment (diagnostics) and fallback full simulations; excluded from routine Adaptive Practice when `PRACTICE`/`GENERAL` items exist.
- `FULL_EXAM_RESERVED`: Strictly **excluded** from Initial Assessment, Adaptive Practice, Remediation, and Retention Review so full timed mock exams remain unseen.

---

## 11. Duplicate Prevention (`id` and `nearDuplicateGroupId`)
- **Exact Duplicate Prevention**: Every `id` must be unique within `csc-part-1` (enforced fail-closed at parse time). Within any generated session, no `question.id` is selected twice.
- **Near-Duplicate Suppression**: Assign identical `nearDuplicateGroupId` values to paraphrased stems, reversed true/false variants, or identical numeric-template calculations. `AdaptivePracticeEngine` avoids selecting multiple items from the same `nearDuplicateGroupId` in the same session or immediate remediation step while distinct alternatives exist.

---

## 12. Syllabus Edition (`syllabusEdition` and `bankVersion`)
- `syllabusEdition`: Authoritative CSI Volume 1 edition/cycle verified by the content producer (never guessed).
- `bankVersion`: Content release version (e.g., `"2026.1"`), persisted alongside `modelVersion` (`"offline-mastery-v1"`) on `simulation_scores` and `topic_mastery` rows so future bank updates remain auditable.

---

## 13. Valid Schema v2 Example (Illustrative Structure Only — Verify IDs Against Official CSI Syllabus)

```json
{
  "schemaVersion": 2,
  "examId": "csc-part-1",
  "bankVersion": "2026.1",
  "syllabusEdition": "<VERIFY_OFFICIAL_CSI_CSC_VOL1_EDITION>",
  "questions": [
    {
      "id": "csc1_sample_001",
      "domainId": "<VERIFY_CSI_DOMAIN_ID>",
      "domainName": "<VERIFY_CSI_DOMAIN_NAME>",
      "topicId": "<VERIFY_CSI_TOPIC_ID>",
      "topicName": "<VERIFY_CSI_TOPIC_NAME>",
      "objectiveId": "<VERIFY_CSI_OBJECTIVE_ID>",
      "learningObjective": "Distinguish federal self-regulatory oversight (CIRO) from provincial statutory commissions.",
      "questionType": "MULTIPLE_CHOICE",
      "questionPool": "PRACTICE",
      "nearDuplicateGroupId": "grp_ciro_mandate",
      "difficulty": "MEDIUM",
      "questionText": "Which organization serves as Canada's national self-regulatory organization overseeing both investment dealers and mutual fund dealers?",
      "options": [
        "Canadian Investment Regulatory Organization (CIRO)",
        "Office of the Superintendent of Financial Institutions (OSFI)",
        "Canada Deposit Insurance Corporation (CDIC)",
        "Financial Consumer Agency of Canada (FCAC)"
      ],
      "correctIndex": 0,
      "explanation": "CIRO (formed by the amalgamation of IIROC and MFDA) is the pan-Canadian SRO overseeing investment dealers, mutual fund dealers, and trading activity on Canadian debt and equity marketplaces.",
      "optionAnalysis": {
        "A": "Correct: CIRO is the unified SRO formed from IIROC and the MFDA.",
        "B": "OSFI prudentially regulates federally regulated financial institutions (banks, insurers), not dealer SRO conduct.",
        "C": "CDIC provides deposit insurance on eligible deposits at member institutions.",
        "D": "FCAC supervises federally regulated financial entities for consumer protection compliance."
      },
      "citation": {
        "title": "CSC Volume 1",
        "sectionOrPage": "Chapter 2: The Canadian Regulatory Environment",
        "standardOrFramework": "CSC Part 1"
      }
    }
  ]
}
```

> **Validation Gate**: Generated JSON must validate against `docs/csc_part1_question_schema.json`, parse cleanly via `EmbeddedExamBank.parseWithMetadata(json, "csc-part-1")`, and pass `auditBank()` with `unmappedTopicQuestionCount == 0`, `missingObjectiveCount == 0`, and `missingOptionAnalysisCount == 0`.
