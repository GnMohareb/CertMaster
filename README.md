# CertMaster: unified source review bundle

**Status: Source packages collected and compared; cross-platform integration NOT complete.**

This bundle preserves both original AI Studio exports in separate paths:

- `apps/web/` — the **CertMaster Web Platform** export (`certmaster-web-platform.zip`).
- `apps/android/` — the **CertMaster Android** export (`certmaster.zip`). This export includes both native Kotlin code (`app/`) and a separate React/Vite preview (`src/`). The preview must not be confused with the actual Web Platform in `apps/web/`.
- `docs/integration_audit.md` — verified integration blockers found by static inspection.
- `docs/implementation_brief.md` — agent-ready corrective task, intended for a coding agent with access to BOTH folders at once.

**Nothing in this bundle has been connected to the live Firebase project, migrated, deployed or passed a device-level Android/web end-to-end test.** Original source files are preserved as provided.

## Critical cautions

- DO NOT deploy either set of `firestore.rules` unchanged. They are incompatible, and their authorization model permits unverified subscription upgrades.
- DO NOT publish the current mock synchronization flows as working cloud functionality.
- DO NOT initialize Android on the default Firestore database when the agreed canonical resource is the named database configured by the web project.
- DO NOT overwrite production student data with either application's sample profiles or exam attempts.

**Use `apps/web` as the web UI source and `apps/android/app` as the native Android UI source; reconcile shared models and backend deliberately.**

## Source-based web UX review

Read `docs/web_ux_navigation_audit.md` before changing any web UI. The existing web navigation requires a learner-centered restructuring. Antigravity should implement and test that restructuring without rebuilding the product or removing features. This package is an integration/audit starting point, not an already repaired app.
