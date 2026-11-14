# Standalone Android exam distribution

This branch isolates an offline-first Android exam product from the unified CertMaster web/Firebase/QIS ecosystem. The original main branch remains unchanged.

## Release contract
- Android Kotlin/Jetpack Compose is the shipping client; do not ship the React preview in apps/android/src.
- A distinct product flavor/applicationId per exam; retain the existing full flavor only as a development reference.
- Package an exam-specific, versioned question bank as a read-only asset in each flavor. Never substitute questions from another certification.
- All practice, timed exams, answers, explanations, flashcards, study plans, scores, history and progress must work with airplane mode enabled.
- Persist attempts and progress in local Room storage, with deterministic migrations and restart recovery.
- Disable Firebase Auth, Firestore, QIS, web API sync, web companion prompts, and cloud-status claims in standalone builds.
- Do not bundle secrets or any content without distribution rights.
- Any purchase/entitlement feature must not claim payment verification when offline; commercial licensing is a separate release decision.
- Keep the existing CertMaster web/mobile integration behavior unchanged on main.

## Acceptance tests
1. Clean install, first launch, and complete an exam with no network permission or connection.
2. Restart device; resume incomplete exam and verify previous answers.
3. Verify each flavor contains only its own exam's questions and matching branding.
4. Validate question-bank manifest, unique IDs, answer indices, explanations, and source/licensing metadata at build time.
5. Verify no calls to Firebase, QIS, web backend, or subscription sync during offline workflows.
6. Build, run Android unit tests, and install on a physical Android device.

## Status
Architecture contract committed. Standalone implementation, asset packaging, Gradle build verification, and physical-device testing are pending.
