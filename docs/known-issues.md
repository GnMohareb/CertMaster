# CertMaster — Known Issues, External Blockers & Post-Launch Roadmap

**Last Updated**: 2026-10-30

---

## 1. External Operator Blockers (Require Human Credentials / Console Access)

1. **Android OAuth SHA-1 Registration & `google-services.json` Download**:
   - **Status**: Programmatic `FirebaseOptions` initialization (`SharedAuthManager.ensureFirebaseAppInitialized`) and Web OAuth Client ID (`814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com`) are configured in code, and `apps/android/debug.keystore` has been generated (`SHA-1: 16:CE:BD:B7:A9:96:10:2D:B4:B0:F4:8C:AA:29:98:15:DC:57:F9:16`).
   - **External Action Required**: The project owner must add the Android package `com.aistudio.examprep.kmwqxr` and the debug/release SHA-1 fingerprints in the Firebase Console (`gen-lang-client-0788513176`) for live Google Credential Manager ID token issuance on Android devices.
2. **Production Firestore Security Rules Deployment**:
   - **Status**: `apps/web/firestore.rules` and `apps/android/firestore.rules` are hardened and pass all 14 Dirty Dozen & Entitlement Escalation tests locally.
   - **External Action Required**: Deploying rules to the live named database (`ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001`) requires operator `firebase login` authentication and explicit deployment approval.
3. **Production Payment Gateway Secrets (`CERTMASTER_PAYMENT_WEBHOOK_SECRET`)**:
   - **Status**: Cryptographic HMAC-SHA256 webhook verification (`X-CertMaster-Webhook-Signature`) and gated Sandbox testing (`X-CertMaster-Sandbox-Mode: true`) are implemented and verified in `POST /api/subscriptions/verify`.
   - **External Action Required**: Connect live Stripe webhook signing secret / Google Play Developer API service account credentials in production environment variables before accepting live customer payments.
4. **Live Gemini API Key (`GEMINI_API_KEY`)**:
   - **Status**: `POST /api/ai/tutor` supports live `@google/genai` (`gemini-2.5-flash`) when `GEMINI_API_KEY` is set, and explicitly labels responses as `LOCAL_GROUNDED_FALLBACK` (`isSimulatedFallback: true`) when `GEMINI_API_KEY` is absent.
   - **External Action Required**: Set `GEMINI_API_KEY` in the production server environment to activate live generative AI tutoring.

---

## 2. Content Expansion Roadmap

- **Current Bundled Content**:
  - **6 Certifications (`SAMPLE_CONTENT_AVAILABLE`)**: `cissp` (8 Qs), `aws-saa` (5 Qs), `sec-plus` (5 Qs), `pmp` (3 Qs), `cism` (3 Qs), `ceh` (3 Qs) = **27 verified questions**, **9 study guides**, **16 flashcards**, and **8 audio briefings**.
  - **106 Certifications (`CATALOG_PREVIEW`)**: Official domain blueprints (`3–8` weighted domains per exam) with `0` practice questions.
- **Commercial Content Target**:
  - To transition each of the 6 active certifications from `SAMPLE_CONTENT_AVAILABLE` to `LIMITED_PREPARATION` (`>= 25` Qs) and `FULL_PREPARATION_AVAILABLE` (`>= 100` Qs), author or import domain-reviewed item banks into `multiExamQuestions.ts` / Firestore `/catalog/{examId}/questions`. The `classifyExamContentAvailability()` function will automatically upgrade the status badge once the objective thresholds are met.
