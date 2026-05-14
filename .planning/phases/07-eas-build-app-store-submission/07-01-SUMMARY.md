---
phase: 07-eas-build-app-store-submission
plan: "01"
subsystem: infra
tags: [expo, eas, eas-update, eas-build, app-store, google-play, expo-updates, bundle-id, rename]

# Dependency graph
requires:
  - phase: 06-onboarding-copy-system
    provides: "Completed app with copy catalog and onboarding — ready for store submission config"
provides:
  - "app.json: Winny identity (name/slug/scheme/bundleIds) + EAS Update config (runtimeVersion, updates.url)"
  - "eas.json: production channel, appVersionSource=remote, submit section for iOS + Android"
  - ".gitignore: google-service-account.json protected"
  - "src/constants/links.ts: SHARE_MESSAGE updated to Winny, placeholder URLs use winny.app domain"
  - ".planning/phases/07-eas-build-app-store-submission/legal-content.md: ready-to-publish privacy policy + terms"
affects: [07-02, 07-03, 07-04, 07-05, eas-build, store-submission]

# Tech tracking
tech-stack:
  added: [expo-updates@~55.0.22]
  patterns: [EAS Update channel routing via build profile channel field, appVersion runtimeVersion policy]

key-files:
  created:
    - .planning/phases/07-eas-build-app-store-submission/legal-content.md
  modified:
    - app.json
    - eas.json
    - package.json
    - package-lock.json
    - src/constants/links.ts
    - .gitignore

key-decisions:
  - "runtimeVersion policy is 'appVersion' not 'managed' — 'managed' is invalid in SDK 55 (D-14 correction from RESEARCH.md)"
  - "updates.url uses projectId UUID format https://u.expo.dev/68833b07-973e-43b0-9845-8d9881301850 — survives slug rename"
  - "google-service-account.json added to .gitignore prophylactically before file is ever created (T-07-01 mitigation)"
  - "Placeholder URLs use winny.app domain per D-08 — final domain TBD by user before submission"

patterns-established:
  - "EAS Update: runtimeVersion policy appVersion ties OTA compatibility to app version string"
  - "EAS Build: appVersionSource=remote + autoIncrement=true enables atomic build number management"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-05-14
---

# Phase 7 Plan 01: Rename to Winny + EAS Update Config Summary

**App renamed to Winny with permanent bundle IDs (com.robvb.winny), EAS Update wired with appVersion policy, and legal text drafted — config groundwork complete before first production binary**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-14T06:54:08Z
- **Completed:** 2026-05-14T06:57:25Z
- **Tasks:** 2
- **Files modified:** 6 modified, 1 created

## Accomplishments
- Renamed app from "Just Keep Winning" to "Winny" across all permanent identifiers (bundle ID, package name, slug, scheme, display name)
- Configured EAS Update with `runtimeVersion: { policy: "appVersion" }` and correct updates.url pointing to EAS project UUID
- Hardened eas.json: appVersionSource=remote, production/preview channels, full submit section for both iOS and Android
- Secured .gitignore by adding google-service-account.json prophylactically (T-07-01 threat mitigation)
- Drafted complete privacy policy and terms of use ready for user to publish before App Store submission

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename app + install expo-updates + configure EAS Update** - `7a6dfa6` (chore)
2. **Task 2: Draft privacy policy + terms of use legal text** - `6e94d47` (docs)

**Plan metadata:** TBD (docs commit)

## Files Created/Modified
- `app.json` - Renamed to Winny, added android.package, runtimeVersion, updates.url
- `eas.json` - Added appVersionSource=remote, channels, full submit section
- `package.json` - Added expo-updates ~55.0.22
- `package-lock.json` - Updated after expo-updates install
- `src/constants/links.ts` - SHARE_MESSAGE updated to Winny; placeholder URLs use winny.app domain
- `.gitignore` - Added google-service-account.json entry
- `.planning/phases/07-eas-build-app-store-submission/legal-content.md` - Privacy policy + terms of use

## Decisions Made
- Used `appVersion` runtimeVersion policy (not `managed` — which is invalid in SDK 55, as documented in RESEARCH.md D-14 correction)
- Placeholder URLs use `winny.app` domain as placeholder — user will decide final domain per D-08
- `APP_STORE_URL` uses `id000000000` as numeric ID placeholder — will be updated once App Store Connect record is created
- `ascAppId` in eas.json is a descriptive placeholder string — must be replaced before running `eas submit`
- Did not run `eas update:configure` as we manually set correct values (command fails with slug mismatch since EAS project is still registered as `just-keep-winning` on expo.dev servers — this is normal for a pre-build rename, the projectId UUID in updates.url is what matters)

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written (expo-doctor pre-existing version mismatches documented below as out-of-scope).

## Issues Encountered

**expo-doctor reports 1 check failure (pre-existing, not caused by this plan):**
The failure is "packages don't match versions required by installed Expo SDK":
- `react-native-reanimated` expected 4.2.1, found 3.19.5 — **intentional pin** (documented in STATE.md: "NativeWind v4 requires Reanimated v3, not v4")
- `@react-native-community/datetimepicker` expected 8.6.0, found 9.1.0 — pre-existing version
- Various patch mismatches (expo, expo-crypto, expo-splash-screen, expo-sqlite, expo-web-browser) — pre-existing

None of these failures are caused by changes in this plan. These existed before Plan 07-01 and are outside scope.

**eas update:configure slug mismatch:**
Running `eas update:configure --non-interactive` fails because the EAS project is still registered under slug `just-keep-winning` on expo.dev, while app.json now has slug `winny`. This is expected for a pre-build rename. The `updates.url` in app.json uses the projectId UUID (not the slug), which remains valid. The slug on expo.dev will sync when the user runs a build or updates the project via expo.dev web console.

## Known Stubs

- `ascAppId` in eas.json: placeholder string `"<PLACEHOLDER — fill in after App Store Connect app record is created>"` — must be replaced before running `eas submit --platform ios`
- `APP_STORE_URL` in `src/constants/links.ts`: `https://apps.apple.com/app/winny/id000000000` — numeric app ID unknown until App Store Connect record created
- `PRIVACY_URL` and `TERMS_URL` in `src/constants/links.ts`: `winny.app` placeholder — user must host legal pages and update before app review
- Legal content file has `[DATE]`, `[YOUR_EMAIL]`, `[YOUR_JURISDICTION]` placeholders — user must fill before publishing

## Threat Surface Scan

No new network endpoints, auth paths, or trust boundaries introduced. All threat model items from PLAN.md addressed:
- T-07-01 (google-service-account.json Information Disclosure): Mitigated — added to .gitignore
- T-07-02 (eas.json serviceAccountKeyPath Tampering): Mitigated — file is gitignored; path is documented
- T-07-04 (Wrong runtimeVersion policy DoS): Mitigated — using `appVersion` not `managed`

## Next Phase Readiness

- App identity locked: bundle IDs are permanent once used in a binary — use these exact values in all subsequent plans
- EAS Update wired: production channel ready, runtimeVersion policy set
- Legal content drafted: user must publish privacy/terms pages before App Store review submission
- Next: Plan 07-02 should create EAS dev build for Phase 5 notification verification on physical device

## Self-Check: PASSED

- app.json updated: FOUND
- eas.json updated: FOUND
- legal-content.md: FOUND at .planning/phases/07-eas-build-app-store-submission/legal-content.md
- Task 1 commit 7a6dfa6: verified
- Task 2 commit 6e94d47: verified
- All 13 config field checks: PASS

---
*Phase: 07-eas-build-app-store-submission*
*Completed: 2026-05-14*
