# CSC Part 1 Question Bank & Adaptive Coverage Audit

**Date**: 2026-11-15  
**Target Flavor**: `cscPart1` (`BuildConfig.TARGET_EXAM_ID = "csc-part-1"`)  
**Scope**: Offline standalone Android build (`apps/android/`)

---

## 1. Current Verified Asset State

- **Asset File (`apps/android/app/src/cscPart1/assets/exams/csc-part-1.json`)**: **Present — 474 Topic & Domain Practice + Diagnostic Questions & 4 Full Timed Exam Simulations (`bankVersion = "2026.3-diagnostic-54-practice-474-sims-4"`, Schema v2)**.
  - Imported losslessly from the user-supplied `CSC Part 1 Practice Question Bank by Domain and Topic.md` and synchronized with the 4 Exam 1 simulation papers (`Practice Exam 3`, `Practice Exam 4`, `Practice Exam 5`, `Practice Exam 6` — verified `0` mismatches across all `400` questions):
    - `400` verified Practice Exam `P3`–`P6` items (`questionPool = "PRACTICE"`, also mapped into 4 ordered 100-question `simulationPapers`: `csc1_exam_3`..`csc1_exam_6`)
    - `54` Readiness Diagnostic `DX-001`–`DX-054` items (`questionPool = "GENERAL"`, with full per-option rationales & learning objectives)
    - `20` Batch 01 `V1-ADD-001`–`V1-ADD-020` items (`questionPool = "PRACTICE"`, with explicit difficulty estimates, per-option rationales, calculation working, assumptions/dates, and CSI Volume 1 learning objectives)
  - **Explicit Exclusion of Practice Exam 2**: User-supplied `CSC Practice Exam 2` (`Investment Analysis`, `Portfolio Analysis`, `Mutual Funds`, `ETFs`, `Alternative/Managed/Structured Products`, `Canadian Taxation`, `Fee-Based Accounts`, `Institutional Client`) belongs to **CSC Part 2 / Volume 2** and is intentionally excluded from `csc-part-1.json`.
  - **Timed Simulation Mode (`simulationPapers`)**: `csc1_exam_3`, `csc1_exam_4`, `csc1_exam_5`, and `csc1_exam_6` each run `100` ordered questions under a `120`-minute strict exam timer (no immediate `Check Answer` feedback until submit) matching the supplied Exam 1 blueprint weights (`15, 13, 12, 11, 13, 10, 10, 8, 8`).
  - `EmbeddedExamBank.loadWithMetadata(context, "missing-exam-id")` continues to fail closed with `IllegalStateException`, and unattached repositories expose empty lists with zero CISSP fallback.
- **Syllabus Basis & Exam 1 Domain Weights (`sum = 100%`)**:
  - `syllabusEdition`: `"CSC Volume 1 (2025 printing)"`
  - `csc-d1`: Canadian Investment Marketplace — `15%` (`69` Qs, `4` topics)
  - `csc-d2`: The Economy — `13%` (`64` Qs, `7` topics)
  - `csc-d3`: Fixed-Income Features and Types — `12%` (`55` Qs, `5` topics)
  - `csc-d4`: Fixed-Income Pricing and Trading — `11%` (`52` Qs, `6` topics)
  - `csc-d5`: Common and Preferred Shares — `13%` (`60` Qs, `5` topics)
  - `csc-d6`: Equity Transactions — `10%` (`46` Qs, `4` topics)
  - `csc-d7`: Derivatives — `10%` (`47` Qs, `3` topics)
  - `csc-d8`: Corporations and Financial Statements — `8%` (`42` Qs, `5` topics)
  - `csc-d9`: Financing and Listing Securities — `8%` (`39` Qs, `4` topics)
- **Catalog Metadata (`ExamCatalog.CSC_PART_1`)**:
  - `id`: `"csc-part-1"`
  - `shortCode`: `"CSC Part 1"`
  - `passingScorePercent`: `60`
  - `durationMinutes`: `120`
  - `domains`: Derived dynamically from `csc-part-1.json` + supplied `syllabusWeights` via `ExamCatalog.deriveDomainsFromQuestions`.

---

## 2. Diagnostic Summary from `EmbeddedExamBank.auditBank`

With the 474-question practice bank and 4 timed Exam 1 simulations bundled:
- `totalQuestions`: `474`
- `practiceEligibleCount`: `474` (`420` `PRACTICE` + `54` `GENERAL`)
- `assessmentEligibleCount`: `474` eligible overall; dedicated Initial Assessment uses exactly the 54 ordered `diagnosticQuestionIds` across all 9 domains
- `reservedFullExamCount`: `0`
- `simulationPapersCount`: `4` (**CSC Practice Exams 3, 4, 5, and 6 — 100 Qs / 120 min each**)
- `domainsCount`: `9`
- `topicsCount`: `43` (100% mapped; browsable by domain and per-topic in `ExamsHubScreen`)
- `unmappedTopicQuestionCount`: `0`
- `missingObjectiveCount`: `400` (`74` `DX` + `V1-ADD` items have explicit LOs; `400` `P3`–`P6` items omit unverified LO fields rather than fabricating them)
- `missingOptionAnalysisCount`: `400` (`74` `DX` + `V1-ADD` items have full 4-option rationales; `400` `P3`–`P6` items show concise `explanation` rationales)
- `missingExplicitDifficultyCount`: `454` (`20` `V1-ADD` items include explicit editorial difficulty; `454` uncalibrated `P3`–`P6`/`DX` items use neutral `1.0` weighting)
- `usesSyllabusWeights`: `true`
- `coverageDescription`: `"Weighted by supplied syllabus weights across 9 domain(s)."`

---

## 3. Remaining Authoritative Content Pending

1. **Unseen Reserve Mock Exams (`FULL_EXAM_RESERVED`, Optional)**: Exams 3–6 currently share stems with the topic-grouped `PRACTICE` pool so learners can drill by topic OR take full 100-question 120-minute timed simulations. If completely unseen reserve papers (`Exam 1`/`Exam 2` Vol. 1 variants) are supplied later, add them as `FULL_EXAM_RESERVED` questions plus `simulationPapers` entries.
2. **Optional Metadata Enrichment on `P3`–`P6`**: Explicit per-option distractor notes and explicit chapter/LO tags for the 400 `P3`–`P6` items remain optional quality upgrades.


## Completion corrections

Initial Assessment uses the original 54 DX IDs in source order; retakes retain the first completed baseline. Timed practice papers reuse 400 practice questions. Each paper displays its previously-practised count before launch; scores are not unseen readiness estimates. The supplied 2025 printing label and domain weights are user-content provenance, not independent CSI verification. Domain/topic IDs are application identifiers. Exam 2 exclusion follows the source-content audit recorded above, not its filename. Device/emulator QA remains unexecuted.
