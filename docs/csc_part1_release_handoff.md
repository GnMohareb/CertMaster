# CSC Part 1 — Production Release Handoff

## Scope & Versioning

- **Application ID**: `com.certmaster.cscpart1` (`cscPart1` flavor only)
- **Version**: `versionCode = 2`, `versionName = "1.0.1"` (all other flavors retain `versionCode = 1`, `versionName = "1.0"`)
- **Unchanged**: UI/theme, 474-question bank (`csc-part-1.json`), 54-question ordered diagnostic, 4 timed practice papers (`csc1_exam_3`–`csc1_exam_6`), adaptive mastery engine, Room v5 schema/migrations, backup configuration, `apps/web/`, and `main`.
- **Minification (`isMinifyEnabled = false`)**: Kept disabled intentionally for initial release simplicity (R8/shrinking is an optional future optimization, not a public-release blocker).

---

## Verified Debug Baseline (Current Evidence)

- **Branch / Commit**: `feature/standalone-android-offline-exams` @ `78a1ed2be4805bc9329586cb8a8952f2a15c3782`
- **Debug CI Run**: [`44112472219`](https://github.com/GnMohareb/CertMaster/actions/runs/44112472219) — `:app:testCscPart1DebugUnitTest` PASS, `:app:assembleCscPart1Debug` PASS, independent offline permission/dependency checks PASS.
- **Debug Artifacts**:
  - APK: [`14342230676`](https://github.com/GnMohareb/CertMaster/actions/runs/44112472219/artifacts/14342230676)
  - Verification Reports: `14342220570`
- Existing debug CI (`.github/workflows/csc-part1-android.yml`) remains active and unchanged.
- **Important**: The passing debug CI build does **not** verify release signing or production `.aab` / `.apk` assembly; that requires running either `.github/workflows/csc-part1-release.yml` (once its workflow definition is available on `main`) or an exact-branch local release build with real signing credentials.

---

## GitHub Actions Release Workflow Availability & Secrets

- **Default-Branch Prerequisite (`workflow_dispatch`)**: GitHub Actions only allows `workflow_dispatch` runs for workflows whose definition exists on the repository's default branch (`main`). Because `main` is preserved untouched in this branch-scoped integration, `.github/workflows/csc-part1-release.yml` on `feature/standalone-android-offline-exams` is **prepared, not yet dispatchable**, until a separate reviewed integration adds the workflow definition to `main`.
- Once `.github/workflows/csc-part1-release.yml` is available on `main`, configure these secrets in **GitHub Settings → Secrets and variables → Actions** before running **CSC Part 1 Android Production Release**:

| Secret Name | Purpose |
| :--- | :--- |
| `CSC_UPLOAD_KEYSTORE_BASE64` | Base64-encoded production upload keystore (`.jks` or PKCS12) containing key alias `upload` |
| `CSC_UPLOAD_STORE_PASSWORD` | Store password for the upload keystore |
| `CSC_UPLOAD_KEY_PASSWORD` | Key password for alias `upload` |

The workflow fails immediately before building if any secret name is missing, never falls back to `debug.keystore`, never commits or prints secrets, and deletes the temporary keystore file in `$RUNNER_TEMP` on both success and failure (`if: always()`).

---

## Signing Continuity

- `apps/android/app/build.gradle.kts` (`signingConfigs.release`) expects key alias **`upload`** via `KEYSTORE_PATH`, `STORE_PASSWORD`, and `KEY_PASSWORD`.
- Generate or reuse **one permanent upload keystore** offline outside the repository and keep an encrypted offline backup.
- Enroll the app in **Google Play App Signing** on first Play Console upload so Google manages the Play App Signing key while your `upload` key signs every future `.aab` update.
- Never replace an already-registered upload key unless performing an official Play Console upload-key reset.

---

## Option A: Manual GitHub Actions Release (After Reviewed Default-Branch Integration)

1. Make `.github/workflows/csc-part1-release.yml` available on the repository default branch (`main`) through a reviewed integration.
2. Prepare the production upload keystore locally (key alias `upload`) and base64-encode it without committing it (e.g., `base64 -w 0 my-upload-key.jks`).
3. Add `CSC_UPLOAD_KEYSTORE_BASE64`, `CSC_UPLOAD_STORE_PASSWORD`, and `CSC_UPLOAD_KEY_PASSWORD` to GitHub repository secrets.
4. In GitHub **Actions**, select **CSC Part 1 Android Production Release** (`csc-part1-release.yml`) and trigger **Run workflow** targeting branch `feature/standalone-android-offline-exams`.
5. Verify workflow completion and inspect `CSC-Part1-Release-Verification-Reports` (release `apksigner`/`jarsigner` non-debug signature check, `versionCode='2'` / `versionName='1.0.1'`, zero `INTERNET`/`ACCESS_NETWORK_STATE` permissions, zero cloud runtime dependencies, and byte-exact `csc-part-1.json` packaging inside both `.aab` and `.apk`).
6. Download `CSC-Part1-Release-AAB` (for Google Play) and `CSC-Part1-Release-APK` (for direct/sideload QA).

---

## Option B: Exact-Branch Local Release Build (Immediate Alternative Without Modifying `main`)

Before `.github/workflows/csc-part1-release.yml` is present on `main`, an operator can build signed release artifacts directly from a clean checkout of `feature/standalone-android-offline-exams` using the existing `signingConfigs.release` environment variables (never print, echo, log, or commit secrets):

1. Provide the three signing environment variables in a local shell session (e.g., via `read -rs` prompts rather than shell history) pointing to your permanent upload keystore with alias `upload`:
   - `KEYSTORE_PATH` (path to the local upload keystore)
   - `STORE_PASSWORD`
   - `KEY_PASSWORD`
2. From `apps/android/`, run the unit tests and build the signed release AAB and APK:
   - `gradle :app:testCscPart1DebugUnitTest --stacktrace --no-daemon --max-workers=2`
   - `gradle :app:bundleCscPart1Release :app:assembleCscPart1Release --stacktrace --no-daemon --max-workers=2`
3. Verify the generated artifacts before distribution:
   - Signatures (confirm non-debug certificate): `apksigner verify --print-certs app/build/outputs/apk/cscPart1/release/app-cscPart1-release.apk` and `jarsigner -verify -verbose -certs app/build/outputs/bundle/cscPart1Release/app-cscPart1-release.aab`
   - Metadata & offline isolation: `aapt dump badging` confirms `package: name='com.certmaster.cscpart1'`, `versionCode='2'`, `versionName='1.0.1'`; `aapt dump permissions` confirms zero `INTERNET` or `ACCESS_NETWORK_STATE`; `gradle :app:dependencies --configuration cscPart1ReleaseRuntimeClasspath` confirms zero cloud runtime dependencies; packaged `csc-part-1.json` inside both `.apk` and `.aab` matches `app/src/cscPart1/assets/exams/csc-part-1.json`.
4. Unset `KEYSTORE_PATH`, `STORE_PASSWORD`, and `KEY_PASSWORD` in the shell once finished.

---

## Pending Real-Device & Store Evidence

- **Physical-Device / Emulator QA (Pending)**: Install the release APK or Play Internal Testing build on Android hardware in **airplane mode** across both **system light and system dark modes** to verify cold-start `#FAF9F6` window/bar contrast, Warm Off-White/Cream UI wrapping, 54-question diagnostic baseline/retakes, 4×100-question timed papers, adaptive remediation, process-kill Room v5 persistence, and back navigation.
- **Google Play Console Submission (Pending)**: Developer account setup, Privacy Policy URL & Data Safety declaration (matching zero permissions / local-only storage), content-rights clearance for the supplied bank, store listing assets/screenshots, Play App Signing enrollment, and Internal/Closed Testing release of `app-cscPart1-release.aab`.
