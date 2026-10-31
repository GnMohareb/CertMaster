# CertMaster — Evidence-Based Certification Content Audit

**Audit Date**: 2026-10-30  
**Scope**: All 112 Certifications in the Unified CertMaster Catalog (`apps/web/src/data/examBanks.ts`, `apps/web/src/data/multiExamQuestions.ts`, `apps/android/app/src/main/java/com/example/data/ExamCatalog.kt`, `apps/android/app/src/main/java/com/example/data/DefaultQuestions.kt`)

---

## 1. Objective Content Classification Thresholds

To prevent misleading marketing claims or inflated question bank counts in student-facing views, CertMaster enforces deterministic, evidence-based content classification across both the Web Platform (`classifyExamContentAvailability` in `apps/web/src/lib/canonicalContract.ts`) and Native Android (`ExamCatalog.classifyExamContentAvailability` in `ExamCatalog.kt`):

| Classification Status | Required Practice Questions | Required Study Guides | Required Flashcards | Required Audio Briefings | Required Domain Blueprints |
| --- | --- | --- | --- | --- | --- |
| **`FULL_PREPARATION_AVAILABLE`** | `>= 100` | `>= 4` | `>= 20` | `>= 1` | `>= 3` |
| **`LIMITED_PREPARATION`** | `>= 25` | `>= 2` | `>= 8` | `>= 0` | `>= 3` |
| **`SAMPLE_CONTENT_AVAILABLE`** | `>= 3` | `>= 1` | `>= 1` | `>= 0` | `>= 3` |
| **`CATALOG_PREVIEW`** | `< 3` (`0`) | `0` | `0` | `0` | `>= 1` (`3–8`) |
| **`CONTENT_COMING_SOON`** | `0` | `0` | `0` | `0` | `0` |

---

## 2. Verified Content Audit of the 6 Sample-Content Certifications

Prior to Phase 7, the catalog metadata in `apps/web/src/data/examBanks.ts` and `apps/android/app/src/main/java/com/example/data/ExamCatalog.kt` advertised `150` to `2,250` practice questions and labeled these 6 certifications as `FULL_PREP`. Independent source code inspection confirmed that the repository actually contains **27 domain-verified sample questions**, **9 study guides**, **16 Leitner flashcards**, and **8 audio briefings** across these 6 certifications.

All 6 certifications have been reclassified to **`SAMPLE_CONTENT_AVAILABLE`**, and both Web and Android UI components now display the **exact bundled question counts**:

| Canonical Exam ID | Legacy Aliases | Certification Title | Vendor | Bundled Questions (Web & Android) | Study Guides | Flashcards | Audio Briefings | Domain Blueprints |Simulator Modes | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **`cissp`** | `cissp-2024` | Certified Information Systems Security Professional | (ISC)² | **8** | **4** | **8** | **3** | **8** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **`aws-saa`** | `aws_csa`, `saa-c03` | AWS Certified Solutions Architect – Associate | Amazon Web Services | **5** | **1** | **3** | **1** | **4** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **`sec-plus`** | `sec_plus`, `sy0-701`, `secplus` | CompTIA Security+ (SY0-701) | CompTIA | **5** | **1** | **2** | **1** | **5** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **`pmp`** | `pmp-2024` | Project Management Professional | PMI | **3** | **1** | **1** | **1** | **3** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **`cism`** | `cism-2024` | Certified Information Security Manager | ISACA | **3** | **1** | **1** | **1** | **4** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **`ceh`** | `ceh-v12` | Certified Ethical Hacker v12 | EC-Council | **3** | **1** | **1** | **1** | **4** | Quick Practice, Domain Drill, Full Timed Mock, Calibration | `SAMPLE_CONTENT_AVAILABLE` |
| **Subtotal (6 Active Tracks)** | — | — | — | **27 Verified Questions** | **9 Guides** | **16 Cards** | **8 Briefings** | **28 Domains** | **All 4 Modes** | **`SAMPLE_CONTENT_AVAILABLE`** |

---

## 3. Verified Content Audit of the 106 Catalog Preview Certifications

The remaining **106 certifications** in `ALL_112_EXAM_BANKS` (`gcp-pca`, `az-104`, `az-900`, `ccsp`, `ccnp-encor`, `ccna`, `cka`, `ckad`, `cks`, `terraform-assoc`, `net-plus`, `a-plus`, `cysa-plus`, `pentest-plus`, `casp-plus`, `linux-plus`, `cloud-plus`, `data-plus`, `project-plus`, `itil-4-foundation`, `crisc`, `cisa`, `cdpse`, `oscp`, `giac-gsec`, `giac-gcih`, `giac-gpen`, `rhcsa`, `rhce`, `sc-200`, `sc-300`, `sc-100`, `az-500`, `az-305`, `az-204`, `az-400`, `dp-203`, `ai-102`, `aws-clf`, `aws-dva`, `aws-soa`, `aws-sap`, `aws-dop`, `aws-scs`, `aws-ans`, `aws-mls`, `aws-das`, `gcp-ace`, `gcp-pde`, `gcp-pse`, `gcp-pcne`, `gcp-pmle`, `gcp-pcd`, `gcp-pdevops`, `psm-1`, `psm-2`, `pspo-1`, `safe-agilist`, `pmi-acp`, `capm`, `pgmp`, `pfmp`, `prince2-foundation`, `prince2-practitioner`, `six-sigma-green`, `six-sigma-black`, `togaf-10`, `cobit-2019`, `cbap`, `ecba`, `ccba`, `sf-admin`, `sf-app-builder`, `sf-pd1`, `sf-architect`, `servicenow-csa`, `servicenow-cad`, `servicenow-cis-itsm`, `splunk-core-user`, `splunk-power-user`, `splunk-enterprise-admin`, `snowflake-core`, `snowflake-architect`, `databricks-de-assoc`, `databricks-de-pro`, `databricks-ml-assoc`, `hashicorp-vault-assoc`, `hashicorp-consul-assoc`, `docker-dca`, `github-actions`, `github-admin`, `github-advanced-security`, `gitlab-associate`, `prometheus-pca`, `istqb-ctfl`, `oca-java-17`, `ocp-java-21`, `pcap-python`, `pcep-python`, `jsnad-node`, `jsnsd-node`, `mongodb-dba`, `mongodb-dev`, `redis-certified-dev`, `neo4j-certified-pro`, `elastic-engineer`) contain:
- **Practice Questions**: `0` (`questionsCount: 0`)
- **Study Guides**: `0`
- **Flashcards**: `0`
- **Audio Briefings**: `0`
- **Official Domain Blueprints**: `3` to `8` weighted domains per certification
- **Classification**: **`CATALOG_PREVIEW`**

### Anti-Substitution Enforcement
- `getQuestionsForExamId(examId)` in `apps/web/src/data/multiExamQuestions.ts` and `DefaultQuestions.getQuestionsForExam(examId)` in `apps/android/app/src/main/java/com/example/data/DefaultQuestions.kt` return `[]` (`emptyList()`) for all 106 `CATALOG_PREVIEW` certifications.
- CISSP questions are **never** substituted when a student selects a non-CISSP certification.
- Both Web and Android display an explicit **Catalog Blueprint Preview** screen when a student selects any of the 106 `CATALOG_PREVIEW` tracks, allowing domain weight inspection without starting a misleading exam session.
